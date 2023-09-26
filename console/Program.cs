// See https://aka.ms/new-console-template for more information
using domain;
using repository;

Console.WriteLine("Hello, World!");

new Intraday();

using var context = new DashContext();

context.Stocks.Add(new Stock()
{
    Active = true,
    Code = "AZUL4",
    Name = "Azul"
});

context.SaveChanges();

//Teste().Wait();


async Task Teste()
{
    var result = await DownloadHistoricalDataAsync("AZUL4.SA", DateTime.Parse("2017-01-02"), DateTime.Parse("2023-09-27"));

    Console.WriteLine(result);
}

async Task<HistoricalDataRecord[]?> DownloadHistoricalDataAsync(string StockSymbol, DateTime PeriodStart, DateTime PeriodEnd, int try_count = 10)
{
    //Set up
    HistoricalDataRecord[] HistoricalData = null;
    HistoricalDataDownloadResult DownloadResult = HistoricalDataDownloadResult.Downloading;


    //Get try count to use
    int trycountToUse = 10;
    if (try_count > 0)
    {
        trycountToUse = try_count;
    }

    //Get the data
    int HaveTriedCount = 0;
    while (DownloadResult != HistoricalDataDownloadResult.Successful && HaveTriedCount < try_count && DownloadResult != HistoricalDataDownloadResult.DataDoesNotExistForSpecifiedTimePeriod)
    {
        HistoricalData = await TryGetHistoricalDatAsync(StockSymbol, PeriodStart, PeriodEnd, DownloadResult);
        HaveTriedCount = HaveTriedCount + 1;
    }

    return HistoricalData;
}

async Task<HistoricalDataRecord[]> TryGetHistoricalDatAsync(string symbol, DateTime start, DateTime end, HistoricalDataDownloadResult downloadResult)
{
    DateTime RequestStart = DateTime.Now;
    HistoricalDataRecord[] HistoricalData = null;

    //Get the crumb!
    HttpClient hc = new HttpClient();
    HttpResponseMessage rm = await hc.GetAsync("https://finance.yahoo.com/quote/" + symbol);
    string web = await rm.Content.ReadAsStringAsync();
    //NEED TO HAVE A BETTER WAY TO VERIFY STOCK SYMBOL, THIS NO LONGER WORKS. 
    //COMMENTING OUT SINCE THE CODE TO DOWNLOAD WORKS WITH EXISTING SYMBOLS 
    //int loc1 = web.IndexOf("crumb\":");
    //if (loc1 == -1)
    //{
    //    throw new Exception("Unable to verify stock '" + symbol + "'.");
    //}
    //int loc1 = web.IndexOf("crumb", loc1 + 1);
    //loc1 = web.IndexOf(":", loc1 + 1);
    //loc1 = web.IndexOf("\"", loc1 + 1);
    //int loc2 = web.IndexOf("\"", loc1 + 1);
    //string crumb = web.Substring(loc1 + 1, loc2 - loc1 - 1);

    //Get the unix times
    string Unix1 = GetUnixTime(start).ToString();
    string Unix2 = GetUnixTime(end).ToString();

    //Get the info
    string urlfordata = "https://query1.finance.yahoo.com/v7/finance/download/" + symbol + "?period1=" + Unix1 + "&period2=" + Unix2 + "&interval=1d&events=history";
    HttpResponseMessage fr = await hc.GetAsync(urlfordata);
    string resptext = await fr.Content.ReadAsStringAsync();

    //Show the error if one was encountered
    if (fr.StatusCode != System.Net.HttpStatusCode.OK)
    {
        HistoricalData = null;

        //A bad request would be shown if for example the data does not exist for this stock for those dates.
        if (fr.StatusCode == System.Net.HttpStatusCode.BadRequest) //We requested data that doesnt exist. For example, getting BYND (beyond meat) data for 2015: 400 Bad Request: Data doesn't exist for startDate = 1431746344, endDate = 1437016744
        {
            downloadResult = HistoricalDataDownloadResult.DataDoesNotExistForSpecifiedTimePeriod;
        }
        else if (fr.StatusCode == System.Net.HttpStatusCode.Unauthorized) //Probably an 'Invalid cookie' message, unauthorized. So mark it as not authroized
        {
            downloadResult = HistoricalDataDownloadResult.Unauthorized;
        }
        else if (fr.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            downloadResult = HistoricalDataDownloadResult.NoDataFound;
        }
        else
        {
            downloadResult = HistoricalDataDownloadResult.OtherFailure;
        }

        return HistoricalData; //Exit
    }

    //Parse into data records
    List<HistoricalDataRecord> datarecs = new List<HistoricalDataRecord>();
    List<string> Splitter = new List<string>();
    Splitter.Add("\n");
    string[] rows = resptext.Split(Splitter.ToArray(), StringSplitOptions.None);
    int t = 0;
    for (t = 1; t <= rows.Length - 1; t++)
    {
        string thisrow = rows[t];
        if (thisrow != "")
        {
            try
            {
                HistoricalDataRecord rec = new HistoricalDataRecord();

                Splitter.Clear();
                Splitter.Add(",");
                string[] cols = thisrow.Split(Splitter.ToArray(), StringSplitOptions.None);

                rec.Date = DateTime.Parse(cols[0]);
                rec.Open = System.Convert.ToSingle(cols[1]);
                rec.High = System.Convert.ToSingle(cols[2]);
                rec.Low = System.Convert.ToSingle(cols[3]);
                rec.Close = System.Convert.ToSingle(cols[4]);
                rec.AdjustedClose = System.Convert.ToSingle(cols[5]);
                rec.Volume = System.Convert.ToInt32(cols[6]);

                datarecs.Add(rec);
            }
            catch
            {
                throw new Exception("Unable to conver this row: " + thisrow);
            }
        }
    }

    //Post it to this class
    HistoricalData = datarecs.ToArray();
    downloadResult = HistoricalDataDownloadResult.Successful;

    return HistoricalData;
}

static int GetUnixTime(DateTime timestamp)
{
    DateTime dateTime = DateTime.Parse("1/1/1970");
    return Convert.ToInt32((timestamp - dateTime).TotalSeconds);
}

public class HistoricalDataRecord
{
    public DateTime Date { get; set; }

    public float Open { get; set; }

    public float High { get; set; }

    public float Low { get; set; }

    public float Close { get; set; }

    public float AdjustedClose { get; set; }

    public int Volume { get; set; }
}

public enum HistoricalDataDownloadResult
{
    Successful,
    DataDoesNotExistForSpecifiedTimePeriod,
    Unauthorized,
    OtherFailure,
    Downloading,
    NoDataFound
}

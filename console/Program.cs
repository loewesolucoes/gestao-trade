// See https://aka.ms/new-console-template for more information
using System;
using console;
using domain;
using domain.Contracts;
using domain.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using repository;
using repository.Repositories;

Console.WriteLine("Hello, World!");

var serviceCollection = new ServiceCollection();

ConfigureServices(serviceCollection);

var serviceProvider = serviceCollection.BuildServiceProvider();

Console.WriteLine("Configure services!");

var context = serviceProvider.GetService<DashContext>();

//Teste1().Wait();
Teste().Wait();

Console.WriteLine("Run!");



async Task Teste1()
{
    var client = new HttpClient();
    var request = new HttpRequestMessage(HttpMethod.Get, "https://brapi.dev/api/quote/list");
    request.Headers.Add("Authorization", "Bearer 6NK6Do7rQJwwNeYx5V16h1");
    var response = await client.SendAsync(request);
    response.EnsureSuccessStatusCode();

    if (response.Content is object && response.Content.Headers?.ContentType?.MediaType == "application/json")
    {
        var contentStream = await response.Content.ReadAsStreamAsync();

        using var streamReader = new StreamReader(contentStream);
        using var jsonReader = new JsonTextReader(streamReader);

        JsonSerializer serializer = new JsonSerializer();

        try
        {
            var brapiresponse = serializer.Deserialize<BrapiResponse>(jsonReader);


            var stocks = brapiresponse.Stocks.Select(x => new Stock()
            {
                Active = true,
                Code = x.StockStock,
                MarketCap = x.MarketCap,
                Logo = x.Logo,
                Name = x.Name,
                Type = x.Sector != null ? StockType.COMPANY : StockType.OTHERS,
                Sector = x.Sector,
            });

            var context = serviceProvider.GetService<DashContext>();

            context.Stocks.AddRange(stocks);
            context.SaveChanges();
        }
        catch (JsonReaderException)
        {
            Console.WriteLine("Invalid JSON.");
        }
    }
    else
    {
        Console.WriteLine("HTTP Response was invalid and cannot be deserialised.");
    }
}

async Task Teste()
{
    var service = serviceProvider.GetService<IStockService>();

    if (!service.IsUpdated("AZUL4.SA", Interval.DAILY))
    {
        //var result = new List<HistoricalDataRecord>() { new HistoricalDataRecord() { Date = DateTime.Now, Close = 1, AdjustedClose = 1, High = 2, Low = .5M, Open = .7M, Volume = 1000 } };
        var result = await DownloadHistoricalDataAsync("AZUL4.SA", DateTime.Parse("1900-01-01"), DateTime.Parse("2023-09-27"));

        service.SaveHistory("AZUL4", Interval.DAILY, result.Select(x => new Intraday()
        {
            Close = x.Close,
            Max = x.High,
            Min = x.Low,
            Open = x.Open,
            Volume = x.Volume,
            AdjustedClose = x.AdjustedClose,
            Interval = Interval.DAILY,
            StockId = "AZUL4",
            Date = x.Date,
        }));
    }
}

async Task<HistoricalDataRecord[]?> DownloadHistoricalDataAsync(string StockSymbol, DateTime PeriodStart, DateTime PeriodEnd, long try_count = 3)
{
    //Set up
    HistoricalDataRecord[] HistoricalData = null;
    HistoricalDataDownloadResult DownloadResult = HistoricalDataDownloadResult.Downloading;

    //Get try count to use
    long trycountToUse = 10;
    if (try_count > 0)
    {
        trycountToUse = try_count;
    }

    //Get the data
    long HaveTriedCount = 0;
    while (DownloadResult != HistoricalDataDownloadResult.Successful && HaveTriedCount < try_count && DownloadResult != HistoricalDataDownloadResult.DataDoesNotExistForSpecifiedTimePeriod)
    {
        var tuple = await TryGetHistoricalDatAsync(StockSymbol, PeriodStart, PeriodEnd);

        HistoricalData = tuple.Item1;
        DownloadResult = tuple.Item2;
        HaveTriedCount = HaveTriedCount + 1;
    }

    return HistoricalData;
}

async Task<Tuple<HistoricalDataRecord[], HistoricalDataDownloadResult>> TryGetHistoricalDatAsync(string symbol, DateTime start, DateTime end)
{
    HistoricalDataDownloadResult downloadResult;
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

        return Tuple.Create(HistoricalData, downloadResult); //Exit
    }

    //Parse into data records
    List<HistoricalDataRecord> datarecs = new List<HistoricalDataRecord>();
    List<string> Splitter = new List<string>();
    Splitter.Add("\n");
    string[] rows = resptext.Split(Splitter.ToArray(), StringSplitOptions.None);
    long t = 0;
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
                rec.Open = System.Convert.ToDecimal(cols[1]);
                rec.High = System.Convert.ToDecimal(cols[2]);
                rec.Low = System.Convert.ToDecimal(cols[3]);
                rec.Close = System.Convert.ToDecimal(cols[4]);
                rec.AdjustedClose = System.Convert.ToDecimal(cols[5]);
                rec.Volume = System.Convert.ToDecimal(cols[6]);

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

    return Tuple.Create(HistoricalData, downloadResult);
}

void ConfigureServices(IServiceCollection services)
{
    services
        .AddDbContext<DashContext>()
        .AddScoped<IStockRepository, StockRepository>()
        .AddScoped<IStockService, StockService>()
        ;
}

static long GetUnixTime(DateTime timestamp)
{
    DateTime dateTime = DateTime.Parse("1/1/1970");
    return Convert.ToInt64((timestamp - dateTime).TotalSeconds);
}

public class HistoricalDataRecord
{
    public DateTime Date { get; set; }

    public decimal Open { get; set; }

    public decimal High { get; set; }

    public decimal Low { get; set; }

    public decimal Close { get; set; }

    public decimal AdjustedClose { get; set; }

    public decimal Volume { get; set; }
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

using System;
using domain.Contracts;

namespace domain.Services
{
    public class YahooFinanceService : IYahooFinanceService
    {
        private readonly IStockService _stockService;

        public YahooFinanceService(IStockService stockService)
        {
            _stockService = stockService;
        }

        public async Task DowloadAndSaveStock(string stockId, Interval interval)
        {
            var lastUpdate = _stockService.GetLastUpdate(stockId, interval);

            var lastUpdateDate = lastUpdate?.CreatedAt ?? DateTime.Parse("1900-01-01");

            if (lastUpdateDate < DateTime.Today)
            {
                //var result = new List<HistoricalDataRecord>() { new HistoricalDataRecord() { Date = DateTime.Now, Close = 1, AdjustedClose = 1, High = 2, Low = .5M, Open = .7M, Volume = 1000 } };
                if (lastUpdate != null)
                    _stockService.DeleteHistoryByUpdate(lastUpdate);

                var result = await DownloadHistoricalDataAsync($"{stockId}.SA", lastUpdateDate, DateTime.Today.AddDays(1));

                _stockService.SaveHistory(stockId, interval, result.Select(x => new Intraday()
                {
                    Close = x.Close,
                    Max = x.High,
                    Min = x.Low,
                    Open = x.Open,
                    Volume = x.Volume,
                    AdjustedClose = x.AdjustedClose,
                    Interval = interval,
                    StockId = stockId,
                    Date = x.Date,
                }));
            }
        }

        private async Task<YahooHistoricalDataRecord[]?> DownloadHistoricalDataAsync(string stockSymbol, DateTime periodStart, DateTime periodEnd, long try_count = 3)
        {
            //Set up
            YahooHistoricalDataRecord[]? historicalData = null;
            YahooHistoricalDataDownloadResult downloadResult = YahooHistoricalDataDownloadResult.Downloading;

            //Get the data
            int haveTriedCount = 0;

            while (downloadResult != YahooHistoricalDataDownloadResult.Successful && haveTriedCount < try_count && downloadResult != YahooHistoricalDataDownloadResult.DataDoesNotExistForSpecifiedTimePeriod)
            {
                var tuple = await TryGetHistoricalDatAsync(stockSymbol, periodStart, periodEnd);

                historicalData = tuple.Item1;
                downloadResult = tuple.Item2;
                haveTriedCount = haveTriedCount + 1;
            }

            return historicalData;
        }

        private async Task<Tuple<YahooHistoricalDataRecord[]?, YahooHistoricalDataDownloadResult>> TryGetHistoricalDatAsync(string symbol, DateTime start, DateTime end)
        {
            YahooHistoricalDataDownloadResult downloadResult;
            DateTime RequestStart = DateTime.Now;
            YahooHistoricalDataRecord[]? historicalData = null;

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
                historicalData = null;

                //A bad request would be shown if for example the data does not exist for this stock for those dates.
                if (fr.StatusCode == System.Net.HttpStatusCode.BadRequest) //We requested data that doesnt exist. For example, getting BYND (beyond meat) data for 2015: 400 Bad Request: Data doesn't exist for startDate = 1431746344, endDate = 1437016744
                {
                    downloadResult = YahooHistoricalDataDownloadResult.DataDoesNotExistForSpecifiedTimePeriod;
                }
                else if (fr.StatusCode == System.Net.HttpStatusCode.Unauthorized) //Probably an 'Invalid cookie' message, unauthorized. So mark it as not authroized
                {
                    downloadResult = YahooHistoricalDataDownloadResult.Unauthorized;
                }
                else if (fr.StatusCode == System.Net.HttpStatusCode.NotFound)
                {
                    downloadResult = YahooHistoricalDataDownloadResult.NoDataFound;
                }
                else
                {
                    downloadResult = YahooHistoricalDataDownloadResult.OtherFailure;
                }

                return Tuple.Create(historicalData, downloadResult); //Exit
            }

            //Parse into data records
            List<YahooHistoricalDataRecord> datarecs = new List<YahooHistoricalDataRecord>();
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
                        YahooHistoricalDataRecord rec = new YahooHistoricalDataRecord();

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
            historicalData = (YahooHistoricalDataRecord[]?)datarecs.ToArray();
            downloadResult = YahooHistoricalDataDownloadResult.Successful;

            return Tuple.Create(historicalData, downloadResult);
        }

        static long GetUnixTime(DateTime timestamp)
        {
            DateTime dateTime = DateTime.Parse("1/1/1970");
            return Convert.ToInt64((timestamp - dateTime).TotalSeconds);
        }
    }

    public class YahooHistoricalDataRecord
    {
        public DateTime Date { get; set; }

        public decimal Open { get; set; }

        public decimal High { get; set; }

        public decimal Low { get; set; }

        public decimal Close { get; set; }

        public decimal AdjustedClose { get; set; }

        public decimal Volume { get; set; }
    }

    enum YahooHistoricalDataDownloadResult
    {
        Successful,
        DataDoesNotExistForSpecifiedTimePeriod,
        Unauthorized,
        OtherFailure,
        Downloading,
        NoDataFound
    }
}


using System;
using System.IO;
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
            var hc = new HttpClient();

            //Get the unix times
            var Unix1 = GetUnixTime(start).ToString();
            var Unix2 = GetUnixTime(end).ToString();

            //Get the info
            var urlfordata = "https://query1.finance.yahoo.com/v7/finance/download/" + symbol + "?period1=" + Unix1 + "&period2=" + Unix2 + "&interval=1d&events=history";
            var fr = await hc.GetAsync(urlfordata);
            var stream = await fr.Content.ReadAsStreamAsync();
            var streamReader = new StreamReader(stream);

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
            var datarecs = new List<YahooHistoricalDataRecord>();

            _ = streamReader.ReadLine();

            string? line;

            while ((line = streamReader.ReadLine()) != null)
            {
                // Process line
                if (!string.IsNullOrEmpty(line))
                {
                    try
                    {
                        YahooHistoricalDataRecord rec = new YahooHistoricalDataRecord();

                        string[] cols = line.Split(',', StringSplitOptions.None);

                        rec.Date = DateTime.Parse(cols[0]);
                        rec.Open = System.Convert.ToDecimal(cols[1]);
                        rec.High = System.Convert.ToDecimal(cols[2]);
                        rec.Low = System.Convert.ToDecimal(cols[3]);
                        rec.Close = System.Convert.ToDecimal(cols[4]);
                        rec.AdjustedClose = System.Convert.ToDecimal(cols[5]);
                        rec.Volume = System.Convert.ToDecimal(cols[6]);

                        datarecs.Add(rec);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"Unable to conver this row ({symbol}): {line}");
                        Console.WriteLine(ex);
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

    class YahooHistoricalDataRecord
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


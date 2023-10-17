using backgroundjobs.Responses;
using domain;
using domain.Contracts;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Quartz;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace backgroundjobs
{
    public class BrapiIntegration : IJob
    {
        public static readonly string JOB_GROUP = "feeder";
        public static readonly JobKey JOB_KEY = new JobKey("BrapiIntegration", JOB_GROUP);
        public static readonly string JOB_TRIGGER = "brapitrigger";
        public static readonly string JOB_DESCRIPTION = "Integration into BRAPI finance";

        private readonly IStockRepository _repository;
        private readonly ILogger<BrapiIntegration> _logger;

        public BrapiIntegration(IStockRepository repository, ILogger<BrapiIntegration> logger)
        {
            _repository = repository;
            _logger = logger;
        }

        public async Task Execute(IJobExecutionContext context)
        {
            _logger.LogInformation("BrapiIntegration - inicio");

            var stock = _repository.GetLastStockAdded();

            if (stock == null || (stock.CreatedAt - DateTime.Now) >= TimeSpan.FromDays(14))
            {
                var stocks = await GetStocksFromBrapi();

                _repository.Save(stocks);

                _logger.LogInformation($"BrapiIntegration - recebeu {stocks.Count} ativos");
            }

            _logger.LogInformation("BrapiIntegration - fim");
        }

        private async Task<ICollection<Stock>> GetStocksFromBrapi()
        {
            var response = await CallBrapiApi();
            var brapiresponse = await ParseResponse(response);

            return brapiresponse.Stocks.Select(x => new Stock()
            {
                Active = false,
                Code = x.StockStock,
                MarketCap = x.MarketCap,
                Logo = x.Logo,
                Name = x.Name,
                Type = x.Sector != null ? StockType.COMPANY : StockType.OTHERS,
                Sector = x.Sector,
            }).ToList();
        }

        private async Task<BrapiResponse> ParseResponse(HttpResponseMessage response)
        {
            var contentStream = await response.Content.ReadAsStreamAsync();

            using var streamReader = new StreamReader(contentStream);
            using var jsonReader = new JsonTextReader(streamReader);

            JsonSerializer serializer = new JsonSerializer();
            var brapiresponse = serializer.Deserialize<BrapiResponse>(jsonReader);

            if (brapiresponse == null)
                throw new InvalidOperationException("brapiresponse can't be null");

            return brapiresponse;
        }

        private async Task<HttpResponseMessage> CallBrapiApi()
        {
            _logger.LogInformation("BrapiIntegration - starting CallBrapiApi");

            var client = new HttpClient();
            var request = new HttpRequestMessage(HttpMethod.Get, "https://brapi.dev/api/quote/list");
            var response = await client.SendAsync(request);

            request.Headers.Add("Authorization", "Bearer 6NK6Do7rQJwwNeYx5V16h1");
            response.EnsureSuccessStatusCode();

            if (response.Content is null || (response.Content.Headers?.ContentType?.MediaType) != "application/json")
            {
                _logger.LogError("HTTP Response was invalid and cannot be deserialised.");
                throw new InvalidOperationException("Invalid BRAPI call");
            }

            _logger.LogInformation("BrapiIntegration - end CallBrapiApi");

            return response;
        }
    }
}

using domain;
using domain.Contracts;
using Microsoft.Extensions.Logging;
using Quartz;
using System;

namespace backgroundjobs
{
    public class YahooIntegration : IJob
    {
        public static readonly string JOB_GROUP = "feeder";
        public static readonly JobKey JOB_KEY = new JobKey("YahooIntegration", JOB_GROUP);
        public static readonly string JOB_TRIGGER = "trigger_inicial";
        public static readonly string JOB_DESCRIPTION = "Integration into Yahoo finance";

        private readonly IYahooFinanceService _yahooservice;
        private readonly IStockService _stockService;
        private readonly ILogger<YahooIntegration> _logger;

        public YahooIntegration(IYahooFinanceService yahooService, ILogger<YahooIntegration> logger, IStockService stockService)
        {
            _yahooservice = yahooService;
            _logger = logger;
            _stockService = stockService;
        }

        public async Task Execute(IJobExecutionContext context)
        {
            _logger.LogInformation("YahooIntegration - inicio");

            var stocks = _stockService.GetAllActiveCodes();

            _logger.LogInformation($"YahooIntegration - integrando {stocks.Count} ativos");

            foreach (var item in stocks)
            {
                await RunStockIntegration(item);
                await Task.Delay(5000);
            }

            _logger.LogInformation("YahooIntegration - fim");
        }

        private async Task RunStockIntegration(string stockCode)
        {
            try
            {
                _logger.LogInformation($"{stockCode} Starting");
                await _yahooservice.DowloadAndSaveStock(stockCode, Interval.DAILY);

                _logger.LogInformation($"{stockCode} OK");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Erro ao integrar ativo: {stockCode}");
            }
        }
    }
}
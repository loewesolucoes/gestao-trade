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


Console.WriteLine("Run!");
//Teste1().Wait();
RunAsync().Wait();
//var _context = serviceProvider.GetService<DashContext>();

//_context.Database.ExecuteSql("");


Console.WriteLine("Ok!");

async Task RunAsync()
{
    var yahooService = serviceProvider.GetService<IYahooFinanceService>();
    await yahooService.DowloadAndSaveStock("AZUL4", Interval.DAILY);
}

void ConfigureServices(IServiceCollection services)
{
    services
        .AddDbContext<DashContext>()
        .AddScoped<IStockRepository, StockRepository>()
        .AddScoped<IStockService, StockService>()
        .AddScoped<IYahooFinanceService, YahooFinanceService>()
        ;
}

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

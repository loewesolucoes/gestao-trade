using System.Text.Json.Serialization;
using domain.Contracts;
using domain.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using repository;
using repository.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services
    .AddControllers()
    .AddJsonOptions(x => x.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()))
    ;
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

ConfigureServices(builder.Services);

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors(x => x.AllowAnyOrigin());
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();

void ConfigureServices(IServiceCollection services)
{
    services
        .AddDbContext<DashContext>()
        .AddScoped<IStockRepository, StockRepository>()
        .AddScoped<IStockService, StockService>()
        .AddScoped<IYahooFinanceService, YahooFinanceService>()
        ;
}

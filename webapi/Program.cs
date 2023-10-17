using System.Text.Json.Serialization;
using backgroundjobs;
using domain.Contracts;
using domain.Services;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using Quartz;
using Quartz.AspNetCore;
using repository;
using repository.Repositories;
using Serilog;
using Serilog.Events;

Log.Logger = new LoggerConfiguration() //NOSONAR
                      .Enrich.FromLogContext()
                      .MinimumLevel.Information()
                      .MinimumLevel.Override("Microsoft", LogEventLevel.Information)
                      .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
                      .MinimumLevel.Override("Microsoft.EntityFrameworkCore.Database.Command", LogEventLevel.Warning)
                      .WriteTo.Console(outputTemplate: "{Timestamp:HH:mm:ss} {Level:u3} {Message:lj} {NewLine}{Exception}")
                      .WriteTo.File(
                           Path.Combine(Path.GetTempPath(), "dashboard", "diagnostics.log"),
                           rollingInterval: RollingInterval.Day,
                           fileSizeLimitBytes: 100 * 1024 * 1024,
                           retainedFileCountLimit: 60,
                           rollOnFileSizeLimit: true,
                           shared: true,
                           flushToDiskInterval: TimeSpan.FromSeconds(10)
                        )
                      .CreateLogger();

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services
    .AddControllers()
    .AddJsonOptions(x => x.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()))
    ;
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Logging.AddSerilog();

ConfigureServices(builder.Services);
ConfigureQuartz(builder);

var app = builder.Build();

AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseCors(x => x.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod());
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

static void ConfigureQuartz(WebApplicationBuilder builder)
{
    var connectionString = builder.Configuration.GetConnectionString("Quartz");

    if (connectionString == null)
        throw new ArgumentException("Quartz connectionString cant be null");

    builder.Services.AddQuartz(options =>
    {
        // handy when part of cluster or you want to otherwise identify multiple schedulers
        options.SchedulerId = "Dashboard";
        options.UsePersistentStore(x =>
        {
            x.UseBinarySerializer();
            x.UsePostgres(connectionString);
        });

        options.AddJob<YahooIntegration>(YahooIntegration.JOB_KEY, j => j.WithDescription(YahooIntegration.JOB_DESCRIPTION));
        options.AddJob<BrapiIntegration>(BrapiIntegration.JOB_KEY, j => j.WithDescription(BrapiIntegration.JOB_DESCRIPTION));

        options.AddTrigger(t => t
                .WithIdentity(BrapiIntegration.JOB_TRIGGER)
                .ForJob(BrapiIntegration.JOB_KEY)
                .StartNow()
                .WithSimpleSchedule(x => x.WithInterval(TimeSpan.FromDays(15)).RepeatForever())
            );

        options.AddTrigger(t => t
                .WithIdentity(YahooIntegration.JOB_TRIGGER)
                .ForJob(YahooIntegration.JOB_KEY)
                .StartNow()
                .WithSimpleSchedule(x => x.WithInterval(TimeSpan.FromMinutes(30)).RepeatForever())
            );
    });

    builder.Services.AddQuartzServer(options =>
    {
        // when shutting down we want jobs to complete gracefully
        options.WaitForJobsToComplete = true;
        options.StartDelay = TimeSpan.FromSeconds(10);
        options.AwaitApplicationStarted = true;
    });
}
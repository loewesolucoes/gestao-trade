using System;
using domain.Services;

namespace domain.Contracts
{
    public interface IYahooFinanceService
    {
        Task DowloadAndSaveStock(string stockId, Interval interval);
    }
}


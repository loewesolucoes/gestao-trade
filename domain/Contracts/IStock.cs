using domain.Dtos;
using System;

namespace domain.Contracts
{
    public interface IStockService
    {
        void DeleteHistoryByUpdate(StockUpdate stockUpdate);
        StockWithPagingDto GetAll(string? search, int page, int take);
        ICollection<string> GetAllActiveCodes();
        StockUpdate? GetLastUpdate(string v, Interval dAILY);
        bool IsUpdated(string stockId, Interval interval);
        void SaveHistory(string stockId, Interval interval, IEnumerable<Intraday> intradays);
        void ToggleStockActive(string[] stockCodes);
    }

    public interface IStockRepository
    {
        void DeleteHistoryByUpdate(StockUpdate stockUpdate);
        StockWithPagingDto GetAll(string? search, int page, int take);
        ICollection<string> GetAllActiveCodes();
        Stock? GetLastStockAdded();
        StockUpdate? GetLastUpdate(string stockId, Interval interval);
        void Save(ICollection<Stock> stocks);
        void SaveHistory(string stockId, Interval interval, IEnumerable<Intraday> enumerable);
        void ToggleStockActive(string[] stockCodes);
    }
}


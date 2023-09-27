using System;

namespace domain.Contracts
{
    public interface IStockService
    {
        void DeleteHistoryByUpdate(StockUpdate stockUpdate);
        StockUpdate? GetLastUpdate(string v, Interval dAILY);
        bool IsUpdated(string stockId, Interval interval);
        void SaveHistory(string stockId, Interval interval, IEnumerable<Intraday> intradays);
    }

    public interface IStockRepository
    {
        void DeleteHistoryByUpdate(StockUpdate stockUpdate);
        StockUpdate? GetLastUpdate(string stockId, Interval interval);
        void SaveHistory(string stockId, Interval interval, IEnumerable<Intraday> enumerable);
    }
}


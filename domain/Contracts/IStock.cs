using domain.Dtos;
using System;

namespace domain.Contracts
{
    public interface IStockService
    {
        void DeleteHistoryByUpdate(StockUpdate stockUpdate);
        StockWithPagingDto GetAll(int page, int take);
        StockUpdate? GetLastUpdate(string v, Interval dAILY);
        bool IsUpdated(string stockId, Interval interval);
        void SaveHistory(string stockId, Interval interval, IEnumerable<Intraday> intradays);
    }

    public interface IStockRepository
    {
        void DeleteHistoryByUpdate(StockUpdate stockUpdate);
        StockWithPagingDto GetAll(int page, int take);
        StockUpdate? GetLastUpdate(string stockId, Interval interval);
        void SaveHistory(string stockId, Interval interval, IEnumerable<Intraday> enumerable);
    }
}


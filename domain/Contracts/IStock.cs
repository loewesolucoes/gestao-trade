using System;

namespace domain.Contracts
{
    public interface IStockService
    {
        bool IsUpdated(string stockId, Interval interval);
        void SaveHistory(string stockId, Interval interval, IEnumerable<Intraday> intradays);
    }

    public interface IStockRepository
    {
        bool IsUpdated(string stockId, Interval interval);
        void SaveHistory(string stockId, Interval interval, IEnumerable<Intraday> enumerable);
    }
}


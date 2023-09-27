using System;
using domain.Contracts;

namespace domain.Services
{
    public class StockService : IStockService
    {
        private readonly IStockRepository _repository;

        public StockService(IStockRepository repository)
        {
            _repository = repository;
        }

        public bool IsUpdated(string stockId, Interval interval)
        {
            return _repository.IsUpdated(stockId, interval);
        }

        public void SaveHistory(string stockId, Interval interval, IEnumerable<Intraday> intradays)
        {
            _repository.SaveHistory(stockId, interval, intradays.Select(x => { x.StockId = stockId; return x; }));
        }
    }
}


using System;
using domain;
using domain.Contracts;

namespace repository.Repositories
{
    public class StockRepository : IStockRepository
    {
        private readonly DashContext _context;

        public StockRepository(DashContext context)
        {
            _context = context;
        }

        public void DeleteHistoryByUpdate(StockUpdate stockUpdate)
        {
            var historyToDelete = _context.History.Where(x => x.StockId == stockUpdate.StockId && x.Interval == stockUpdate.Interval && x.Date >= stockUpdate.CreatedAt).ToList();

            _context.History.RemoveRange(historyToDelete);
            _context.SaveChanges();
        }

        public ICollection<Stock> GetAll()
        {
            return _context.Stocks.OrderBy(x => x.Code).ToList();
        }

        public StockUpdate? GetLastUpdate(string stockId, Interval interval)
        {
            return _context.StockUpdates.OrderBy(x => x.CreatedAt).LastOrDefault(x => x.StockId == stockId && x.Interval == interval);
        }

        public void SaveHistory(string stockId, Interval interval, IEnumerable<Intraday> intradays)
        {
            _context.History.AddRange(intradays);
            _context.StockUpdates.Add(new StockUpdate()
            {
                StockId = stockId,
                Interval = interval,
            });

            _context.SaveChanges();
        }
    }
}


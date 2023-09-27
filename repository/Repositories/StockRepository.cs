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

            //var keys = _context.History
            //    .GroupBy(s => new { s.Date, s.StockId, s.Interval })
            //    .Select(g => new { g.Key, Count = g.Count() })
            //    .Where(t => t.Count > 1)
            //    .Select(t => new { t.Key.Date, t.Key.Id })
            //    .ToList();

            //var dupesToRemove = _context.History
            //    .GroupBy(s => new { s.Date, s.StockId, s.Interval })
            //    .Where(t => t.Count() > 1)
            //    .ToList();

            //_context.History.RemoveRange(dupesToRemove);
            //_context.SaveChanges();
        }
    }
}


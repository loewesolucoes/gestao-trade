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

        public bool IsUpdated(string stockId, Interval interval)
        {
            return _context.StockUpdates.Any(x => x.StockId == stockId
                && x.Interval == interval
                && x.CreatedAt >= DateTime.Today
            );
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


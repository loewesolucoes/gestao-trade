using System;
using domain;
using domain.Contracts;
using domain.Dtos;
using Microsoft.EntityFrameworkCore;
using repository.Migrations;

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
            var historyToDelete = _context.History.Where(x => x.StockId == stockUpdate.StockId && x.Interval == stockUpdate.Interval && x.CreatedAt >= stockUpdate.CreatedAt).ToList();

            _context.History.RemoveRange(historyToDelete);
            _context.SaveChanges();
        }

        public StockWithPagingDto GetAll(string? search, int page, int take)
        {
            var query = _context.Stocks
                .Where(x => search == null || EF.Functions.ILike(x.Code, $"%{search}%") || EF.Functions.ILike(x.Name, $"%{search}%") || (x.Sector != null && EF.Functions.ILike(x.Sector, $"%{search}%")))
                .OrderBy(x => !x.Active)
                .ThenBy(x => x.Code)
                ;
            var stocks = query.Skip(page * take).Take(take).ToList();
            var total = query.Count();

            return new StockWithPagingDto()
            {
                Stocks = stocks,
                Page = page,
                Take = take,
                Total = total,
            };
        }

        public StockWithPagingDto GetAllActives()
        {
            var query = _context.Stocks
                .Where(x => x.Active)
                .OrderBy(x => x.Code)
                .ThenBy(x => x.CreatedAt)
                ;

            var stocks = query.ToList();
            var total = query.Count();

            return new StockWithPagingDto()
            {
                Stocks = stocks,
                Page = 1,
                Take = total,
                Total = total,
            };
        }

        public ICollection<string> GetAllActiveCodes()
        {
            return _context.Stocks.Where(x => x.Active).Select(x => x.Code).ToList();
        }

        public Stock? GetLastStockAdded() => _context.Stocks.OrderByDescending(x => x.CreatedAt).FirstOrDefault();

        public StockUpdate? GetLastUpdate(string stockId, Interval interval)
        {
            return _context.StockUpdates.OrderBy(x => x.CreatedAt).LastOrDefault(x => x.StockId == stockId && x.Interval == interval);
        }

        public void Save(ICollection<Stock> stocks)
        {
            _context.Stocks.AddRange(stocks);
            _context.SaveChanges();
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

        public void ToggleStockActive(string[] stockCodes)
        {
            var stocks = _context.Stocks.Where(x => stockCodes.Contains(x.Code)).ToList();

            foreach (var stock in stocks)
                stock.Active = !stock.Active;

            _context.UpdateRange(stocks);
            _context.SaveChanges();
        }

        public ICollection<Intraday> GetHistory(string stockId)
        {
            return _context.History
                .Where(x => x.StockId == stockId)
                .OrderBy(x => x.Date)
                .ToList()
                ;
        }
    }
}


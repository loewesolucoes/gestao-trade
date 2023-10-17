using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace domain.Dtos
{
    public class StockWithPagingDto
    {
        public List<Stock> Stocks { get; set; }
        public int Page { get; set; }
        public int Take { get; set; }
        public int Total { get; set; }
    }
}

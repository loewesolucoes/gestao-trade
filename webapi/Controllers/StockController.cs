using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using domain.Contracts;
using Microsoft.AspNetCore.Mvc;

namespace webapi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class StockController : ControllerBase
    {
        private readonly IStockService _stockService;
        private readonly ILogger<StockController> _logger;

        public StockController(IStockService stockService, ILogger<StockController> logger)
        {
            _stockService = stockService;
            _logger = logger;
        }

        [HttpGet]
        public IActionResult Index(int page = 1, int take = 20)
        {
            var stock = _stockService.GetAll(page - 1, take);

            return Ok(new
            {
                success = true,
                data= stock,
            });
        }
    }
}


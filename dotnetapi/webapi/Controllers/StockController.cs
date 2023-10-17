using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using domain.Contracts;
using domain.Dtos;
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
        public IActionResult Index(string? search, int page = 1, int take = 20)
        {
            StockWithPagingDto stock;

            try
            {
                stock = _stockService.GetAll(search, page - 1, take);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Index");
                return BadRequest(new { success = false, });
            }

            return Ok(new
            {
                success = true,
                data = stock,
            });
        }

        [HttpPost("ToggleStockActive")]
        public IActionResult ToggleStockActive(string[] stockCodes)
        {

            try
            {
                _stockService.ToggleStockActive(stockCodes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ToggleStockActive");
                return BadRequest(new { success = false, });
            }


            return Ok(new { success = true, });
        }

    }
}


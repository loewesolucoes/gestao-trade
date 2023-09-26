namespace domain;

public class StockUpdate : ModelBase
{
    public long Id { get; set; }
    public DateTime Update { get; set; }
    public int StockId { get; set; }
    public Stock Stock { get; set; }
}

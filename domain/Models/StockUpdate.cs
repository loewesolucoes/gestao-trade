namespace domain;

public class StockUpdate : ModelBase
{
    public long Id { get; set; }
    public string StockId { get; set; }
    public Stock Stock { get; set; }
    public Interval Interval { get; set; }
}

namespace domain;

public class Intraday   
{
    public long Id { get; set; }
    public decimal Open { get; set; }
    public decimal Close { get; set; }
    public decimal AdjustedClose { get; set; }
    public decimal Max { get; set; }
    public decimal Min { get; set; }
    public decimal Volume { get; set; }
    public DateTime Date { get; set; }
    public IntradayType Type { get; set; }


    public string StockId { get; set; }
    public Stock Stock { get; set; }
}

public enum IntradayType
{
    DAILY=1,
    WEEKLY=7,
    MONTHLY=30,
    YEARLY=365,
}
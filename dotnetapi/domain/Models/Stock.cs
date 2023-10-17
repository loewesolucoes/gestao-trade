using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace domain;

public class Stock : ModelBase
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.None)]
    public string Id { get; set; }
    public string Name { get; set; }
    public bool Active { get; set; }
    public StockType Type { get; set; }
    public Uri Logo { get; set; }
    public double? MarketCap { get; set; }
    public string? Sector { get; set; }

    public string Code { get => Id; set => Id = value; }
}

public enum StockType
{
    COMPANY,
    FII,
    ETFS,
    OTHERS,
}
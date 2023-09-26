using System;
using System.Globalization;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace console
{
    public partial class BrapiResponse
    {
        [JsonProperty("indexes")]
        public Index[] Indexes { get; set; }

        [JsonProperty("stocks")]
        public BrapiStock[] Stocks { get; set; }
    }

    public partial class Index
    {
        [JsonProperty("stock")]
        public string Stock { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }
    }

    public partial class BrapiStock
    {
        [JsonProperty("stock")]
        public string StockStock { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("close")]
        public double Close { get; set; }

        [JsonProperty("change")]
        public double Change { get; set; }

        [JsonProperty("volume")]
        public long Volume { get; set; }

        [JsonProperty("market_cap")]
        public double? MarketCap { get; set; }

        [JsonProperty("logo")]
        public Uri Logo { get; set; }

        [JsonProperty("sector")]
        public string? Sector { get; set; }
    }
}


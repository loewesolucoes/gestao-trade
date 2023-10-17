"use client";
import "./styles.scss"
import { Stock } from "../../models";

export function StockCard(props: { stock: Stock; isActive?: boolean; onClick: (stock: Stock) => void; }) {
  const { stock, isActive, onClick } = props;

  return (
    <button type="button" className={`stock-card ${isActive ? 'marked' : ''} ${stock.active ? 'active' : ''}`.trim()} onClick={() => onClick(stock)}>
      <img src={stock.logo} alt={stock.name} />
      <h4>{stock.name}</h4>
      <small>{stock.code}</small>
      <div className="info">
        {stock.sector && (<span>{stock.sector}</span>)}
        {stock.type && (<span>{stock.type}</span>)}
      </div>
    </button>
  );
}

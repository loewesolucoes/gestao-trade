"use client";
import "./styles.scss"
import { Acoes, StockType } from "../../../repositories/acoes";
import { EnumUtil } from "../../../utils/enum";

interface CustomProps {
  acao: Acoes;
  isActive?: boolean;
  onClick: (acao: Acoes) => void;
}

export function AcaoCard(props: CustomProps) {
  const { acao: stock, isActive, onClick } = props;

  return (
    <button type="button" className={`stock-card ${isActive ? 'marked' : ''} ${stock.active ? 'active' : ''}`.trim()} onClick={() => onClick(stock)}>
      <img src={stock.logo} alt={stock.nome} />
      <h4>{stock.nome}</h4>
      <small>{stock.codigo}</small>
      <div className="info">
        {stock.setor && (<span>{stock.setor}</span>)}
        {stock.tipo && (<span>{EnumUtil.keyFromValue(StockType, stock.tipo)}</span>)}
      </div>
    </button>
  );
}

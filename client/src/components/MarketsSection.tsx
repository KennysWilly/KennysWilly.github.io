import { useMemo, useState } from "react";
import { ArrowUpRight, BarChart3, ExternalLink } from "lucide-react";

const symbols = [
  { id: "SPY", label: "S&P 500", tv: "AMEX:SPY" },
  { id: "QQQ", label: "Nasdaq 100", tv: "NASDAQ:QQQ" },
  { id: "DIA", label: "Dow Jones", tv: "AMEX:DIA" },
  { id: "NVDA", label: "NVIDIA", tv: "NASDAQ:NVDA" },
  { id: "TSLA", label: "Tesla", tv: "NASDAQ:TSLA" },
  { id: "BTCUSD", label: "Bitcoin", tv: "COINBASE:BTCUSD" },
];

function chartUrl(symbol: string) {
  const params = new URLSearchParams({
    symbol,
    interval: "5",
    hidesidetoolbar: "1",
    symboledit: "0",
    saveimage: "0",
    toolbarbg: "0f1013",
    theme: "dark",
    style: "1",
    timezone: "America/Chicago",
    withdateranges: "1",
    hideideas: "1",
    locale: "en",
  });
  return `https://www.tradingview.com/widgetembed/?${params.toString()}`;
}

export default function MarketsSection() {
  const [selected, setSelected] = useState(symbols[0].id);
  const active = useMemo(() => symbols.find(symbol => symbol.id === selected) ?? symbols[0], [selected]);
  return <section className="section markets-section" id="markets" aria-labelledby="markets-title">
    <div className="section-top"><div><div className="eyebrow"><BarChart3 size={15} /> 04 / THE MARKET</div><h2 id="markets-title">WATCH<br />THE TAPE<span className="orange-text">.</span></h2></div><p>Live charting for the names people are watching.<br />Open the full view when you need more.</p></div>
    <div className="markets-panel">
      <div className="markets-header"><div><span className="markets-kicker">LIVE MARKET VIEW</span><h3>{active.label} <span>{active.id}</span></h3></div><a className="text-link" href={`https://www.tradingview.com/symbols/${active.tv.replace(":", "-")}/`} target="_blank" rel="noopener noreferrer">OPEN FULL CHART <ExternalLink size={15} /></a></div>
      <div className="market-tabs" role="tablist" aria-label="Market symbols">{symbols.map(symbol => <button key={symbol.id} role="tab" aria-selected={active.id === symbol.id} className={active.id === symbol.id ? "selected" : ""} onClick={() => setSelected(symbol.id)}><strong>{symbol.id}</strong><span>{symbol.label}</span></button>)}</div>
      <div className="market-chart-wrap"><iframe key={active.tv} title={`${active.label} live market chart`} src={chartUrl(active.tv)} loading="lazy" allow="fullscreen" /></div>
      <div className="markets-footer"><span><i className="market-pulse" /> LIVE CHART / 5 MIN VIEW</span><span>DATA VIA TRADINGVIEW · QUOTES MAY BE DELAYED BY VENUE</span><a href="https://www.tradingview.com/" target="_blank" rel="noopener noreferrer">TRADINGVIEW <ArrowUpRight size={14} /></a></div>
    </div>
    <p className="source-note market-disclaimer">Informational market data only. This tracker is not investment advice, a recommendation, or a promise of execution-quality pricing.</p>
  </section>;
}

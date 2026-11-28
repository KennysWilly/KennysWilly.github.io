import { useMemo, useState } from "react";
import { ArrowUpRight, BarChart3, ExternalLink, Globe2, Newspaper } from "lucide-react";

const symbols = [
  { id: "SPY", label: "S&P 500", tv: "AMEX:SPY" },
  { id: "QQQ", label: "Nasdaq 100", tv: "NASDAQ:QQQ" },
  { id: "DIA", label: "Dow Jones", tv: "AMEX:DIA" },
  { id: "NVDA", label: "NVIDIA", tv: "NASDAQ:NVDA" },
  { id: "TSLA", label: "Tesla", tv: "NASDAQ:TSLA" },
  { id: "BTCUSD", label: "Bitcoin", tv: "COINBASE:BTCUSD" },
];
const newsItems = [
  { section: "INTERNATIONAL", source: "REUTERS", title: "Trump announces new tariffs, undeterred by midterms defeat", url: "https://www.reuters.com/world/china/us-proposes-new-tariffs-14-trading-partners-fight-excess-factory-capacity-2026-11-25/" },
  { section: "INTERNATIONAL", source: "AP", title: "Trump heads to China, betting on unscripted diplomacy with Xi and Putin", url: "https://apnews.com/article/trump-xi-marcos-apec-china-philippines-3fc8110f4b4414bfb2c03596f61da862" },
  { section: "INTERNATIONAL", source: "AP", title: "Ukrainian drones and missiles strike Kerch Bridge that links Russia with Crimea", url: "https://apnews.com/article/russia-ukraine-war-bridge-crimea-drones-missiles-df4b867cf8f70e88843d8fefea5d643c" },
  { section: "U.S. CULTURE", source: "REUTERS", title: "Culture Current: interviews with the people shaping music, film, fashion, and ideas", url: "https://www.reuters.com/lifestyle/culture-current/" },
  { section: "U.S. CULTURE", source: "REUTERS", title: "Bella Poarch on her debut album and making music beyond virality", url: "https://www.reuters.com/lifestyle/culture-current/" },
  { section: "U.S. CULTURE", source: "AP", title: "David Beckham sues after his fragrance is sold in gas stations and discount stores", url: "https://apnews.com/article/david-beckham-perfume-lawsuit-poundland-48901f3e47194ae00b855dc626d9cfe4" },
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
    <div className="world-news-dock" aria-labelledby="world-news-title">
      <div className="world-news-heading"><div><span className="markets-kicker"><Globe2 size={14} /> WORLD NEWS / SOURCE-LINKED</span><h3 id="world-news-title">THE OTHER<br />TAPE<span className="orange-text">.</span></h3></div><p><Newspaper size={17} /> International reporting and U.S. culture coverage.<br />Open the source for the full story.</p></div>
      <div className="world-news-grid">{newsItems.map((item, index) => <a className={`world-news-card ${item.section === "U.S. CULTURE" ? "culture" : "international"}`} key={`${item.source}-${index}`} href={item.url} target="_blank" rel="noopener noreferrer"><div className="world-news-card-top"><span>{item.section}</span><b>{item.source}</b></div><h4>{item.title}</h4><span className="world-news-open">READ SOURCE <ArrowUpRight size={14} /></span></a>)}</div>
      <p className="world-news-note">Source-transparent rather than “unbiased”: Reuters and AP are attributed wire services, and this rail does not replace reading the full article or comparing coverage.</p>
    </div>
  </section>;
}

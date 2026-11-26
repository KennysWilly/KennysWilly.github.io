import { ArrowDown, ArrowUpRight, Pause, Play, Twitch, Zap } from "lucide-react";
import type { Album } from "../../../shared/integrations";
import AlbumWall from "./AlbumWall";

export function Navigation() {
  return <header className="site-header">
    <a href="#top" className="wordmark" aria-label="KennysWilly home">KENNYS<span>WILLY</span><i /></a>
    <nav aria-label="Main navigation"><a href="#about">THE PERSON</a><a href="#music">THE MUSIC</a><a href="#clips">THE CLIPS</a></nav>
    <a className="header-cta" href="https://www.twitch.tv/kennyswillyy" target="_blank" rel="noopener noreferrer"><Twitch size={16} /> FIND ME ON TWITCH <ArrowUpRight size={16} /></a>
  </header>;
}

export default function Hero({ albums, paused, setPaused, connected }: { albums: Album[]; paused: boolean; setPaused: (value: boolean) => void; connected: boolean }) {
  return <section className="hero" aria-labelledby="hero-title">
    <AlbumWall albums={albums} paused={paused} />
    <div className="hero-content">
      <div className="eyebrow"><span className="status-dot" /> MUSIC / HOOPS / LIVE</div>
      <h1 id="hero-title">KENNYS<br />WILLY.<br /><span>NO EDIT.</span><span className="hero-asterisk" aria-hidden="true">✳</span></h1>
      <p>Music, basketball, and whatever is worth staying up for. Kanye in the mix, Thunder on the screen, stream when it's on.<br className="desktop-break" /> Kenneth Williams is behind the page.</p>
      <div className="hero-actions"><a className="brutal-button orange" href="https://www.twitch.tv/kennyswillyy" target="_blank" rel="noopener noreferrer"><Twitch size={20} /> WATCH LIVE <ArrowUpRight size={20} /></a><a className="brutal-button" href="#music">SEE WHAT'S PLAYING <ArrowDown size={19} /></a></div>
      <div className="hero-footnote"><Zap size={17} fill="currentColor" /> MUSIC ON. THUNDER UP.</div>
    </div>
    <div className="wall-sticker"><span>NO SKIPS.</span><strong>IN<br />HEAVY ROTATION.</strong><span>KENNYSWILLY</span></div>
    <div className="wall-caption"><span>{connected ? "MY SPOTIFY LIBRARY" : "FROM MY SPOTIFY PLAYLISTS"}</span><button onClick={() => setPaused(!paused)} aria-label={paused ? "Resume album wallpaper animation" : "Pause album wallpaper animation"}>{paused ? <Play size={15} /> : <Pause size={15} />}</button></div>
  </section>;
}

export function Ticker() {
  return <div className="ticker" aria-label="KennysWilly music, hoops and streams"><div>{Array.from({ length: 4 }, (_, i) => <span key={i}>KENNYSWILLY / MUSIC / HOOPS / STREAMS <b>✳</b> THUNDER UP <b>✳</b> NO SKIPS <b>✳</b> </span>)}</div></div>;
}

import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Eye, Heart, Instagram, Play, Radio, Twitch, Users, X, Youtube } from "lucide-react";
import { publicHighlights, socials } from "@/data/content";
import { useTwitchStatus } from "@/hooks/usePublicData";

type Take = (typeof publicHighlights)[number];

function SocialIcon({ id, size = 30 }: { id: string; size?: number }) {
  if (id === "twitch") return <Twitch size={size} />;
  if (id === "youtube") return <Youtube size={size} />;
  if (id === "instagram") return <Instagram size={size} />;
  if (id === "tip") return <Heart size={size} />;
  if (id === "x") return <span className="x-icon">𝕏</span>;
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path d="M13 3h3c.4 2.7 2 4.3 4 4.5v3a8 8 0 0 1-4-1.5v7a5 5 0 1 1-5-5h1v3a2 2 0 1 0 1 2Z" fill="currentColor" /></svg>;
}

const basketballTakes = publicHighlights.filter(clip => clip.category?.includes("HOOPS") || clip.category?.includes("THUNDER"));

function BasketballPlayer({ active, close }: { active: Take | null; close: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (active) dialog.current?.showModal();
    else dialog.current?.close();
  }, [active]);
  return <dialog ref={dialog} className="video-dialog" onCancel={close} onClick={event => { if (event.target === dialog.current) close(); }} aria-labelledby="take-dialog-title"><div className="dialog-header"><h3 id="take-dialog-title">{active?.title}</h3><button onClick={close} aria-label="Close video"><X size={24} /></button></div>{active && <><iframe title={active.title} src={`${active.embedUrl}?autoplay=1&rel=0`} allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen /><a className="text-link video-fallback" href={active.url} target="_blank" rel="noopener noreferrer">PLAYER NOT AVAILABLE? WATCH ON YOUTUBE <ArrowUpRight size={17} /></a></>}</dialog>;
}

export function BasketballSection() {
  const [active, setActive] = useState<Take | null>(null);
  return <section className="section basketball-section" id="basketball" aria-labelledby="basketball-title">
    <div className="section-top"><div><div className="eyebrow">03 / BASKETBALL TAKES</div><h2 id="basketball-title">THE TAKES<br />SPEAK<span className="orange-text">.</span></h2></div><div className="basketball-intro"><p>Actual clips. Actual opinions.<br />No biography written by a robot.</p><a className="text-link" href="https://youtube.com/@kennyswillyy" target="_blank" rel="noopener noreferrer">WATCH THE YOUTUBE ARCHIVE <ArrowUpRight size={17} /></a></div></div>
    <div className="take-grid">{basketballTakes.map((clip, index) => <article className="take-card" key={clip.id}><button className="take-image" onClick={() => setActive(clip)} aria-label={`Play ${clip.title}`}><img src={clip.thumbnail} alt="" loading="lazy" /><span className="take-number">0{index + 1}</span><span className="take-play"><Play size={16} fill="currentColor" /> PLAY</span></button><div className="take-copy"><span className="tiny-label">{clip.category}</span><h3><button onClick={() => setActive(clip)}>{clip.title}</button></h3><span className="take-meta"><Eye size={14} /> ~{new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(clip.views ?? 0)} VIEWS <ArrowUpRight size={15} /></span></div></article>)}</div>
    <BasketballPlayer active={active} close={() => setActive(null)} />
  </section>;
}

export function TwitchSection() {
  const query = useTwitchStatus();
  const status = query.data;
  const connected = status?.status === "connected";
  const live = connected && status.live;
  const followers = status?.followerCount === null || status?.followerCount === undefined ? "—" : new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(status.followerCount);
  const viewers = live && status.viewerCount !== null ? new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(status.viewerCount) : "—";
  return <section className="section twitch-section" id="twitch" aria-labelledby="twitch-title">
    <div className={`twitch-panel ${live ? "is-live" : ""}`}>
      <div className="twitch-copy"><div className="eyebrow"><Twitch size={15} /> 04 / TWITCH <span className="console-slash">///</span> SIGNAL DESK</div><h2 id="twitch-title">LIVE WHEN<br />I'M LIVE<span className="orange-text">.</span></h2><p>{live ? status.title || "KennysWilly is live on Twitch." : "The channel is quiet right now. The tracker checks again every 30 seconds."}</p><a className="brutal-button purple" href="https://www.twitch.tv/kennyswillyy" target="_blank" rel="noopener noreferrer">OPEN THE CHANNEL <ArrowUpRight size={18} /></a></div>
      <div className="twitch-console"><div className="twitch-console-top"><span className={`twitch-live-badge ${live ? "is-live" : ""}`}><Radio size={17} /> {query.isLoading ? "CHECKING STATUS" : live ? "LIVE NOW" : connected ? "OFFLINE" : "SERVER STATUS UNAVAILABLE"}</span><span className="console-code">KW—04 / {live ? "ON AIR" : "STANDBY"}</span></div><div className="twitch-orbit" aria-hidden="true"><span className="orbit-ring ring-one" /><span className="orbit-ring ring-two" /><span className="orbit-core"><Twitch size={37} /></span><span className="orbit-live-dot" /></div><div className="twitch-channel-line"><span>@kennyswillyy</span><span>{live ? "TRANSMITTING" : "NO SIGNAL"}</span></div><div className="twitch-stat-grid"><div><strong>{viewers}</strong><span>VIEWERS</span><div className="signal-bars" aria-hidden="true"><i /><i /><i /><i /><i /></div></div><div><strong>{followers}</strong><span>FOLLOWERS</span><Users size={52} /></div></div><p className="twitch-note">{status?.message ?? "Live state and follower count come from Twitch, not a guessed snapshot."}</p><a className="text-link" href="https://www.twitch.tv/kennyswillyy/clips" target="_blank" rel="noopener noreferrer">BROWSE TWITCH CLIPS <ArrowUpRight size={17} /></a></div>
    </div>
  </section>;
}

export function Socials() {
  return <section className="section socials-section" id="socials" aria-labelledby="social-title"><div className="section-top"><div><div className="eyebrow">05 / FIND ME EVERYWHERE</div><h2 id="social-title">NO HIDDEN<br />DOORS<span className="orange-text">.</span></h2></div><p>Every link, in one place.<br />Pick a lane and pull up.</p></div><div className="social-grid">{socials.map((social, index) => <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer" className="social-card" style={{ "--social-color": social.color } as React.CSSProperties}><div className="social-art"><span>0{index + 1}</span><SocialIcon id={social.id} size={43} /></div><div className="social-card-copy"><h3>{social.name}</h3><span>{social.handle}</span><p>{social.description}</p></div><ArrowUpRight className="social-arrow" size={25} /></a>)}</div></section>;
}

export function Footer() {
  return <footer className="site-footer"><blockquote className="tutto-passa">“tutto passa”</blockquote><a href="#top" className="wordmark">KENNYS<span>WILLY</span><i /></a><p>Music, hoops, streams, and whatever is next.</p><a href="#top">BACK TO TOP ↑</a><div>© {new Date().getFullYear()} KENNETH WILLIAMS <span>KENNYSWILLY / MUSIC, HOOPS & STREAMS.</span></div></footer>;
}

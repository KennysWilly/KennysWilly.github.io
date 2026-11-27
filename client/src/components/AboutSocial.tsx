import { useState } from "react";
import { ArrowUpRight, Heart, Instagram, Radio, Sparkles, Twitch, Users, Youtube } from "lucide-react";
import { socials } from "@/data/content";
import { useTwitchStatus } from "@/hooks/usePublicData";

function SocialIcon({ id, size = 30 }: { id: string; size?: number }) {
  if (id === "twitch") return <Twitch size={size} />;
  if (id === "youtube") return <Youtube size={size} />;
  if (id === "instagram") return <Instagram size={size} />;
  if (id === "tip") return <Heart size={size} />;
  if (id === "x") return <span className="x-icon">𝕏</span>;
  return <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true"><path d="M13 3h3c.4 2.7 2 4.3 4 4.5v3a8 8 0 0 1-4-1.5v7a5 5 0 1 1-5-5h1v3a2 2 0 1 0 1 2Z" fill="currentColor" /></svg>;
}

export function BasketballSection() {
  return <section className="section basketball-section" id="basketball" aria-labelledby="basketball-title">
    <div className="section-top"><div><div className="eyebrow">03 / THE SHORT FORM</div><h2 id="basketball-title">YOUTUBE<br />SHORTS<span className="orange-text">.</span></h2></div><div className="basketball-intro"><p>Hoops takes, gaming, and the clips worth opening.<br />Play them here or take the long way to YouTube.</p><a className="text-link" href="https://youtube.com/@kennyswillyy" target="_blank" rel="noopener noreferrer">OPEN YOUTUBE <ArrowUpRight size={17} /></a></div></div>
    <div className="shorts-archive"><div className="shorts-archive-copy"><span className="tiktok-stamp">YOUTUBE / SHORTS</span><h3>THE QUICK<br />ARCHIVE<span className="orange-text">.</span></h3><p>Real public uploads, real thumbnails, and a player that already works with the site.</p><div className="tiktok-meta"><span><Youtube size={15} /> VERIFIED SHORTS</span><span>OPEN / WATCH / REPEAT</span></div></div><div className="shorts-archive-link"><Youtube size={52} /><strong>THE CLIPS ARE<br />RIGHT THIS WAY.</strong><a className="text-link" href="https://youtube.com/@kennyswillyy" target="_blank" rel="noopener noreferrer">BROWSE SHORTS <ArrowUpRight size={17} /></a></div></div>
  </section>;
}

export function TwitchSection() {
  const query = useTwitchStatus();
  const status = query.data;
  const connected = status?.status === "connected";
  const live = connected && status.live;
  const followers = status?.followerCount === null || status?.followerCount === undefined ? "—" : new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(status.followerCount);
  const viewers = live && status.viewerCount !== null ? new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(status.viewerCount) : "—";
  const twitchParent = typeof window === "undefined" ? "localhost" : window.location.hostname;
  return <section className="section twitch-section" id="twitch" aria-labelledby="twitch-title">
    <div className={`twitch-panel ${live ? "is-live" : ""}`}>
      <div className="twitch-copy"><div className="eyebrow"><Twitch size={15} /> 04 / THE MAIN STAGE <span className="console-slash">///</span> FIRST STOP</div><h2 id="twitch-title">WHERE THE<br />MAGIC HAPPENS<span className="orange-text">.</span></h2><p>{live ? status.title || "KennysWilly is live on Twitch." : "This is the first stop. Pull up when the signal goes live."}</p><a className={`brutal-button purple ${live ? "twitch-watch-live" : ""}`} href="https://www.twitch.tv/kennyswillyy" target="_blank" rel="noopener noreferrer">{live ? "WATCH LIVE NOW" : "GO TO THE MAIN STAGE"} <ArrowUpRight size={18} /></a></div>
      <div className="twitch-console"><div className="twitch-console-top"><span className={`twitch-live-badge ${live ? "is-live" : ""}`}><Radio size={17} /> {query.isLoading ? "CHECKING STATUS" : live ? "LIVE NOW" : connected ? "OFFLINE" : "SERVER STATUS UNAVAILABLE"}</span><span className="console-code">KW—04 / {live ? "ON AIR" : "STANDBY"}</span></div>{live ? <iframe className="twitch-live-player" title="KennysWilly live on Twitch" src={`https://player.twitch.tv/?channel=kennyswillyy&parent=${encodeURIComponent(twitchParent)}`} allowFullScreen /> : <div className="twitch-orbit" aria-hidden="true"><span className="orbit-ring ring-one" /><span className="orbit-ring ring-two" /><span className="orbit-core"><Twitch size={37} /></span><span className="orbit-live-dot" /></div>}<div className="twitch-channel-line"><span>@kennyswillyy</span><span>{live ? "TRANSMITTING" : "NO SIGNAL"}</span></div><div className="twitch-stat-grid"><div><strong>{viewers}</strong><span>VIEWERS</span><div className="signal-bars" aria-hidden="true"><i /><i /><i /><i /><i /></div></div><div><strong>{followers}</strong><span>FOLLOWERS</span><Users size={52} /></div></div><p className="twitch-note">{live ? "Live on the site now. Open Twitch if you want the full chat and channel controls." : status?.message ?? "Live state and follower count come from Twitch, not a guessed snapshot."}</p><div className="twitch-network-links"><a className="text-link twitch-primary-link" href={live ? "https://www.twitch.tv/kennyswillyy" : "https://www.twitch.tv/kennyswillyy/clips"} target="_blank" rel="noopener noreferrer"><Twitch size={15} /> {live ? "OPEN THE LIVE CHANNEL" : "BROWSE TWITCH CLIPS"} <ArrowUpRight size={17} /></a><a className="network-link" href="https://youtube.com/@kennyswillyy" target="_blank" rel="noopener noreferrer"><Youtube size={15} /> YOUTUBE</a><a className="network-link" href="https://kick.com/kennyswilly" target="_blank" rel="noopener noreferrer">KICK <ArrowUpRight size={14} /></a></div></div>
    </div>
  </section>;
}

export function StreamForms() {
  const forms = [
    { id: "kenfessions", label: "KENFESSIONS", eyebrow: "KENNYSWILLY KENFESSIONS", url: "https://app.youform.com/forms/bcyxlxpr" },
    { id: "hot-takes", label: "HOT TAKES", eyebrow: "HOT TAKES", url: "https://app.youform.com/forms/r6kg1fd0" },
    { id: "ideas", label: "STREAM IDEAS", eyebrow: "IDEAS FOR STREAM", url: "https://app.youform.com/forms/ovdj0zhb" },
    { id: "mods", label: "MOD APPLICATION", eyebrow: "MOD APPLICATION", url: "https://app.youform.com/forms/atybmmih" },
  ];
  const [selected, setSelected] = useState(forms[0]);
  return <section className="section stream-forms-section" id="forms" aria-labelledby="forms-title"><div className="section-top"><div><div className="eyebrow">05 / THE SUBMISSIONS</div><h2 id="forms-title">SEND IT<br />IN<span className="orange-text">.</span></h2></div><p>Pick an inbox.<br />Step into the dock.</p></div><div className="form-dock"><div className="form-dock-tabs" role="tablist" aria-label="KennysWilly forms">{forms.map(form => <button key={form.id} role="tab" aria-selected={selected.id === form.id} className={selected.id === form.id ? "selected" : ""} onClick={() => setSelected(form)}><span>0{forms.indexOf(form) + 1}</span>{form.label}</button>)}</div><div className="stream-form-card confession-form-card"><div className="card-overline"><span>{selected.eyebrow}</span><span>YOUFORM / LIVE INBOX</span></div><div className="confession-reveal"><div className="confession-cover"><strong>{selected.label}</strong><span>HOVER TO OPEN THE FORM</span></div><iframe key={selected.id} title={selected.eyebrow} src={selected.url} loading="lazy">Loading the {selected.label} form…</iframe></div><div className="form-dock-footer"><span>FORM {forms.indexOf(selected) + 1} / {forms.length}</span><a href={selected.url} target="_blank" rel="noopener noreferrer">OPEN IN NEW TAB <ArrowUpRight size={14} /></a></div></div></div></section>;
}

const socialKickers: Record<string, string> = { twitch: "THE MAIN STAGE", youtube: "THE ARCHIVE", instagram: "THE LOOKS", tiktok: "THE QUICK CUTS", x: "THE RUNNING COMMENTARY", tip: "THE LOVE OFFERING" };

export function Socials() {
  return <section className="section socials-section" id="socials" aria-labelledby="social-title"><div className="socials-heading"><div><div className="eyebrow">05 / THE OUTBOUND</div><h2 id="social-title">EVERYWHERE ELSE.<br />STILL KW<span className="orange-text">.</span></h2></div><div className="socials-heading-note"><span>SAME SIGNAL. DIFFERENT CHANNEL.</span><p>Six ways out.<br />Pick a lane.</p></div></div><div className="social-wall">{socials.map((social, index) => <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer" className={`social-card social-card-${social.id}`} style={{ "--social-color": social.color } as React.CSSProperties}><div className="social-card-index">0{index + 1}</div><div className="social-art"><SocialIcon id={social.id} size={52} /></div><div className="social-card-copy"><span className="social-kicker">{socialKickers[social.id]}</span><h3>{social.name}</h3><span className="social-handle">{social.handle}</span><p>{social.description}</p></div><ArrowUpRight className="social-arrow" size={28} /><span className="social-card-mark">KW / {String(index + 1).padStart(2, "0")}</span></a>)}</div></section>;
}

export function Footer() {
  return <footer className="site-footer"><div className="tutto-lockup"><span className="tutto-mark" aria-hidden="true"><i /><b /></span><blockquote className="tutto-passa">TUTTO PASSA</blockquote></div><a href="#top" className="wordmark">KENNYS<span>WILLY</span><i /></a><p>Music, hoops, streams, and whatever is next.</p><a href="#top">BACK TO TOP ↑</a><div>© {new Date().getFullYear()} KENNETH WILLIAMS <span>KENNYSWILLY / MUSIC, HOOPS & STREAMS.</span></div></footer>;
}

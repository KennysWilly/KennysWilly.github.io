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

function TikTokProfileEmbed() {
  return <div className="tiktok-embed-shell">
    <div className="tiktok-fallback-bar"><span>PUBLIC PROFILE / LATEST POSTS</span><a href="https://www.tiktok.com/@kennyswilly9" target="_blank" rel="noopener noreferrer">OPEN TIKTOK <ArrowUpRight size={14} /></a></div>
    <a className="tiktok-profile-preview" href="https://www.tiktok.com/@kennyswilly9" target="_blank" rel="noopener noreferrer" aria-label="Open the KennysWilly TikTok profile">
      <div className="tiktok-preview-mark">KW<span>✳</span></div>
      <div className="tiktok-preview-copy"><span className="tiny-label">@KENNYSWILLY9 / TIKTOK</span><strong>THE LATEST CUTS<br />LIVE ON THE PROFILE.</strong><span className="text-link">OPEN PROFILE <ArrowUpRight size={17} /></span></div>
      <div className="tiktok-preview-signal" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /></div>
    </a>
    <p className="tiktok-embed-note">TikTok does not expose a verified post ID for an in-page player here. The profile link opens the real public videos without a broken third-party script.</p>
  </div>;
}

export function BasketballSection() {
  return <section className="section basketball-section" id="basketball" aria-labelledby="basketball-title">
    <div className="section-top"><div><div className="eyebrow">03 / THE SHORT FORM</div><h2 id="basketball-title">THE QUICK FEED.<br />NO FILTER<span className="orange-text">.</span></h2></div><div className="basketball-intro"><p>The newest cuts live here first.<br />Watch the profile, then follow the thread.</p><a className="text-link" href="https://www.tiktok.com/@kennyswilly9" target="_blank" rel="noopener noreferrer">OPEN THE TIKTOK <ArrowUpRight size={17} /></a></div></div>
    <div className="tiktok-feature"><div className="tiktok-feature-copy"><span className="tiktok-stamp">TIKTOK / 09</span><h3>THE FEED<br />MOVES FAST<span className="orange-text">.</span></h3><p>Basketball takes, quick reactions, and whatever earns a replay. The panel points straight to the public profile so the real videos open cleanly, without a broken third-party player.</p><div className="tiktok-meta"><span><Sparkles size={15} /> LATEST POSTS</span><span>SCROLL / WATCH / REPEAT</span></div></div><TikTokProfileEmbed /></div>
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
      <div className="twitch-copy"><div className="eyebrow"><Twitch size={15} /> 04 / THE MAIN STAGE <span className="console-slash">///</span> FIRST STOP</div><h2 id="twitch-title">WHERE THE<br />MAGIC HAPPENS<span className="orange-text">.</span></h2><p>{live ? status.title || "KennysWilly is live on Twitch." : "This is the first stop. Pull up when the signal goes live."}</p><a className="brutal-button purple" href="https://www.twitch.tv/kennyswillyy" target="_blank" rel="noopener noreferrer">GO TO THE MAIN STAGE <ArrowUpRight size={18} /></a></div>
      <div className="twitch-console"><div className="twitch-console-top"><span className={`twitch-live-badge ${live ? "is-live" : ""}`}><Radio size={17} /> {query.isLoading ? "CHECKING STATUS" : live ? "LIVE NOW" : connected ? "OFFLINE" : "SERVER STATUS UNAVAILABLE"}</span><span className="console-code">KW—04 / {live ? "ON AIR" : "STANDBY"}</span></div><div className="twitch-orbit" aria-hidden="true"><span className="orbit-ring ring-one" /><span className="orbit-ring ring-two" /><span className="orbit-core"><Twitch size={37} /></span><span className="orbit-live-dot" /></div><div className="twitch-channel-line"><span>@kennyswillyy</span><span>{live ? "TRANSMITTING" : "NO SIGNAL"}</span></div><div className="twitch-stat-grid"><div><strong>{viewers}</strong><span>VIEWERS</span><div className="signal-bars" aria-hidden="true"><i /><i /><i /><i /><i /></div></div><div><strong>{followers}</strong><span>FOLLOWERS</span><Users size={52} /></div></div><p className="twitch-note">{status?.message ?? "Live state and follower count come from Twitch, not a guessed snapshot."}</p><a className="text-link" href="https://www.twitch.tv/kennyswillyy/clips" target="_blank" rel="noopener noreferrer">BROWSE TWITCH CLIPS <ArrowUpRight size={17} /></a></div>
    </div>
  </section>;
}

const socialKickers: Record<string, string> = { twitch: "THE MAIN STAGE", youtube: "THE ARCHIVE", instagram: "THE LOOKS", tiktok: "THE QUICK CUTS", x: "THE RUNNING COMMENTARY", tip: "THE LOVE OFFERING" };

export function Socials() {
  return <section className="section socials-section" id="socials" aria-labelledby="social-title"><div className="socials-heading"><div><div className="eyebrow">05 / THE OUTBOUND</div><h2 id="social-title">EVERYWHERE ELSE.<br />STILL KW<span className="orange-text">.</span></h2></div><div className="socials-heading-note"><span>SAME SIGNAL. DIFFERENT CHANNEL.</span><p>Six ways out.<br />Pick a lane.</p></div></div><div className="social-wall">{socials.map((social, index) => <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer" className={`social-card social-card-${social.id}`} style={{ "--social-color": social.color } as React.CSSProperties}><div className="social-card-index">0{index + 1}</div><div className="social-art"><SocialIcon id={social.id} size={52} /></div><div className="social-card-copy"><span className="social-kicker">{socialKickers[social.id]}</span><h3>{social.name}</h3><span className="social-handle">{social.handle}</span><p>{social.description}</p></div><ArrowUpRight className="social-arrow" size={28} /><span className="social-card-mark">KW / {String(index + 1).padStart(2, "0")}</span></a>)}</div></section>;
}

export function Footer() {
  return <footer className="site-footer"><blockquote className="tutto-passa">“tutto passa”</blockquote><a href="#top" className="wordmark">KENNYS<span>WILLY</span><i /></a><p>Music, hoops, streams, and whatever is next.</p><a href="#top">BACK TO TOP ↑</a><div>© {new Date().getFullYear()} KENNETH WILLIAMS <span>KENNYSWILLY / MUSIC, HOOPS & STREAMS.</span></div></footer>;
}

import { ArrowUpRight, Heart, Instagram, Music2, Twitch, Youtube, Zap } from "lucide-react";
import { kanyeFeature, socials } from "@/data/content";

export function Basketball() {
  return <svg viewBox="0 0 200 200" className="basketball-art" aria-hidden="true"><circle cx="100" cy="100" r="87" fill="#ff5b22" stroke="currentColor" strokeWidth="5" /><path d="M13 100h174M100 13v174M39 39c80 28 89 104 122 122M161 39C81 67 72 143 39 161" fill="none" stroke="currentColor" strokeWidth="5" /><path d="M35 54c38-16 92-15 130 0M35 146c38 16 92 15 130 0" fill="none" stroke="currentColor" strokeWidth="4" /></svg>;
}

export function About() {
  return <section className="section about-section" id="about" aria-labelledby="about-title">
    <div className="about-copy"><div className="eyebrow">03 / THE PERSON BEHIND THE USERNAME</div><h2 id="about-title">THE NAME<br />HAS A STORY<span className="orange-text">.</span></h2><p>I’m Kenneth. The username isn’t a brand exercise—it came from a real story. I’m leaving this line open until I put the actual reason here, in my own words.</p><p>For now: Kanye in the rotation, the Thunder on the screen, Shai doing Shai things, and MJ still setting the standard.</p><div className="interest-tags"><span><Music2 size={15} /> MUSIC FIRST</span><span><Zap size={15} /> THUNDER UP</span><span><Twitch size={15} /> LIVE WHEN I’M LIVE</span></div></div>
    <div className="interest-stack"><div className="hoops-card"><div className="card-overline"><span>NO GENERIC SPORTS TALK</span><Zap size={20} /></div><h3>THUNDER<br />UP.</h3><Basketball /><div className="jersey-strip"><span><b>2</b> SHAI’S GAME.</span><span><b>23</b> MJ’S STANDARD.</span></div></div><a href={kanyeFeature.url} target="_blank" rel="noopener noreferrer" className="music-ticket"><span><Music2 size={27} /><span><b>KANYE STAYS IN THE CONVERSATION.</b><small>That’s not changing.</small></span></span><ArrowUpRight size={26} /></a></div>
  </section>;
}

function SocialIcon({ id }: { id: string }) {
  if (id === "twitch") return <Twitch size={24} />;
  if (id === "youtube") return <Youtube size={26} />;
  if (id === "instagram") return <Instagram size={24} />;
  if (id === "tip") return <Heart size={24} />;
  if (id === "x") return <span className="x-icon">𝕏</span>;
  return <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true"><path d="M13 3h3c.4 2.7 2 4.3 4 4.5v3a8 8 0 0 1-4-1.5v7a5 5 0 1 1-5-5h1v3a2 2 0 1 0 1 2Z" fill="currentColor" /></svg>;
}

export function Socials() {
  return <section className="section socials-section" id="socials" aria-labelledby="social-title"><div className="section-top"><div><div className="eyebrow">04 / KEEP IN TOUCH</div><h2 id="social-title">SAME KENNY.<br />DIFFERENT TABS<span className="orange-text">.</span></h2></div><p>Pick your platform.<br />I’ll meet you over there.</p></div><div className="social-grid">{socials.map(social => <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer" className="social-card" style={{ "--social-color": social.color } as React.CSSProperties}><div className="social-icon"><SocialIcon id={social.id} /></div><div><h3>{social.name}</h3><span>{social.handle}</span><p>{social.description}</p></div><ArrowUpRight className="social-arrow" size={25} /></a>)}</div></section>;
}

export function Footer() {
  return <footer className="site-footer"><a href="#top" className="wordmark">KENNYS<span>WILLY</span><i /></a><p>A personal space. Not a polished persona.</p><a href="#top">BACK TO TOP ↑</a><div>© {new Date().getFullYear()} KENNETH WILLIAMS <span>MADE OF MUSIC, HOOPS & GOOD CHAOS.</span></div></footer>;
}

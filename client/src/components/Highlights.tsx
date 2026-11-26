import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Eye, Play, Twitch, X, Youtube } from "lucide-react";
import { publicHighlights } from "@/data/content";
import { useClips } from "@/hooks/usePublicData";
import type { Clip } from "../../../shared/integrations";

type DisplayClip = Clip & { category?: string };

export default function Highlights() {
  const [platform, setPlatform] = useState<"youtube" | "twitch">("youtube");
  const [active, setActive] = useState<DisplayClip | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const query = useClips(platform);
  const live = query.data?.status === "connected";
  const clips: DisplayClip[] = live ? query.data!.clips : platform === "youtube" ? publicHighlights : [];
  useEffect(() => {
    if (active) dialog.current?.showModal();
    else dialog.current?.close();
  }, [active]);
  const close = () => { setActive(null); trigger.current?.focus(); };
  const play = (clip: DisplayClip, button: HTMLButtonElement) => {
    trigger.current = button;
    const parents = new Set([window.location.hostname]);
    for (const origin of Array.from(window.location.ancestorOrigins ?? [])) {
      try { parents.add(new URL(origin).hostname); } catch { /* Ignore malformed ancestor origins. */ }
    }
    const parentQuery = Array.from(parents).map(parent => `parent=${encodeURIComponent(parent)}`).join("&");
    const embedUrl = clip.platform === "twitch" ? `${clip.embedUrl}${clip.embedUrl.includes("?") ? "&" : "?"}${parentQuery}&autoplay=true` : `${clip.embedUrl}?autoplay=1&rel=0`;
    setActive({ ...clip, embedUrl });
  };

  return <section className="section highlights-section" id="clips" aria-labelledby="clips-title">
    <div className="section-top"><div><div className="eyebrow">02 / THE GOOD STUFF</div><h2 id="clips-title">YOU HAD TO<br />BE THERE<span className="orange-text">.</span></h2></div><div className="clips-intro"><p>No filler. Just the clips worth opening.<br />Hoops takes, gaming, and whatever happened on stream.</p><div className="platform-tabs" role="group" aria-label="Video platform"><button className={platform === "youtube" ? "selected" : ""} aria-pressed={platform === "youtube"} onClick={() => setPlatform("youtube")}><Youtube size={16} /> YOUTUBE</button><button className={platform === "twitch" ? "selected" : ""} aria-pressed={platform === "twitch"} onClick={() => setPlatform("twitch")}><Twitch size={16} /> TWITCH</button></div></div></div>
    {clips.length ? <div className="clip-grid">{clips.slice(0, 3).map((clip, index) => <article className="clip-card" key={clip.id}>
      <button className="clip-image" onClick={event => play(clip, event.currentTarget)} aria-label={`Play ${clip.title}`}><img src={clip.thumbnail} alt="" loading="lazy" /><span className="clip-number">0{index + 1}</span><span className="play-circle"><Play size={24} fill="currentColor" /></span><span className="clip-platform">{platform === "youtube" ? <Youtube size={15} /> : <Twitch size={15} />}{platform === "youtube" ? "YOUTUBE" : "TWITCH"}</span></button>
      <div className="clip-body"><span className="tiny-label">{clip.category ?? "FROM THE STREAM"}</span><h3><button onClick={event => play(clip, event.currentTarget)}>{clip.title}</button></h3><div><span><Eye size={15} />{clip.views === null ? "Views unavailable" : `${!live ? "~" : ""}${new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(clip.views)} views`}</span><a href={clip.url} target="_blank" rel="noopener noreferrer" aria-label={`Watch ${clip.title} on ${platform}`}><ArrowUpRight size={20} /></a></div></div>
    </article>)}</div> : <div className="clips-empty">{platform === "youtube" ? <Youtube size={44} /> : <Twitch size={44} />}<div><h3>{query.isLoading ? "Checking the clips…" : live ? "No public highlights returned." : "The chaos lives on Twitch."}</h3><p>{live ? "No public clips were returned in the current window." : "Clip rankings aren’t connected yet. Head to my channel for streams and clips—no made-up highlights here."}</p></div><a className="brutal-button purple" href={platform === "youtube" ? "https://youtube.com/@kennyswillyy" : "https://www.twitch.tv/kennyswillyy/clips"} target="_blank" rel="noopener noreferrer">EXPLORE {platform.toUpperCase()} <ArrowUpRight size={18} /></a></div>}
    <div className="clips-footer"><p className="source-note">{live ? query.data?.rankingLabel : platform === "youtube" ? "Highest-viewed picks among 15 publicly visible Shorts. Rounded counts checked Nov 26, 2026; not live analytics." : "Twitch clip discovery requires an authorized Twitch app connection."}{query.isError ? " Live refresh unavailable; public picks remain accessible." : ""}</p><a className="text-link" href={platform === "youtube" ? "https://youtube.com/@kennyswillyy" : "https://twitch.tv/kennyswillyy"} target="_blank" rel="noopener noreferrer">THERE’S MORE OVER HERE <ArrowUpRight size={18} /></a></div>
    <dialog ref={dialog} className="video-dialog" onCancel={close} onClick={event => { if (event.target === dialog.current) close(); }} aria-labelledby="video-dialog-title"><div className="dialog-header"><h3 id="video-dialog-title">{active?.title}</h3><button onClick={close} aria-label="Close video"><X size={24} /></button></div>{active && <><iframe title={active.title} src={active.embedUrl} allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen /><a className="text-link video-fallback" href={active.url} target="_blank" rel="noopener noreferrer">PLAYER NOT AVAILABLE? WATCH ON {active.platform.toUpperCase()} <ArrowUpRight size={17} /></a></>}</dialog>
  </section>;
}

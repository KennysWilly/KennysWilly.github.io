import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Headphones, Music2, Pause, Play, Radio } from "lucide-react";
import type { ActivityResponse, MusicResponse, Playlist } from "../../../shared/integrations";
import snapshot from "@/data/spotify-snapshot.json";
import { spotifyProfile } from "@/data/content";
import { useReducedMotion } from "./AlbumWall";

type DisplayPlaylist = Playlist & { available?: boolean };

function SpotifyMark() {
  return <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="12" r="11" fill="currentColor" /><path d="M6.5 9c4.2-1.2 8.2-.8 11.4 1M7.3 12.2c3.5-.9 6.8-.5 9.6 1M8.2 15.2c2.9-.6 5.1-.3 7.8.9" stroke="#fff" strokeWidth="1.7" fill="none" strokeLinecap="round" /></svg>;
}

export default function MusicSection({ data, loading, error, retry, activity, activityLoading, activityError, retryActivity }: { data?: MusicResponse; loading: boolean; error: boolean; retry: () => void; activity?: ActivityResponse; activityLoading: boolean; activityError: boolean; retryActivity: () => void }) {
  const playlists: DisplayPlaylist[] = data?.playlists.length ? data.playlists : snapshot.playlists;
  const [position, setPosition] = useState(0);
  const [rotating, setRotating] = useState(true);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (!rotating || reduced || playlists.length < 2) return;
    const timer = setInterval(() => setPosition(value => value + 1), 12000);
    return () => clearInterval(timer);
  }, [rotating, reduced, playlists.length]);
  const active = playlists[position % playlists.length];
  const move = (direction: number) => { setPosition(value => (value + direction + playlists.length) % playlists.length); setRotating(false); };
  const now = error ? null : data?.nowPlaying;
  const liveActivity = activity?.activities[0];
  const playback = error ? "error" : data?.playbackStatus ?? "disconnected";
  const stateTitle = loading ? "Checking the speakers…" : playback === "error" ? "Connection taking a break." : playback === "disconnected" ? "Live listening is off." : playback === "inactive" ? "A little quiet right now." : playback === "paused" ? "On pause." : "On the speakers.";
  const activityTitle = activityLoading ? "Checking Discord…" : liveActivity?.name ?? (now ? now.name : "No live activity");
  const activityDescription = liveActivity ? [liveActivity.details, liveActivity.state].filter(Boolean).join(" · ") || "Active on Discord." : now ? now.album : activityError ? "Discord activity could not be reached. Try again in a bit." : "When KennysWilly is doing something on Discord, it shows up here.";

  return <section className="section music-section" id="music" aria-labelledby="music-title">
    <div className="section-top"><div><div className="eyebrow">01 / THE SOUNDTRACK</div><h2 id="music-title">THE ROTATION<span className="orange-text">.</span></h2></div><p>Kanye, DOOM, D’Angelo, Marvin.<br />Different decades. Same standard.</p></div>
    <div className="music-layout">
      <div className="playlist-card">
        <div className="card-overline"><span><SpotifyMark /> MY PLAYLISTS</span><span>{String((position % playlists.length) + 1).padStart(2, "0")} / {String(playlists.length).padStart(2, "0")}</span></div>
        <div className="playlist-info">
          <div className="playlist-cover">{active.image ? <img src={active.image} alt={`${active.name} playlist cover`} loading="lazy" /> : <Music2 size={64} />}</div>
          <div><span className="tiny-label">CURATED BY KENNYSWILLY</span><h3>{active.name}</h3><p>{active.description}</p><a className="text-link" href={active.url} target="_blank" rel="noopener noreferrer">OPEN IN SPOTIFY <ArrowUpRight size={18} /></a></div>
        </div>
        {active.available !== false ? <iframe key={active.id} title={`${active.name} on Spotify`} className="spotify-embed" src={`https://open.spotify.com/embed/playlist/${active.id}?utm_source=generator&theme=0`} height="152" width="100%" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" /> : <div className="playlist-unavailable">This link returned “not found” publicly. It may be private or unavailable. The original Spotify link is still above.</div>}
        <div className="playlist-footer"><a href={spotifyProfile} target="_blank" rel="noopener noreferrer">MY SPOTIFY PROFILE <ArrowUpRight size={15} /></a><div className="pager"><button aria-label="Previous playlist" onClick={() => move(-1)}><ArrowLeft size={18} /></button><button aria-label={rotating ? "Pause playlist rotation" : "Resume playlist rotation"} onClick={() => setRotating(!rotating)}>{rotating ? <Pause size={15} /> : <Play size={15} />}</button><button aria-label="Next playlist" onClick={() => move(1)}><ArrowRight size={18} /></button></div></div>
      </div>
      <aside className="listening-card activity-card" aria-label="Live Discord activity">
        <div className="card-overline"><span><Radio size={18} /> LIVE ACTIVITY</span><span className={`listening-status ${activity?.discordStatus === "online" ? "playing" : ""}`}><span />{activityLoading ? "CHECKING" : (activity?.discordStatus ?? "OFFLINE").toUpperCase()}</span></div>
        <div className="listening-art">{liveActivity?.largeImage ? <img src={liveActivity.largeImage} alt={liveActivity.largeText || `${liveActivity.name} activity`} /> : now?.image ? <img src={now.image} alt={`${now.album} cover`} /> : <div className="record"><div><Headphones size={25} /></div></div>}</div>
        <div className="listening-copy"><span className="tiny-label">{liveActivity ? `${activity?.username ?? "KENNYSWILLY"} / DISCORD` : now ? now.artists.join(" / ") : "DISCORD PRESENCE"}</span><h3>{activityTitle}</h3><p>{activityDescription}</p></div>
        {liveActivity?.url ? <a href={liveActivity.url} target="_blank" rel="noopener noreferrer" className="text-link">OPEN ACTIVITY <ArrowUpRight size={16} /></a> : now ? <><div className="track-progress"><span style={{ width: `${Math.min(100, (now.progressMs / Math.max(1, now.durationMs)) * 100)}%` }} /></div><a href={now.url} target="_blank" rel="noopener noreferrer" className="text-link">LISTEN ON SPOTIFY <ArrowUpRight size={16} /></a></> : activityError ? <button className="text-link" onClick={retryActivity}>TRY DISCORD AGAIN <ArrowRight size={16} /></button> : <div className="connection-note"><span />{activityLoading ? "CHECKING LANYARD" : "NO ACTIVE DISCORD ACTIVITY"}</div>}
      </aside>
    </div>
    <p className="source-note">{data?.albums.length ? "Wallpaper artwork syncs from my Spotify collection." : "Wallpaper: a snapshot of actual songs in my public playlists. Full library sync needs Spotify authorization."}</p>
  </section>;
}

import { ArrowRight, ArrowUpRight, Headphones, Radio } from "lucide-react";
import type { ActivityResponse, MusicResponse } from "../../../shared/integrations";

const spotifyStats = {
  streams: "1,997",
  minutes: "7,122",
  hours: "119",
  tracks: "1,582",
  artists: "874",
  albums: "1,006",
  genres: ["hip-hop/rap", "r&b/soul", "experimental hip hop", "alternative hip hop", "jazz rap"],
  topTracks: ["THANK ALLAH — Niontay", "Amphetamine — Smino", "So High — John Legend", "Burgundy — Vince Staples / Earl Sweatshirt", "Indecision — Rex Orange County"],
  topArtists: ["Kanye West", "MIKE", "The Weeknd", "Earl Sweatshirt", "Sideshow"],
  topAlbums: ["Doris", "Late Registration", "BULLY - DELUXE", "Beware of the Monkey", "Dontay's Inferno"],
};

function StatsPanel() {
  const spotifyProfile = "https://stats.fm/kw8640173";
  return <div className="stats-panel">
    <div className="card-overline"><span>COMBINED LISTENING / VERIFIED SOURCES</span><a href={spotifyProfile} target="_blank" rel="noopener noreferrer">OPEN STATS.FM <ArrowUpRight size={14} /></a></div>
    <div className="stats-provider-strip"><span>SPOTIFY / STATS.FM</span><span>APPLE MUSIC / NOT CONNECTED</span></div>
    <div className="stats-window-note">BIG NIG KENNY / PUBLIC SNAPSHOT / PAST 4 WEEKS</div>
    <div className="stats-metrics"><div><strong>{spotifyStats.streams}</strong><span>STREAMS</span></div><div><strong>{spotifyStats.minutes}</strong><span>MINUTES</span></div><div><strong>{spotifyStats.tracks}</strong><span>TRACKS</span></div><div><strong>{spotifyStats.artists}</strong><span>ARTISTS</span></div><div><strong>{spotifyStats.albums}</strong><span>ALBUMS</span></div><div><strong>{spotifyStats.hours}</strong><span>HOURS</span></div></div>
    <div className="stats-lists"><div><span className="stats-list-label">TOP TRACKS</span>{spotifyStats.topTracks.map((item, index) => <p key={item}><b>0{index + 1}</b>{item}</p>)}</div><div><span className="stats-list-label">TOP ARTISTS</span>{spotifyStats.topArtists.map((item, index) => <p key={item}><b>0{index + 1}</b>{item}</p>)}</div><div><span className="stats-list-label">TOP ALBUMS</span>{spotifyStats.topAlbums.map((item, index) => <p key={item}><b>0{index + 1}</b>{item}</p>)}</div><div><span className="stats-list-label">TOP GENRES</span>{spotifyStats.genres.map((item, index) => <p key={item}><b>0{index + 1}</b>{item}</p>)}</div></div>
    <div className="stats-apple-note"><strong>APPLE MUSIC VALUES WILL JOIN THIS VIEW AFTER AUTHORIZATION.</strong><p>Personal Apple Music history requires a Music User Token. No Apple Music numbers are merged into the Spotify snapshot until that connection exists.</p><a className="text-link" href="https://developer.apple.com/documentation/applemusicapi/get-v1-me-recent-played-tracks" target="_blank" rel="noopener noreferrer">SEE THE AUTH REQUIREMENT <ArrowUpRight size={16} /></a></div>
  </div>;
}

export default function MusicSection({ data, loading, error, retry, activity, activityLoading, activityError, retryActivity }: { data?: MusicResponse; loading: boolean; error: boolean; retry: () => void; activity?: ActivityResponse; activityLoading: boolean; activityError: boolean; retryActivity: () => void }) {
  const now = error ? null : data?.nowPlaying;
  const liveActivity = activity?.activities[0];
  const spotifyActivity = activity?.spotify;
  const playback = error ? "error" : data?.playbackStatus ?? "disconnected";
  const topArtists = data?.topArtists?.length ? data.topArtists.join(" / ") : "Kanye West / MF DOOM / D’Angelo / Marvin Gaye";
  const stateTitle = loading ? "Checking the speakers…" : playback === "error" ? "Connection taking a break." : playback === "disconnected" ? "Live listening is off." : playback === "inactive" ? "A little quiet right now." : playback === "paused" ? "On pause." : "On the speakers.";
  const activityTitle = activityLoading ? "Checking live status…" : spotifyActivity?.name ?? liveActivity?.name ?? (now ? now.name : "Nothing live right now");
  const activityDescription = spotifyActivity ? spotifyActivity.album : liveActivity ? [liveActivity.details, liveActivity.state].filter(Boolean).join(" · ") || "Active on Discord." : now ? now.album : activityError ? "Couldn't reach Discord right now. Try again in a minute." : "No current Discord activity.";

  return <section className="section music-section" id="music" aria-labelledby="music-title">
    <div className="section-top"><div><div className="eyebrow">01 / MUSIC</div><h2 id="music-title">WHAT I'M PLAYING<span className="orange-text">.</span></h2></div><p>{topArtists}.<br />The names getting the most spins.</p></div>
    <div className="music-layout">
      <StatsPanel />
      <aside className="listening-card activity-card retro-mp3-player" aria-label="Live Discord activity">
        <div className="card-overline"><span><Radio size={18} /> LIVE ACTIVITY</span><span className={`listening-status ${activity?.discordStatus === "online" ? "playing" : ""}`}><span />{activityLoading ? "CHECKING" : (activity?.discordStatus ?? "OFFLINE").toUpperCase()}</span></div>
        <div className={`listening-art ${spotifyActivity ? "vinyl-stage" : ""}`}>{spotifyActivity?.image ? <a className="vinyl-record" href={spotifyActivity.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${spotifyActivity.name} on Spotify`}><img src={spotifyActivity.image} alt={`${spotifyActivity.album} album art`} /><span className="vinyl-hole" /></a> : liveActivity?.largeImage ? <img src={liveActivity.largeImage} alt={liveActivity.largeText || `${liveActivity.name} activity`} /> : now?.image ? <img src={now.image} alt={`${now.album} cover`} /> : <div className="record"><div><Headphones size={25} /></div></div>}</div>
        <div className="listening-copy"><span className="tiny-label">{spotifyActivity ? spotifyActivity.artists.join(" / ") : liveActivity ? `${activity?.username ?? "KENNYSWILLY"} / DISCORD` : now ? now.artists.join(" / ") : "DISCORD PRESENCE"}</span><h3>{activityTitle}</h3><p>{activityDescription}</p></div>
        {spotifyActivity ? <a href={spotifyActivity.url} target="_blank" rel="noopener noreferrer" className="text-link">LISTEN ON SPOTIFY <ArrowUpRight size={16} /></a> : liveActivity?.url ? <a href={liveActivity.url} target="_blank" rel="noopener noreferrer" className="text-link">OPEN ACTIVITY <ArrowUpRight size={16} /></a> : now ? <><div className="track-progress"><span style={{ width: `${Math.min(100, (now.progressMs / Math.max(1, now.durationMs)) * 100)}%` }} /></div><a href={now.url} target="_blank" rel="noopener noreferrer" className="text-link">LISTEN ON SPOTIFY <ArrowUpRight size={16} /></a></> : activityError ? <button className="text-link" onClick={retryActivity}>TRY AGAIN <ArrowRight size={16} /></button> : <div className="connection-note"><span />{activityLoading ? "CHECKING LANYARD" : "NOTHING LIVE RIGHT NOW"}</div>}
      </aside>
    </div>
    <p className="source-note">{data?.albums.length ? "Wallpaper artwork syncs from my Spotify collection." : "Wallpaper: a snapshot of actual songs in my public playlists. Full library sync needs Spotify authorization."}</p>
  </section>;
}

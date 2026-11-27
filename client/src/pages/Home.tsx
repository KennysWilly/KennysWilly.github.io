import { useEffect, useMemo, useState } from "react";
import Hero, { Navigation, Ticker } from "@/components/Hero";
import MusicSection from "@/components/MusicSection";
import Highlights from "@/components/Highlights";
import MarketsSection from "@/components/MarketsSection";
import { Footer, Socials, StreamForms, TwitchSection } from "@/components/AboutSocial";
import { useReducedMotion } from "@/components/AlbumWall";
import { useActivity, useMusic } from "@/hooks/usePublicData";
import snapshot from "@/data/spotify-snapshot.json";

export default function Home() {
  const music = useMusic();
  const activity = useActivity();
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const [scrollProgress, setScrollProgress] = useState(0);
  const listeningSeed = music.data?.nowPlaying?.name ?? activity.data?.spotify?.name ?? "kennyswilly";
  const listeningHue = [...listeningSeed].reduce((sum, character) => sum + character.charCodeAt(0), 0) % 360;
  useEffect(() => {
    const updateScroll = () => setScrollProgress(Math.min(1, window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight)));
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);
  const albums = useMemo(() => {
    const source = music.data?.albums.length ? music.data.albums : snapshot.albums;
    return [...source].sort(() => Math.random() - 0.5);
  }, [music.data?.albums]);
  return <div id="top" className={paused || reduced ? "site motion-paused" : "site"} style={{ "--scroll-progress": scrollProgress, "--listening-hue": listeningHue, "--listening-hue-2": (listeningHue + 74) % 360 } as React.CSSProperties}>
    <a href="#music" className="skip-link">Skip to music and playlists</a>
    <Navigation />
    <main><Hero albums={albums} paused={paused || reduced} setPaused={setPaused} connected={Boolean(music.data?.albums.length)} /><Ticker /><TwitchSection /><Highlights /><StreamForms /><MarketsSection /><MusicSection data={music.data} loading={music.isLoading} error={music.isError} retry={() => void music.refetch()} activity={activity.data} activityLoading={activity.isLoading} activityError={activity.isError} retryActivity={() => void activity.refetch()} /><Socials /></main>
    <Footer />
  </div>;
}

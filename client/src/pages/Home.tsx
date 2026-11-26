import { useMemo, useState } from "react";
import Hero, { Navigation, Ticker } from "@/components/Hero";
import MusicSection from "@/components/MusicSection";
import Highlights from "@/components/Highlights";
import { About, Footer, Socials } from "@/components/AboutSocial";
import { useReducedMotion } from "@/components/AlbumWall";
import { useActivity, useMusic } from "@/hooks/usePublicData";
import snapshot from "@/data/spotify-snapshot.json";

export default function Home() {
  const music = useMusic();
  const activity = useActivity();
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();
  const albums = useMemo(() => {
    const source = music.data?.albums.length ? music.data.albums : snapshot.albums;
    return [...source].sort(() => Math.random() - 0.5);
  }, [music.data?.albums]);
  return <div id="top" className={paused || reduced ? "site motion-paused" : "site"}>
    <a href="#music" className="skip-link">Skip to music and playlists</a>
    <Navigation />
    <main><Hero albums={albums} paused={paused || reduced} setPaused={setPaused} connected={Boolean(music.data?.albums.length)} /><Ticker /><MusicSection data={music.data} loading={music.isLoading} error={music.isError} retry={() => void music.refetch()} activity={activity.data} activityLoading={activity.isLoading} activityError={activity.isError} retryActivity={() => void activity.refetch()} /><Highlights /><About /><Socials /></main>
    <Footer />
  </div>;
}

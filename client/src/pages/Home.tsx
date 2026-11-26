import { useState } from "react";
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
  const albums = music.data?.albums.length ? music.data.albums : snapshot.albums;
  return <div id="top" className={paused || reduced ? "site motion-paused" : "site"}>
    <svg className="glass-filter-defs" aria-hidden="true" focusable="false"><defs><filter id="glass-distortion" x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.028" numOctaves="2" seed="11" result="noise" /><feDisplacementMap in="SourceGraphic" in2="noise" scale="13" xChannelSelector="R" yChannelSelector="B" /></filter></defs></svg>
    <a href="#music" className="skip-link">Skip to music and playlists</a>
    <Navigation />
    <main><Hero albums={albums} paused={paused || reduced} setPaused={setPaused} connected={Boolean(music.data?.albums.length)} /><Ticker /><MusicSection data={music.data} loading={music.isLoading} error={music.isError} retry={() => void music.refetch()} activity={activity.data} activityLoading={activity.isLoading} activityError={activity.isError} retryActivity={() => void activity.refetch()} /><Highlights /><About /><Socials /></main>
    <Footer />
  </div>;
}

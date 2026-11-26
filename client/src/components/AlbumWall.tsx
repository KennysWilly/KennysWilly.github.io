import { useEffect, useState } from "react";
import type { Album } from "../../../shared/integrations";

export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

function Tile({ albums, index, paused }: { albums: Album[]; index: number; paused: boolean }) {
  const [position, setPosition] = useState(index);
  useEffect(() => {
    if (paused || albums.length < 2) return;
    let timer: ReturnType<typeof setTimeout>;
    let active = true;
    const change = () => {
      if (!active) return;
      setPosition(value => value + 1 + (index % 3));
      timer = setTimeout(change, 5000 + Math.random() * 6500);
    };
    timer = setTimeout(change, 4500 + ((index * 773) % 7300));
    return () => { active = false; clearTimeout(timer); };
  }, [paused, albums.length, index]);
  const album = albums[position % albums.length];
  if (!album) return null;
  return <a className="album-tile" href={album.url} target="_blank" rel="noopener noreferrer" title={`${album.name} · ${album.artist}`} tabIndex={-1} aria-hidden="true">
    <img key={album.image} src={album.image} alt="" loading={index < 12 ? "eager" : "lazy"} />
  </a>;
}

export default function AlbumWall({ albums, paused }: { albums: Album[]; paused: boolean }) {
  return <div className="album-wall" aria-hidden="true">
    <div className="album-mosaic">{Array.from({ length: 20 }, (_, index) => <Tile key={index} index={index} albums={albums} paused={paused} />)}</div>
    <div className="wall-grain" />
  </div>;
}

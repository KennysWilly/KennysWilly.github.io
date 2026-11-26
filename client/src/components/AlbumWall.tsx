import { useCallback, useEffect, useMemo, useState } from "react";
import type { Album } from "../../../shared/integrations";

const TILE_COUNT = 20;
const MAX_RECENT_COVERS = 48;

type RotationState = {
  visible: Album[];
  recentImages: string[];
};

function shuffled<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function uniqueAlbums(albums: Album[]) {
  const seen = new Set<string>();
  return albums.filter(album => {
    if (!album.image || seen.has(album.image)) return false;
    seen.add(album.image);
    return true;
  });
}

function createRotation(albums: Album[]): RotationState {
  const visible = shuffled(albums).slice(0, TILE_COUNT);
  return { visible, recentImages: visible.map(album => album.image) };
}

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

function Tile({ album, index, paused, rotate }: { album?: Album; index: number; paused: boolean; rotate: (index: number) => void }) {
  useEffect(() => {
    if (paused) return;
    let timer: ReturnType<typeof setTimeout>;
    let active = true;
    const change = () => {
      if (!active) return;
      rotate(index);
      timer = setTimeout(change, 5000 + Math.random() * 6500);
    };
    timer = setTimeout(change, 4500 + ((index * 773) % 7300));
    return () => { active = false; clearTimeout(timer); };
  }, [paused, index, rotate]);
  if (!album) return null;
  return <a className="album-tile" href={album.url} target="_blank" rel="noopener noreferrer" title={`${album.name} · ${album.artist}`} tabIndex={-1} aria-hidden="true">
    <img key={album.image} src={album.image} alt="" loading={index < 12 ? "eager" : "lazy"} />
  </a>;
}

export default function AlbumWall({ albums, paused }: { albums: Album[]; paused: boolean }) {
  const source = useMemo(() => uniqueAlbums(albums), [albums]);
  const [rotation, setRotation] = useState<RotationState>(() => createRotation(source));

  useEffect(() => {
    setRotation(createRotation(source));
  }, [source]);

  const rotate = useCallback((index: number) => {
    setRotation(current => {
      const outgoing = current.visible[index];
      if (!outgoing || source.length <= 1) return current;
      const visibleImages = new Set(current.visible.map(album => album.image));
      const recentImages = new Set(current.recentImages);
      let candidates = source.filter(album => !visibleImages.has(album.image) && !recentImages.has(album.image));
      if (!candidates.length) {
        candidates = source.filter(album => !visibleImages.has(album.image));
      }
      const incoming = shuffled(candidates)[0];
      if (!incoming || incoming.image === outgoing.image) return current;
      return {
        visible: current.visible.map((album, slot) => slot === index ? incoming : album),
        recentImages: [...current.recentImages.filter(image => image !== incoming.image), outgoing.image].slice(-MAX_RECENT_COVERS),
      };
    });
  }, [source]);

  return <div className="album-wall" aria-hidden="true">
    <div className="album-mosaic">{Array.from({ length: TILE_COUNT }, (_, index) => <Tile key={index} index={index} album={rotation.visible[index]} paused={paused} rotate={rotate} />)}</div>
    <div className="wall-grain" />
  </div>;
}

import { useQuery } from "@tanstack/react-query";
import type { ActivityResponse, MusicResponse, ClipsResponse, TwitchStatusResponse } from "../../../shared/integrations";

const isStaticBuild = import.meta.env.VITE_STATIC_BUILD === "true";
const LANYARD_URLS = [
  "https://api.lanyard.rest/v1/users/1181246957390413827",
  "https://lanyard.callen.page/v1/users/1181246957390413827",
];

async function readJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error("The connection is taking a breather. Try again soon.");
  return response.json() as Promise<T>;
}

async function readPublicTwitchStatus(): Promise<TwitchStatusResponse> {
  const response = await fetch("https://decapi.me/twitch/uptime/kennyswillyy", { signal: AbortSignal.timeout(10000), cache: "no-store" });
  if (!response.ok) throw new Error("The public Twitch status check is unavailable.");
  const uptime = (await response.text()).trim();
  const live = Boolean(uptime) && !/^offline$/i.test(uptime);
  return {
    status: "connected",
    username: "kennyswillyy",
    live,
    viewerCount: null,
    followerCount: null,
    title: live ? "KennysWilly is live on Twitch." : "Twitch is offline.",
    message: live ? `Live for ${uptime}.` : "Twitch is currently offline.",
    startedAt: null,
    updatedAt: new Date().toISOString(),
  };
}

function staticActivity(value: unknown): ActivityResponse {
  const body = value && typeof value === "object" ? value as Record<string, any> : {};
  const data = body.data && typeof body.data === "object" ? body.data as Record<string, any> : {};
  const user = data.discord_user && typeof data.discord_user === "object" ? data.discord_user : {};
  const spotify = data.spotify && typeof data.spotify === "object" ? data.spotify : null;
  const timestamps = spotify?.timestamps && typeof spotify.timestamps === "object" ? spotify.timestamps : {};
  const spotifyPresence = spotify?.track_id && spotify?.song && spotify?.artist ? {
    name: String(spotify.song),
    artists: String(spotify.artist).split(/\s*[,;]\s*/).map(value => value.trim()).filter(Boolean),
    album: String(spotify.album ?? ""),
    image: typeof spotify.album_art_url === "string" ? spotify.album_art_url : "",
    url: `https://open.spotify.com/track/${spotify.track_id}`,
    startedAt: typeof timestamps.start === "number" ? timestamps.start : null,
    endsAt: typeof timestamps.end === "number" ? timestamps.end : null,
  } : null;
  return {
    status: body.success === true ? "connected" : "error",
    username: String(user.global_name || user.username || "KennysWilly"),
    discordStatus: String(data.discord_status || "offline"),
    activities: [],
    spotify: spotifyPresence,
    listeningToSpotify: data.listening_to_spotify === true,
    updatedAt: new Date().toISOString(),
    ...(body.success === true ? {} : { message: "Discord activity is temporarily unavailable." }),
  };
}

async function readStaticActivity(): Promise<ActivityResponse> {
  let lastError: unknown;
  for (const url of LANYARD_URLS) {
    try {
      return staticActivity(await readJson<unknown>(url));
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError ?? new Error("The Lanyard activity feed is unavailable.");
}

export function useMusic() {
  return useQuery({ queryKey: ["music"], queryFn: () => readJson<MusicResponse>("/api/music"), refetchInterval: 30000, staleTime: 20000, retry: 1, enabled: !isStaticBuild });
}

export function useActivity() {
  return useQuery({ queryKey: ["activity"], queryFn: () => isStaticBuild ? readStaticActivity() : readJson<ActivityResponse>("/api/activity"), refetchInterval: 5000, staleTime: 4000, retry: 1 });
}

export function useClips(platform: "youtube" | "twitch") {
  return useQuery({ queryKey: ["clips", platform], queryFn: () => readJson<ClipsResponse>(`/api/clips?platform=${platform}`), staleTime: 300000, retry: 1, enabled: !isStaticBuild });
}

export function useTwitchStatus() {
  return useQuery({ queryKey: ["twitch-status"], queryFn: readPublicTwitchStatus, refetchInterval: 60000, staleTime: 30000, retry: 1 });
}

import { useQuery } from "@tanstack/react-query";
import type { ActivityResponse, MusicResponse, ClipsResponse } from "../../../shared/integrations";

const isStaticBuild = import.meta.env.VITE_STATIC_BUILD === "true";

async function readJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error("The connection is taking a breather. Try again soon.");
  return response.json() as Promise<T>;
}

export function useMusic() {
  return useQuery({ queryKey: ["music"], queryFn: () => readJson<MusicResponse>("/api/music"), refetchInterval: 30000, staleTime: 20000, retry: 1, enabled: !isStaticBuild });
}

export function useActivity() {
  return useQuery({ queryKey: ["activity"], queryFn: () => readJson<ActivityResponse>("/api/activity"), refetchInterval: 5000, staleTime: 4000, retry: 1, enabled: !isStaticBuild });
}

export function useClips(platform: "youtube" | "twitch") {
  return useQuery({ queryKey: ["clips", platform], queryFn: () => readJson<ClipsResponse>(`/api/clips?platform=${platform}`), staleTime: 300000, retry: 1, enabled: !isStaticBuild });
}

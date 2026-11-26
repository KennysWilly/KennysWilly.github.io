import { useQuery } from "@tanstack/react-query";
import type { MusicResponse, ClipsResponse } from "../../../shared/integrations";

async function readJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error("The connection is taking a breather. Try again soon.");
  return response.json() as Promise<T>;
}

export function useMusic() {
  return useQuery({ queryKey: ["music"], queryFn: () => readJson<MusicResponse>("/api/music"), refetchInterval: 30000, staleTime: 20000, retry: 1 });
}

export function useClips(platform: "youtube" | "twitch") {
  return useQuery({ queryKey: ["clips", platform], queryFn: () => readJson<ClipsResponse>(`/api/clips?platform=${platform}`), staleTime: 300000, retry: 1 });
}

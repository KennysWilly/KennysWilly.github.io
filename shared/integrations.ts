export type IntegrationStatus = "connected" | "disconnected" | "error";
export type ClipPlatform = "youtube" | "twitch";

export interface Album {
  id: string;
  name: string;
  artist: string;
  image: string;
  url: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  image: string;
  url: string;
  /** null means the provider did not supply a total; never a guessed count. */
  totalTracks: number | null;
}

export interface NowPlaying {
  name: string;
  artists: string[];
  album: string;
  image: string;
  url: string;
  progressMs: number;
  durationMs: number;
  isPlaying: boolean;
}

export interface MusicResponse {
  status: IntegrationStatus;
  albums: Album[];
  playlists: Playlist[];
  nowPlaying: NowPlaying | null;
  playbackStatus: "playing" | "paused" | "inactive" | "disconnected" | "error";
  message?: string;
  /** UTC timestamp of this server snapshot, not the track's release date. */
  updatedAt: string;
}

export interface LiveActivity {
  id: string;
  name: string;
  type: number;
  details: string;
  state: string;
  platform: string;
  largeImage: string;
  largeText: string;
  smallImage: string;
  smallText: string;
  url: string;
  startedAt: number | null;
  endsAt: number | null;
}

export interface ActivityResponse {
  status: IntegrationStatus;
  username: string;
  discordStatus: string;
  activities: LiveActivity[];
  updatedAt: string;
  message?: string;
}

export interface Clip {
  id: string;
  platform: ClipPlatform;
  title: string;
  thumbnail: string;
  url: string;
  /** Twitch embeds require the frontend to append parent=window.location.hostname. */
  embedUrl: string;
  views: number | null;
  /** Display duration, such as 2:34 or 1:02:34; omitted when unavailable. */
  duration?: string;
}

export interface ClipsResponse {
  status: IntegrationStatus;
  clips: Clip[];
  message?: string;
  rankingLabel: string;
}

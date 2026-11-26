import { createHash } from "node:crypto";
import type { Express } from "express";
import type {
  Album,
  Clip,
  ClipPlatform,
  ClipsResponse,
  MusicResponse,
  NowPlaying,
  Playlist,
} from "../shared/integrations";

export const TWITCH_USERNAME = "kennyswillyy";
export const YOUTUBE_CHANNEL_ID = "UCrk3hPLM7Po9C6qheU-591w";
const SECOND = 1_000;
const MINUTE = 60 * SECOND;
const PAGE_SIZE = 50;
const MAX_PAGES = 2;
const MAX_PLAYLISTS = 6;
const MAX_ALBUMS = 24;
const MAX_CLIPS = 12;
const ENV_NAMES = [
  "SPOTIFY_CLIENT_ID",
  "SPOTIFY_CLIENT_SECRET",
  "SPOTIFY_REFRESH_TOKEN",
  "TWITCH_CLIENT_ID",
  "TWITCH_CLIENT_SECRET",
  "YOUTUBE_API_KEY",
] as const;
type Provider = "Spotify" | "Twitch" | "YouTube";
type Json = Record<string, unknown>;
type Env = Record<string, string | undefined>;
const object = (value: unknown): Json =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Json)
    : {};
const text = (value: unknown): string =>
  typeof value === "string" ? value : "";
const array = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];
const id = (value: unknown): string =>
  /^[a-zA-Z0-9_-]+$/.test(text(value)) ? text(value) : "";

/** Missing, invalid, or unsafe counts remain unknown rather than becoming invented zeroes. */
export function normalizeCount(value: unknown): number | null {
  if (
    typeof value !== "number" &&
    !(typeof value === "string" && /^\d+$/.test(value))
  )
    return null;
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : null;
}
function image(value: unknown, provider: ClipPlatform | "spotify"): string {
  try {
    const url = new URL(text(value));
    const hosts =
      provider === "spotify"
        ? /(^|\.)(scdn\.co|spotifycdn\.com)$/
        : provider === "youtube"
          ? /(^|\.)(ytimg\.com|ggpht\.com|googleusercontent\.com)$/
          : /(^|\.)(jtvnw\.net|twitchcdn\.net|twitch\.tv)$/;
    return url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      hosts.test(url.hostname)
      ? url.href
      : "";
  } catch {
    return "";
  }
}
const spotifyImage = (images: unknown): string =>
  array(images)
    .map(item => image(object(item).url, "spotify"))
    .find(Boolean) ?? "";
const artists = (value: unknown): string[] =>
  array(value)
    .map(item => text(object(item).name))
    .filter(Boolean);
function unwrapTrack(value: unknown): Json {
  const row = object(value);
  return object("item" in row ? row.item : "track" in row ? row.track : row);
}

/** Accepts saved-track wrappers, 2026 playlist item wrappers, and legacy track wrappers. */
export function normalizeAlbums(rows: unknown[], limit = MAX_ALBUMS): Album[] {
  const albums = new Map<string, Album>();
  for (const row of rows) {
    const track = unwrapTrack(row);
    const album = object(track.album);
    const albumId = id(album.id);
    if (
      track.is_local === true ||
      (track.type && track.type !== "track") ||
      !albumId ||
      !text(album.name)
    )
      continue;
    if (!albums.has(albumId))
      albums.set(albumId, {
        id: albumId,
        name: text(album.name),
        artist:
          artists(album.artists).join(", ") ||
          artists(track.artists).join(", "),
        image: spotifyImage(album.images),
        url: `https://open.spotify.com/album/${albumId}`,
      });
  }
  return [...albums.values()].slice(0, Math.max(0, limit));
}

/** Explicit public visibility AND ownership are required. Unknown visibility is not public. */
export function normalizePlaylist(
  value: unknown,
  ownerId: string
): Playlist | null {
  const row = object(value);
  const playlistId = id(row.id);
  if (
    !ownerId ||
    row.public !== true ||
    object(row.owner).id !== ownerId ||
    !playlistId ||
    !text(row.name)
  )
    return null;
  return {
    id: playlistId,
    name: text(row.name),
    description: text(row.description).replace(/<[^>]*>/g, ""),
    image: spotifyImage(row.images),
    url: `https://open.spotify.com/playlist/${playlistId}`,
    totalTracks: normalizeCount(object(row.items ?? row.tracks).total),
  };
}

export function normalizeNowPlaying(value: unknown): NowPlaying | null {
  const state = object(value);
  const track = object(state.item);
  const album = object(track.album);
  const trackId = id(track.id);
  if (
    object(state.device).is_private_session === true ||
    track.is_local === true ||
    track.type !== "track" ||
    !trackId ||
    !text(track.name)
  )
    return null;
  const durationMs = normalizeCount(track.duration_ms) ?? 0;
  return {
    name: text(track.name),
    artists: artists(track.artists),
    album: text(album.name),
    image: spotifyImage(album.images),
    url: `https://open.spotify.com/track/${trackId}`,
    progressMs: Math.min(normalizeCount(state.progress_ms) ?? 0, durationMs),
    durationMs,
    isPlaying: state.is_playing === true,
  };
}
function duration(seconds: number): string {
  const whole = Math.floor(seconds);
  const hours = Math.floor(whole / 3600);
  const minutes = Math.floor((whole % 3600) / 60);
  const secs = String(whole % 60).padStart(2, "0");
  return hours
    ? `${hours}:${String(minutes).padStart(2, "0")}:${secs}`
    : `${minutes}:${secs}`;
}
export function normalizeDuration(value: unknown): string | undefined {
  if (typeof value === "number")
    return Number.isFinite(value) && value > 0 ? duration(value) : undefined;
  const match =
    /^P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/.exec(
      text(value)
    );
  if (!match) return undefined;
  const seconds =
    Number(match[1] ?? 0) * 86400 +
    Number(match[2] ?? 0) * 3600 +
    Number(match[3] ?? 0) * 60 +
    Number(match[4] ?? 0);
  return seconds > 0 ? duration(seconds) : undefined;
}
export function sortClips(clips: Clip[]): Clip[] {
  return [
    ...new Map(
      clips.map(clip => [`${clip.platform}:${clip.id}`, clip])
    ).values(),
  ].sort((a, b) => {
    if (a.views === null && b.views !== null) return 1;
    if (b.views === null && a.views !== null) return -1;
    return (b.views ?? 0) - (a.views ?? 0) || a.id.localeCompare(b.id);
  });
}
export function normalizeTwitchClips(
  rows: unknown[],
  broadcasterId: string
): Clip[] {
  return sortClips(
    rows.flatMap(value => {
      const row = object(value);
      const clipId = id(row.id);
      if (!clipId || row.broadcaster_id !== broadcasterId || !text(row.title))
        return [];
      return [
        {
          id: clipId,
          platform: "twitch" as const,
          title: text(row.title),
          thumbnail: image(row.thumbnail_url, "twitch"),
          url: `https://clips.twitch.tv/${clipId}`,
          embedUrl: `https://clips.twitch.tv/embed?clip=${encodeURIComponent(clipId)}`,
          views: normalizeCount(row.view_count),
          duration: normalizeDuration(row.duration),
        },
      ];
    })
  );
}
export function normalizeYouTubeClips(rows: unknown[]): Clip[] {
  return sortClips(
    rows.flatMap(value => {
      const row = object(value);
      const snippet = object(row.snippet);
      const status = object(row.status);
      const videoId = text(row.id);
      if (
        !/^[\w-]{11}$/.test(videoId) ||
        snippet.channelId !== YOUTUBE_CHANNEL_ID ||
        !text(snippet.title) ||
        status.privacyStatus !== "public" ||
        status.embeddable !== true ||
        status.uploadStatus !== "processed" ||
        snippet.liveBroadcastContent === "live" ||
        snippet.liveBroadcastContent === "upcoming"
      )
        return [];
      const thumbnails = object(snippet.thumbnails);
      const thumbnail =
        ["maxres", "standard", "high", "medium", "default"]
          .map(size => image(object(thumbnails[size]).url, "youtube"))
          .find(Boolean) ?? "";
      return [
        {
          id: videoId,
          platform: "youtube" as const,
          title: text(snippet.title),
          thumbnail,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}`,
          views: normalizeCount(object(row.statistics).viewCount),
          duration: normalizeDuration(object(row.contentDetails).duration),
        },
      ];
    })
  );
}

class ProviderError extends Error {
  constructor(
    readonly provider: Provider,
    readonly status = 0
  ) {
    super(`${provider} request unavailable`);
  }
}
function safeMessage(provider: Provider, error: unknown): string {
  const status = error instanceof ProviderError ? error.status : 0;
  if (status === 429)
    return `${provider} is rate limited. Please try again later.`;
  if (status === 400 || status === 401 || status === 403)
    return `${provider} access is unavailable. Check server credentials, permissions, and provider app restrictions.`;
  return `${provider} is temporarily unavailable. Please try again later.`;
}
function collection(
  value: Json,
  field: "items" | "data",
  provider: Provider
): unknown[] {
  if (!Array.isArray(value[field])) throw new ProviderError(provider);
  return value[field] as unknown[];
}
interface Options {
  env?: Env;
  fetch?: typeof globalThis.fetch;
  now?: () => number;
}
interface CacheEntry {
  promise: Promise<unknown>;
  expiresAt: number;
  value?: unknown;
}
interface AccessToken {
  value: string;
  expiresAt: number;
}
interface Library {
  albums: Album[];
  playlists: Playlist[];
  message?: string;
}

/** Dependency injection keeps tests offline; production uses server-only process.env and native fetch. */
export function createIntegrations(options: Options = {}) {
  const clock = options.now ?? Date.now;
  const cache = new Map<string, CacheEntry>();
  const cooldown = new Map<Provider, number>();
  let fingerprint = "";
  let rotatedRefreshToken = "";
  const requestFetch =
    options.fetch ??
    ((...args: Parameters<typeof fetch>) => globalThis.fetch(...args));
  function configuration(): Env {
    const env = options.env ?? process.env;
    const key = createHash("sha256")
      .update(JSON.stringify(ENV_NAMES.map(name => env[name] ?? "")))
      .digest("hex");
    if (key !== fingerprint) {
      fingerprint = key;
      cache.clear();
      cooldown.clear();
      rotatedRefreshToken = "";
    }
    return env;
  }
  function memo<T>(
    key: string,
    ttl: number | ((value: T) => number),
    load: () => Promise<T>
  ): Promise<T> {
    const existing = cache.get(key);
    if (existing && existing.expiresAt > clock())
      return existing.promise as Promise<T>;
    const entry: CacheEntry = {
      expiresAt: Infinity,
      promise: Promise.resolve(),
    };
    entry.promise = Promise.resolve()
      .then(load)
      .then(
        value => {
          entry.expiresAt =
            clock() + (typeof ttl === "function" ? ttl(value) : ttl);
          entry.value = value;
          return value;
        },
        error => {
          entry.expiresAt = clock() + 15 * SECOND;
          throw error;
        }
      );
    cache.set(key, entry);
    return entry.promise as Promise<T>;
  }
  async function request(
    provider: Provider,
    url: string,
    init: RequestInit = {},
    allowEmpty = false
  ): Promise<Json> {
    if ((cooldown.get(provider) ?? 0) > clock())
      throw new ProviderError(provider, 429);
    try {
      const timeout = AbortSignal.timeout(8 * SECOND);
      const signal = init.signal
        ? AbortSignal.any([init.signal, timeout])
        : timeout;
      const response = await requestFetch(url, {
        ...init,
        signal,
        redirect: "error",
      });
      if (response.status === 429) {
        const retry = response.headers.get("retry-after");
        const seconds = retry && /^\d+$/.test(retry) ? Number(retry) : NaN;
        const until = retry ? Date.parse(retry) - clock() : NaN;
        const delay = Number.isFinite(seconds)
          ? seconds * SECOND
          : Number.isFinite(until)
            ? until
            : MINUTE;
        cooldown.set(
          provider,
          clock() + Math.min(60 * MINUTE, Math.max(15 * SECOND, delay))
        );
      }
      if (!response.ok) throw new ProviderError(provider, response.status);
      if (allowEmpty && response.status === 204) return {};
      const body: unknown = await response.json();
      if (!body || typeof body !== "object" || Array.isArray(body))
        throw new ProviderError(provider);
      return body as Json;
    } catch (error) {
      // Never retain, log, or publish the upstream error body, URL, or raw network error.
      throw error instanceof ProviderError
        ? error
        : new ProviderError(provider);
    }
  }
  const tokenTtl = (token: AccessToken) =>
    Math.max(0, token.expiresAt - clock() - MINUTE);
  function parseToken(body: Json, provider: Provider): AccessToken {
    const expires = normalizeCount(body.expires_in);
    if (!text(body.access_token) || expires === null || expires === 0)
      throw new ProviderError(provider);
    return {
      value: text(body.access_token),
      expiresAt: clock() + expires * SECOND,
    };
  }
  function spotifyToken(env: Env): Promise<AccessToken> {
    return memo("spotify-token", tokenTtl, async () => {
      const generation = fingerprint;
      const body = await request(
        "Spotify",
        "https://accounts.spotify.com/api/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(`${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`).toString("base64")}`,
          },
          body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: rotatedRefreshToken || env.SPOTIFY_REFRESH_TOKEN!,
          }),
        }
      );
      const token = parseToken(body, "Spotify");
      if (generation === fingerprint && text(body.refresh_token))
        rotatedRefreshToken = text(body.refresh_token);
      return token;
    });
  }
  async function spotify(
    env: Env,
    path: string,
    allowEmpty = false,
    signal?: AbortSignal
  ): Promise<Json> {
    for (let attempt = 0; attempt < 2; attempt++) {
      const token = await spotifyToken(env);
      try {
        return await request(
          "Spotify",
          `https://api.spotify.com/v1${path}`,
          { headers: { Authorization: `Bearer ${token.value}` }, signal },
          allowEmpty
        );
      } catch (error) {
        if (
          !(error instanceof ProviderError) ||
          error.status !== 401 ||
          attempt > 0
        )
          throw error;
        if (cache.get("spotify-token")?.value === token)
          cache.delete("spotify-token");
      }
    }
    throw new ProviderError("Spotify", 401);
  }
  async function spotifyPages(
    env: Env,
    path: string,
    signal?: AbortSignal
  ): Promise<unknown[]> {
    const rows: unknown[] = [];
    for (let page = 0; page < MAX_PAGES; page++) {
      const body = await spotify(
        env,
        `${path}?limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}`,
        false,
        signal
      );
      const items = collection(body, "items", "Spotify");
      rows.push(...items.slice(0, PAGE_SIZE));
      // Never follow a provider-supplied URL with a bearer credential.
      if (!body.next || items.length < PAGE_SIZE) break;
    }
    return rows;
  }
  async function library(env: Env): Promise<Library> {
    const signal = AbortSignal.timeout(30 * SECOND);
    const [me, saved, candidates] = await Promise.all([
      spotify(env, "/me", false, signal),
      spotifyPages(env, "/me/tracks", signal),
      spotifyPages(env, "/me/playlists", signal),
    ]);
    const ownerId = text(me.id);
    if (!ownerId) throw new ProviderError("Spotify");
    const selected = [
      ...new Map(
        candidates.flatMap(row => {
          const playlist = normalizePlaylist(row, ownerId);
          return playlist ? [[playlist.id, playlist] as const] : [];
        })
      ).values(),
    ].slice(0, MAX_PLAYLISTS);
    const playlists: Playlist[] = [];
    const publicTracks: unknown[] = [];
    let partial = false;
    // Two workers bound playlist-content concurrency; each playlist is privacy-checked again after fetching.
    let cursor = 0;
    const results: Array<{ playlist: Playlist; tracks: unknown[] } | null> =
      new Array(selected.length).fill(null);
    await Promise.all(
      Array.from({ length: Math.min(2, selected.length) }, async () => {
        while (cursor < selected.length) {
          const index = cursor++;
          const candidate = selected[index];
          try {
            const tracks = await spotifyPages(
              env,
              `/playlists/${candidate.id}/items`,
              signal
            );
            const details = await spotify(
              env,
              `/playlists/${candidate.id}`,
              false,
              signal
            );
            const verified = normalizePlaylist(details, ownerId);
            if (verified && verified.id === candidate.id)
              results[index] = { playlist: verified, tracks };
          } catch {
            partial = true;
          }
        }
      })
    );
    for (const result of results)
      if (result) {
        playlists.push(result.playlist);
        publicTracks.push(...result.tracks);
      }
    return {
      albums: normalizeAlbums([...saved, ...publicTracks]),
      playlists,
      ...(partial
        ? {
            message:
              "Some public Spotify playlists are unavailable; only verified public content is shown.",
          }
        : {}),
    };
  }
  const responseTtl = (value: { status: string }) =>
    value.status === "connected" ? 20 * SECOND : 15 * SECOND;
  async function getMusic(): Promise<MusicResponse> {
    const env = configuration();
    return memo("music", responseTtl, async () => {
      const updatedAt = new Date(clock()).toISOString();
      if (
        !env.SPOTIFY_CLIENT_ID ||
        !env.SPOTIFY_CLIENT_SECRET ||
        !env.SPOTIFY_REFRESH_TOKEN
      )
        return {
          status: "disconnected",
          albums: [],
          playlists: [],
          nowPlaying: null,
          playbackStatus: "disconnected",
          updatedAt,
          message: "Spotify is not connected. Server-side setup is required.",
        };
      const [libraryResult, playbackResult] = await Promise.allSettled([
        memo(
          "spotify-library",
          (value: Library) => (value.message ? 15 * SECOND : MINUTE),
          () => library(env)
        ),
        spotify(env, "/me/player", true),
      ]);
      const data =
        libraryResult.status === "fulfilled"
          ? libraryResult.value
          : { albums: [], playlists: [] };
      const nowPlaying =
        playbackResult.status === "fulfilled"
          ? normalizeNowPlaying(playbackResult.value)
          : null;
      const messages: string[] = [];
      if (libraryResult.status === "rejected")
        messages.push(safeMessage("Spotify", libraryResult.reason));
      if (data.message) messages.push(data.message);
      if (playbackResult.status === "rejected")
        messages.push(
          `Playback: ${safeMessage("Spotify", playbackResult.reason)}`
        );
      return {
        status: messages.length ? "error" : "connected",
        albums: data.albums,
        playlists: data.playlists,
        nowPlaying,
        playbackStatus:
          playbackResult.status === "rejected"
            ? "error"
            : nowPlaying
              ? nowPlaying.isPlaying
                ? "playing"
                : "paused"
              : "inactive",
        updatedAt: new Date(clock()).toISOString(),
        ...(messages.length ? { message: messages.join(" ") } : {}),
      };
    });
  }
  function twitchToken(env: Env): Promise<AccessToken> {
    return memo("twitch-token", tokenTtl, async () => {
      const body = await request(
        "Twitch",
        "https://id.twitch.tv/oauth2/token",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: env.TWITCH_CLIENT_ID!,
            client_secret: env.TWITCH_CLIENT_SECRET!,
            grant_type: "client_credentials",
          }),
        }
      );
      const token = parseToken(body, "Twitch");
      cache.delete("twitch-validation");
      await validateTwitch(env, token);
      return token;
    });
  }
  async function validateTwitch(env: Env, token: AccessToken): Promise<void> {
    await memo("twitch-validation", 60 * MINUTE, async () => {
      const result = await request(
        "Twitch",
        "https://id.twitch.tv/oauth2/validate",
        { headers: { Authorization: `OAuth ${token.value}` } }
      );
      if (
        result.client_id !== env.TWITCH_CLIENT_ID ||
        !normalizeCount(result.expires_in)
      )
        throw new ProviderError("Twitch", 401);
      return true;
    });
  }
  async function twitch(env: Env, path: string): Promise<Json> {
    for (let attempt = 0; attempt < 2; attempt++) {
      const token = await twitchToken(env);
      try {
        await validateTwitch(env, token);
        return await request("Twitch", `https://api.twitch.tv/helix${path}`, {
          headers: {
            Authorization: `Bearer ${token.value}`,
            "Client-Id": env.TWITCH_CLIENT_ID!,
          },
        });
      } catch (error) {
        if (
          !(error instanceof ProviderError) ||
          error.status !== 401 ||
          attempt > 0
        )
          throw error;
        if (cache.get("twitch-token")?.value === token) {
          cache.delete("twitch-token");
          cache.delete("twitch-validation");
        }
      }
    }
    throw new ProviderError("Twitch", 401);
  }
  async function twitchClips(env: Env): Promise<Clip[]> {
    const users = await twitch(env, `/users?login=${TWITCH_USERNAME}`);
    const user = collection(users, "data", "Twitch")
      .map(object)
      .find(row => text(row.login).toLowerCase() === TWITCH_USERNAME);
    const broadcasterId = id(user?.id);
    if (!broadcasterId) throw new ProviderError("Twitch");
    const rows: unknown[] = [];
    let after = "";
    for (let page = 0; page < MAX_PAGES; page++) {
      const body = await twitch(
        env,
        `/clips?broadcaster_id=${broadcasterId}&first=${PAGE_SIZE}${after ? `&after=${encodeURIComponent(after)}` : ""}`
      );
      const data = collection(body, "data", "Twitch");
      rows.push(...data.slice(0, PAGE_SIZE));
      const next = text(object(body.pagination).cursor);
      if (!next || next === after || data.length < PAGE_SIZE) break;
      after = next;
    }
    return normalizeTwitchClips(rows, broadcasterId).slice(0, MAX_CLIPS);
  }
  async function youtube(
    env: Env,
    endpoint: string,
    params: Record<string, string>
  ): Promise<Json> {
    const query = new URLSearchParams({ ...params, key: env.YOUTUBE_API_KEY! });
    return request(
      "YouTube",
      `https://www.googleapis.com/youtube/v3/${endpoint}?${query}`
    );
  }
  async function youtubeClips(env: Env): Promise<Clip[]> {
    const ids = new Set<string>();
    let pageToken = "";
    for (let page = 0; page < MAX_PAGES; page++) {
      const body = await youtube(env, "search", {
        part: "snippet",
        channelId: YOUTUBE_CHANNEL_ID,
        type: "video",
        order: "viewCount",
        videoEmbeddable: "true",
        maxResults: String(PAGE_SIZE),
        ...(pageToken ? { pageToken } : {}),
      });
      const items = collection(body, "items", "YouTube");
      for (const row of items.slice(0, PAGE_SIZE)) {
        const videoId = text(object(object(row).id).videoId);
        if (/^[\w-]{11}$/.test(videoId)) ids.add(videoId);
      }
      const next = text(body.nextPageToken);
      if (!next || next === pageToken || items.length < PAGE_SIZE) break;
      pageToken = next;
    }
    const values = [...ids];
    const rows: unknown[] = [];
    for (let offset = 0; offset < values.length; offset += PAGE_SIZE) {
      const body = await youtube(env, "videos", {
        part: "snippet,statistics,contentDetails,status",
        id: values.slice(offset, offset + PAGE_SIZE).join(","),
      });
      rows.push(
        ...collection(body, "items", "YouTube").filter(row =>
          ids.has(text(object(row).id))
        )
      );
    }
    return normalizeYouTubeClips(rows).slice(0, MAX_CLIPS);
  }
  async function getClips(platform: ClipPlatform): Promise<ClipsResponse> {
    const env = configuration();
    const provider = platform === "twitch" ? "Twitch" : "YouTube";
    const rankingLabel =
      platform === "twitch"
        ? "Top available Twitch clips by views · all available dates · up to 100 sampled"
        : "Most-viewed public embeddable YouTube uploads · up to 100 API search results";
    return memo(
      `clips-${platform}`,
      value => (value.status === "connected" ? 15 * MINUTE : 15 * SECOND),
      async () => {
        if (
          platform === "twitch"
            ? !env.TWITCH_CLIENT_ID || !env.TWITCH_CLIENT_SECRET
            : !env.YOUTUBE_API_KEY
        )
          return {
            status: "disconnected",
            clips: [],
            rankingLabel,
            message: `${provider} is not connected. Server-side setup is required.`,
          };
        try {
          const clips = await (platform === "twitch"
            ? twitchClips(env)
            : youtubeClips(env));
          return {
            status: "connected",
            clips,
            rankingLabel,
            ...(!clips.length
              ? {
                  message: `No eligible public ${provider} clips are available in this sample.`,
                }
              : {}),
          };
        } catch (error) {
          return {
            status: "error",
            clips: [],
            rankingLabel,
            message: safeMessage(provider, error),
          };
        }
      }
    );
  }
  return { getMusic, getClips };
}

export function registerIntegrationRoutes(
  app: Express,
  integrations = createIntegrations()
): void {
  app.get("/api/music", async (_req, res) => {
    res.set("Cache-Control", "no-store");
    try {
      res.json(await integrations.getMusic());
    } catch {
      res.json({
        status: "error",
        albums: [],
        playlists: [],
        nowPlaying: null,
        playbackStatus: "error",
        updatedAt: new Date().toISOString(),
        message: "Music is temporarily unavailable.",
      } satisfies MusicResponse);
    }
  });
  app.get("/api/clips", async (req, res) => {
    res.set("Cache-Control", "no-store");
    const platform = req.query.platform;
    if (platform !== "youtube" && platform !== "twitch") {
      res
        .status(400)
        .json({
          status: "error",
          clips: [],
          rankingLabel: "Unavailable",
          message: "Choose platform=youtube or platform=twitch.",
        } satisfies ClipsResponse);
      return;
    }
    try {
      res.json(await integrations.getClips(platform));
    } catch {
      res.json({
        status: "error",
        clips: [],
        rankingLabel: "Unavailable",
        message: "Clips are temporarily unavailable.",
      } satisfies ClipsResponse);
    }
  });
}

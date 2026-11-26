import express from "express";
import { createServer } from "node:http";
import { describe, expect, it, vi } from "vitest";
import {
  createIntegrations,
  normalizeLanyard,
  normalizeLanyardActivity,
  normalizeAlbums,
  normalizeCount,
  normalizeDuration,
  normalizeNowPlaying,
  normalizePlaylist,
  normalizeTwitchClips,
  normalizeYouTubeClips,
  registerIntegrationRoutes,
  sortClips,
  TWITCH_USERNAME,
  YOUTUBE_CHANNEL_ID,
} from "./integrations";

const json = (
  body: unknown,
  status = 200,
  headers: Record<string, string> = {}
) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
const spotifyEnv = {
  SPOTIFY_CLIENT_ID: "test-client",
  SPOTIFY_CLIENT_SECRET: "test-secret",
  SPOTIFY_REFRESH_TOKEN: "test-refresh",
};
const twitchEnv = {
  TWITCH_CLIENT_ID: "test-twitch-client",
  TWITCH_CLIENT_SECRET: "test-twitch-secret",
};
const album = (id = "album1") => ({
  id,
  name: `Album ${id}`,
  artists: [{ name: "Artist" }],
  images: [{ url: "https://i.scdn.co/image/cover" }],
});
const track = (albumId = "album1") => ({
  id: "track1",
  type: "track",
  name: "Track",
  album: album(albumId),
  artists: [{ name: "Artist" }],
  duration_ms: 180_000,
});
const playlist = (
  id = "public1",
  visibility: boolean | null = true,
  owner = "owner1"
) => ({
  id,
  name: `Playlist ${id}`,
  public: visibility,
  owner: { id: owner },
  description: "<a>Real description</a>",
  items: { total: 120 },
  images: [{ url: "https://i.scdn.co/image/playlist" }],
});
const playback = (playing = true) => ({
  item: track(),
  is_playing: playing,
  progress_ms: 5_000,
  device: { is_private_session: false },
});
function spotifyFetch(
  overrides: (
    url: URL,
    init?: RequestInit
  ) => Response | undefined | Promise<Response | undefined> = () => undefined
) {
  return vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url = new URL(String(input));
    const override = await overrides(url, init);
    if (override) return override;
    if (url.hostname === "accounts.spotify.com")
      return json({ access_token: "test-access", expires_in: 3600 });
    if (url.pathname === "/v1/me") return json({ id: "owner1" });
    if (url.pathname === "/v1/me/tracks")
      return json({ items: [{ track: track() }], next: null });
    if (url.pathname === "/v1/me/playlists")
      return json({ items: [], next: null });
    if (url.pathname === "/v1/me/player") return json(playback());
    throw new Error("Unexpected mock request");
  }) as ReturnType<typeof vi.fn> & typeof fetch;
}
const video = (id = "abcdefghijk", views: unknown = "20") => ({
  id,
  snippet: {
    channelId: YOUTUBE_CHANNEL_ID,
    title: "Real upload",
    liveBroadcastContent: "none",
    thumbnails: {
      high: { url: "https://i.ytimg.com/vi/abcdefghijk/hqdefault.jpg" },
    },
  },
  status: {
    privacyStatus: "public",
    embeddable: true,
    uploadStatus: "processed",
  },
  statistics: { viewCount: views },
  contentDetails: { duration: "PT2M34S" },
});
const twitchClip = (id = "ClipOne", views: unknown = 10) => ({
  id,
  broadcaster_id: "42",
  title: "Real clip",
  thumbnail_url: "https://clips-media-assets2.twitch.tv/invalid.jpg",
  view_count: views,
  duration: 28.5,
});

describe("pure normalization", () => {
  it("deduplicates album art from saved tracks and both playlist API wrapper versions", () => {
    expect(
      normalizeAlbums([
        { track: track() },
        { item: track() },
        { item: track("album2") },
        { item: null },
        { track: { ...track("localAlbum"), is_local: true } },
        { item: { ...track("episodeAlbum"), type: "episode" } },
      ])
    ).toEqual([
      {
        id: "album1",
        name: "Album album1",
        artist: "Artist",
        image: "https://i.scdn.co/image/cover",
        url: "https://open.spotify.com/album/album1",
      },
      {
        id: "album2",
        name: "Album album2",
        artist: "Artist",
        image: "https://i.scdn.co/image/cover",
        url: "https://open.spotify.com/album/album2",
      },
    ]);
    expect(
      normalizeAlbums([{ track: track() }, { item: track("album2") }], 1)
    ).toHaveLength(1);
  });
  it("requires explicit public visibility and exact ownership, preserving unknown totals", () => {
    expect(normalizePlaylist(playlist(), "owner1")).toMatchObject({
      id: "public1",
      description: "Real description",
      totalTracks: 120,
    });
    for (const publicValue of [false, null, undefined])
      expect(
        normalizePlaylist({ ...playlist(), public: publicValue }, "owner1")
      ).toBeNull();
    expect(
      normalizePlaylist(playlist("followed", true, "someoneElse"), "owner1")
    ).toBeNull();
    expect(
      normalizePlaylist(
        { ...playlist(), items: undefined, tracks: { total: 7 } },
        "owner1"
      )?.totalTracks
    ).toBe(7);
    expect(
      normalizePlaylist({ ...playlist(), items: {} }, "owner1")?.totalTracks
    ).toBeNull();
  });
  it("normalizes pause and progress without publishing private-session or local playback", () => {
    expect(normalizeNowPlaying(playback(false))).toMatchObject({
      artists: ["Artist"],
      isPlaying: false,
      progressMs: 5000,
      durationMs: 180000,
    });
    expect(
      normalizeNowPlaying({ ...playback(), progress_ms: 999999 })?.progressMs
    ).toBe(180000);
    expect(
      normalizeNowPlaying({
        ...playback(),
        device: { is_private_session: true },
      })
    ).toBeNull();
    expect(
      normalizeNowPlaying({ item: { ...track(), is_local: true } })
    ).toBeNull();
    expect(normalizeNowPlaying({})).toBeNull();
  });
  it("keeps missing or invalid views unknown and never invents zero", () => {
    for (const value of [
      null,
      undefined,
      "",
      "12.4",
      "-1",
      -1,
      NaN,
      Infinity,
      "9007199254740992",
      true,
    ])
      expect(normalizeCount(value)).toBeNull();
    expect(normalizeCount("0")).toBe(0);
    expect(normalizeCount("123")).toBe(123);
  });
  it("sorts available view counts descending with unknown views last and no input mutation", () => {
    const clips = [
      normalizeTwitchClips([twitchClip("unknown", null)], "42")[0],
      normalizeTwitchClips([twitchClip("zero", 0)], "42")[0],
      normalizeTwitchClips([twitchClip("high", 90)], "42")[0],
    ];
    expect(sortClips(clips).map(clip => clip.id)).toEqual([
      "high",
      "zero",
      "unknown",
    ]);
    expect(clips[0].id).toBe("unknown");
    expect(sortClips([clips[0], clips[0]])).toHaveLength(1);
  });
  it("filters wrong-channel, private, unprocessed, live, and nonembeddable YouTube videos", () => {
    const valid = video();
    const rows = [
      valid,
      { ...valid, id: "bad" },
      { ...valid, snippet: { ...valid.snippet, channelId: "another" } },
      { ...valid, status: { ...valid.status, privacyStatus: "private" } },
      { ...valid, status: { ...valid.status, uploadStatus: "uploaded" } },
      { ...valid, status: { ...valid.status, embeddable: false } },
      { ...valid, snippet: { ...valid.snippet, liveBroadcastContent: "live" } },
    ];
    expect(normalizeYouTubeClips(rows)).toHaveLength(1);
    expect(normalizeYouTubeClips(rows)[0]).toMatchObject({
      views: 20,
      duration: "2:34",
      url: "https://www.youtube.com/watch?v=abcdefghijk",
    });
    expect(
      normalizeYouTubeClips([video("abcdefghijk", undefined)])[0].views
    ).toBe(20); // helper's default
    expect(
      normalizeYouTubeClips([{ ...valid, statistics: {} }])[0].views
    ).toBeNull();
  });
  it("filters other broadcasters and never trusts provider-supplied embed URLs", () => {
    expect(
      normalizeTwitchClips(
        [
          {
            ...twitchClip(),
            url: "https://evil.example",
            embed_url: "javascript:alert(1)",
          },
          { ...twitchClip("wrong"), broadcaster_id: "43" },
        ],
        "42"
      )
    ).toMatchObject([
      {
        url: "https://clips.twitch.tv/ClipOne",
        embedUrl: "https://clips.twitch.tv/embed?clip=ClipOne",
        thumbnail: "https://clips-media-assets2.twitch.tv/invalid.jpg",
        views: 10,
        duration: "0:28",
      },
    ]);
  });
  it("formats supplied durations and omits unsupported values", () => {
    expect(normalizeDuration("PT1H2M3S")).toBe("1:02:03");
    expect(normalizeDuration("P1DT1S")).toBe("24:00:01");
    expect(normalizeDuration(28.5)).toBe("0:28");
    expect(normalizeDuration("unknown")).toBeUndefined();
    expect(normalizeDuration("PT0S")).toBeUndefined();
  });

  it("normalizes Lanyard presence without trusting arbitrary asset or button URLs", () => {
    const activities = normalizeLanyardActivity([{
      application_id: "1123683254248148992",
      id: "activity-1",
      name: "Modrinth",
      type: 0,
      platform: "desktop",
      state: "Idling...",
      assets: { large_image: "1137523880718762015", large_text: "Modrinth Logo" },
      buttons: ["javascript:alert(1)", "https://example.com/activity"],
      timestamps: { start: 1795676388803 },
    }]);
    expect(activities[0]).toMatchObject({
      name: "Modrinth",
      state: "Idling...",
      largeImage: "https://cdn.discordapp.com/app-assets/1123683254248148992/1137523880718762015.png?size=256",
      url: "",
      startedAt: 1795676388803,
    });
    expect(normalizeLanyard({ success: true, data: { discord_user: { global_name: "Kennyswilly" }, activities, discord_status: "dnd" } })).toMatchObject({
      status: "connected",
      username: "Kennyswilly",
      discordStatus: "dnd",
    });
  });
});

describe("credential and failure behavior", () => {
  it("returns honest disconnected empty data without requesting upstream or Manus auth", async () => {
    const request = vi.fn();
    const service = createIntegrations({ env: {}, fetch: request });
    expect(await service.getMusic()).toMatchObject({
      status: "disconnected",
      albums: [],
      playlists: [],
      nowPlaying: null,
      playbackStatus: "disconnected",
    });
    for (const platform of ["youtube", "twitch"] as const)
      expect(await service.getClips(platform)).toMatchObject({
        status: "disconnected",
        clips: [],
      });
    expect(request).not.toHaveBeenCalled();
  });
  it("treats incomplete Spotify credentials as disconnected", async () => {
    const request = vi.fn();
    const service = createIntegrations({
      env: { SPOTIFY_CLIENT_ID: "only-id" },
      fetch: request,
    });
    expect((await service.getMusic()).status).toBe("disconnected");
    expect(request).not.toHaveBeenCalled();
  });
  it("sanitizes rejected Spotify token responses and coalesces failed calls", async () => {
    const request = vi.fn(async () =>
      json(
        { error_description: "do not reveal test-secret or test-refresh" },
        401
      )
    );
    const service = createIntegrations({ env: spotifyEnv, fetch: request });
    const result = await service.getMusic();
    expect(result).toMatchObject({
      status: "error",
      albums: [],
      playlists: [],
      nowPlaying: null,
      playbackStatus: "error",
    });
    expect(JSON.stringify(result)).not.toContain("test-secret");
    expect(JSON.stringify(result)).not.toContain("test-refresh");
    expect(request).toHaveBeenCalledTimes(1);
    await service.getMusic();
    expect(request).toHaveBeenCalledTimes(1);
  });
  it("sanitizes network timeouts, malformed JSON, and provider error bodies", async () => {
    for (const response of [
      () => Promise.reject(new Error("timeout key=secret")),
      () => Promise.resolve(new Response("not json")),
      () => Promise.resolve(json({ secret: "key-secret" }, 503)),
      () => Promise.resolve(json({})),
    ]) {
      const service = createIntegrations({
        env: { YOUTUBE_API_KEY: "key-secret" },
        fetch: vi.fn(response),
      });
      const result = await service.getClips("youtube");
      expect(result).toMatchObject({ status: "error", clips: [] });
      expect(JSON.stringify(result)).not.toContain("secret");
    }
  });
  it("sets an abort deadline and disallows upstream redirects", async () => {
    const request = spotifyFetch();
    await createIntegrations({ env: spotifyEnv, fetch: request }).getMusic();
    for (const call of request.mock.calls) {
      expect(call[1].redirect).toBe("error");
      expect(call[1].signal).toBeInstanceOf(AbortSignal);
    }
  });
  it("honors a 429 cooldown after the error cache expires", async () => {
    let now = 0;
    const request = vi.fn(async () =>
      json({ error: "secret" }, 429, { "retry-after": "120" })
    );
    const service = createIntegrations({
      env: { YOUTUBE_API_KEY: "key" },
      fetch: request,
      now: () => now,
    });
    expect((await service.getClips("youtube")).message).toContain(
      "rate limited"
    );
    now = 20_000;
    await service.getClips("youtube");
    expect(request).toHaveBeenCalledTimes(1);
    now = 121_000;
    await service.getClips("youtube");
    expect(request).toHaveBeenCalledTimes(2);
  });
  it("invalidates disconnected caches when private deployment configuration changes", async () => {
    const env: Record<string, string> = {};
    const request = spotifyFetch();
    const service = createIntegrations({ env, fetch: request });
    expect((await service.getMusic()).status).toBe("disconnected");
    Object.assign(env, spotifyEnv);
    expect((await service.getMusic()).status).toBe("connected");
    expect(request).toHaveBeenCalled();
  });
});

describe("Spotify loading, privacy and caching", () => {
  it("loads real public owned playlists through /items and excludes private/followed content before fetching", async () => {
    const request = spotifyFetch(url => {
      if (url.pathname === "/v1/me/playlists")
        return json({
          items: [
            playlist(),
            playlist("private1", false),
            playlist("unknown1", null),
            playlist("followed1", true, "another"),
          ],
          next: null,
        });
      if (url.pathname === "/v1/playlists/public1/items")
        return json({ items: [{ item: track("publicAlbum") }], next: null });
      if (url.pathname === "/v1/playlists/public1") return json(playlist());
    });
    const result = await createIntegrations({
      env: spotifyEnv,
      fetch: request,
    }).getMusic();
    expect(result).toMatchObject({
      status: "connected",
      playlists: [{ id: "public1", totalTracks: 120 }],
      playbackStatus: "playing",
    });
    expect(result.albums.map(item => item.id)).toEqual([
      "album1",
      "publicAlbum",
    ]);
    const urls = request.mock.calls.map(call => String(call[0]));
    expect(
      urls.some(url => /playlists\/(private1|unknown1|followed1)/.test(url))
    ).toBe(false);
    expect(urls.some(url => /playlists\/public1\/tracks/.test(url))).toBe(
      false
    );
  });
  it("drops playlist-derived art when a playlist becomes private before publication", async () => {
    const request = spotifyFetch(url => {
      if (url.pathname === "/v1/me/playlists")
        return json({ items: [playlist()], next: null });
      if (url.pathname === "/v1/playlists/public1/items")
        return json({ items: [{ item: track("becamePrivate") }], next: null });
      if (url.pathname === "/v1/playlists/public1")
        return json(playlist("public1", false));
    });
    const result = await createIntegrations({
      env: spotifyEnv,
      fetch: request,
    }).getMusic();
    expect(result.playlists).toEqual([]);
    expect(result.albums.map(item => item.id)).toEqual(["album1"]);
  });
  it("fails closed on failed privacy rechecks but keeps independent saved-track artwork", async () => {
    const request = spotifyFetch(url => {
      if (url.pathname === "/v1/me/playlists")
        return json({ items: [playlist()], next: null });
      if (url.pathname === "/v1/playlists/public1/items")
        return json({ items: [{ item: track("privateArt") }], next: null });
      if (url.pathname === "/v1/playlists/public1")
        return json({ error: "not public" }, 403);
    });
    const result = await createIntegrations({
      env: spotifyEnv,
      fetch: request,
    }).getMusic();
    expect(result.status).toBe("error");
    expect(result.playlists).toEqual([]);
    expect(result.albums.map(item => item.id)).toEqual(["album1"]);
  });
  it("bounds pagination without following malicious next URLs", async () => {
    const request = spotifyFetch(url => {
      if (url.pathname === "/v1/me/tracks")
        return json({
          items: Array.from({ length: 50 }, (_, index) => ({
            track: track(`album${url.searchParams.get("offset")}_${index}`),
          })),
          next: "https://evil.example/steal",
        });
      if (url.pathname === "/v1/me/playlists")
        return json({
          items: Array.from({ length: 50 }, () => playlist("private", false)),
          next: "https://evil.example/steal",
        });
    });
    const result = await createIntegrations({
      env: spotifyEnv,
      fetch: request,
    }).getMusic();
    expect(result.albums).toHaveLength(24);
    expect(
      request.mock.calls.filter(call => String(call[0]).includes("/me/tracks?"))
    ).toHaveLength(2);
    expect(
      request.mock.calls.filter(call =>
        String(call[0]).includes("/me/playlists?")
      )
    ).toHaveLength(2);
    expect(
      request.mock.calls.some(call => String(call[0]).includes("evil.example"))
    ).toBe(false);
  });
  it("coalesces concurrent snapshots and token refresh and caches the library separately", async () => {
    let now = 0;
    const request = spotifyFetch();
    const service = createIntegrations({
      env: spotifyEnv,
      fetch: request,
      now: () => now,
    });
    const [a, b] = await Promise.all([service.getMusic(), service.getMusic()]);
    expect(a).toEqual(b);
    expect(request).toHaveBeenCalledTimes(5);
    now = 21_000;
    await service.getMusic();
    expect(request).toHaveBeenCalledTimes(6); // playback only
    now = 62_000;
    await service.getMusic();
    expect(request).toHaveBeenCalledTimes(10); // library + playback, access token still cached
  });
  it("returns inactive for no playback and error for upstream playback failure without discarding a good library", async () => {
    for (const [response, expected] of [
      [new Response(null, { status: 204 }), "inactive"],
      [json({}, 503), "error"],
    ] as const) {
      const service = createIntegrations({
        env: spotifyEnv,
        fetch: spotifyFetch(url =>
          url.pathname === "/v1/me/player" ? response : undefined
        ),
      });
      const result = await service.getMusic();
      expect(result.playbackStatus).toBe(expected);
      expect(result.nowPlaying).toBeNull();
      expect(result.albums).toHaveLength(1);
    }
  });
  it("renews once and coalesces concurrent 401 responses against an expired token", async () => {
    let tokenCalls = 0;
    const request = spotifyFetch((url, init) => {
      if (url.hostname === "accounts.spotify.com")
        return json({
          access_token: ++tokenCalls === 1 ? "old-token" : "new-token",
          expires_in: 3600,
        });
      if (
        new Headers(init?.headers).get("Authorization") === "Bearer old-token"
      )
        return json({}, 401);
    });
    const result = await createIntegrations({
      env: spotifyEnv,
      fetch: request,
    }).getMusic();
    expect(result.status).toBe("connected");
    expect(tokenCalls).toBe(2);
  });
  it("refreshes before token expiry, retaining rotated refresh tokens only server-side", async () => {
    let now = 0;
    let tokenCalls = 0;
    const request = spotifyFetch(url =>
      url.hostname === "accounts.spotify.com"
        ? json({
            access_token: `access-${++tokenCalls}`,
            expires_in: 120,
            refresh_token: "rotated-private-refresh",
          })
        : undefined
    );
    const service = createIntegrations({
      env: spotifyEnv,
      fetch: request,
      now: () => now,
    });
    await service.getMusic();
    now = 61_000;
    const result = await service.getMusic();
    expect(tokenCalls).toBe(2);
    const calls = request.mock.calls.filter(call =>
      String(call[0]).includes("accounts.spotify.com")
    );
    expect(String(calls[1][1].body)).toContain(
      "refresh_token=rotated-private-refresh"
    );
    expect(JSON.stringify(result)).not.toContain("rotated-private-refresh");
  });
});

describe("clips provider requests", () => {
  it("looks up exactly kennyswillyy, uses app credentials, validates token, and sorts real Twitch counts", async () => {
    const request = vi.fn(async (input: string | URL | Request) => {
      const url = new URL(String(input));
      if (url.pathname === "/oauth2/token")
        return json({ access_token: "app-token", expires_in: 3600 });
      if (url.pathname === "/oauth2/validate")
        return json({
          client_id: twitchEnv.TWITCH_CLIENT_ID,
          expires_in: 3600,
        });
      if (url.pathname === "/helix/users") {
        expect(url.searchParams.get("login")).toBe("kennyswillyy");
        return json({ data: [{ id: "42", login: TWITCH_USERNAME }] });
      }
      if (url.pathname === "/helix/clips") {
        expect(url.searchParams.has("started_at")).toBe(false);
        return json({
          data: [
            twitchClip("low", 3),
            twitchClip("missing", null),
            twitchClip("high", 50),
          ],
          pagination: {},
        });
      }
      throw new Error("Unexpected mock request");
    });
    const result = await createIntegrations({
      env: twitchEnv,
      fetch: request,
    }).getClips("twitch");
    expect(result.status).toBe("connected");
    expect(result.clips.map(clip => clip.id)).toEqual([
      "high",
      "low",
      "missing",
    ]);
    expect(result.rankingLabel).toContain("all available dates");
    expect(request).toHaveBeenCalledTimes(4);
    expect(JSON.stringify(result)).not.toContain("app-token");
  });
  it("fails safely when Twitch lookup or token validation fails", async () => {
    for (const lookupFailure of [false, true]) {
      const request = vi.fn(async (input: string | URL | Request) => {
        const url = new URL(String(input));
        if (url.pathname === "/oauth2/token")
          return json({ access_token: "app-token", expires_in: 3600 });
        if (url.pathname === "/oauth2/validate")
          return lookupFailure
            ? json({ client_id: twitchEnv.TWITCH_CLIENT_ID, expires_in: 3600 })
            : json({}, 401);
        return json({ data: [] });
      });
      const result = await createIntegrations({
        env: twitchEnv,
        fetch: request,
      }).getClips("twitch");
      expect(result).toMatchObject({ status: "error", clips: [] });
      expect(JSON.stringify(result)).not.toContain("app-token");
    }
  });
  it("enforces channel and embedding filters and obtains real YouTube statistics", async () => {
    const request = vi.fn(async (input: string | URL | Request) => {
      const url = new URL(String(input));
      if (url.pathname.endsWith("/search")) {
        expect(url.searchParams.get("channelId")).toBe(YOUTUBE_CHANNEL_ID);
        expect(url.searchParams.get("order")).toBe("viewCount");
        expect(url.searchParams.get("type")).toBe("video");
        expect(url.searchParams.get("videoEmbeddable")).toBe("true");
        return json({
          items: [
            { id: { videoId: "abcdefghijk" } },
            { id: { videoId: "lmnopqrstuv" } },
            { id: { videoId: "12345678901" } },
          ],
        });
      }
      expect(url.searchParams.get("part")).toContain("statistics");
      return json({
        items: [
          video("abcdefghijk", "4"),
          video("lmnopqrstuv", "90"),
          {
            ...video("12345678901", "999"),
            snippet: { ...video().snippet, channelId: "wrong" },
          },
          video("ZZZZZZZZZZZ", "10000"),
        ],
      });
    });
    const result = await createIntegrations({
      env: { YOUTUBE_API_KEY: "private-key" },
      fetch: request,
    }).getClips("youtube");
    expect(result).toMatchObject({
      status: "connected",
      clips: [
        { id: "lmnopqrstuv", views: 90 },
        { id: "abcdefghijk", views: 4 },
      ],
    });
    expect(JSON.stringify(result)).not.toContain("private-key");
    expect(request).toHaveBeenCalledTimes(2);
  });
  it("caps YouTube sampling at two search pages and returns at most twelve", async () => {
    const request = vi.fn(async (input: string | URL | Request) => {
      const url = new URL(String(input));
      if (url.pathname.endsWith("/search"))
        return json({
          items: Array.from({ length: 50 }, (_, index) => ({
            id: {
              videoId: `video${String(index + (url.searchParams.has("pageToken") ? 50 : 0)).padStart(6, "0")}`,
            },
          })),
          nextPageToken: "more",
        });
      return json({
        items: url.searchParams
          .get("id")!
          .split(",")
          .map((id, index) => video(id, String(index))),
      });
    });
    const result = await createIntegrations({
      env: { YOUTUBE_API_KEY: "key" },
      fetch: request,
    }).getClips("youtube");
    expect(result.clips).toHaveLength(12);
    expect(request).toHaveBeenCalledTimes(4);
  });
});

describe("public Express endpoints", () => {
  it("serves typed disconnected responses without authentication and rejects invalid platforms", async () => {
    const app = express();
    registerIntegrationRoutes(
      app,
      createIntegrations({ env: {}, fetch: vi.fn() })
    );
    const server = createServer(app);
    await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
    try {
      const address = server.address();
      if (!address || typeof address === "string")
        throw new Error("No test port");
      const base = `http://127.0.0.1:${address.port}`;
      const music = await fetch(`${base}/api/music`);
      expect(music.status).toBe(200);
      expect(music.headers.get("Cache-Control")).toBe("no-store");
      expect(await music.json()).toMatchObject({
        status: "disconnected",
        nowPlaying: null,
      });
      const clips = await fetch(`${base}/api/clips?platform=twitch`);
      expect(clips.status).toBe(200);
      expect(await clips.json()).toMatchObject({
        status: "disconnected",
        clips: [],
      });
      for (const query of [
        "",
        "?platform=unknown",
        "?platform=youtube&platform=twitch",
      ]) {
        const invalid = await fetch(`${base}/api/clips${query}`);
        expect(invalid.status).toBe(400);
        expect(await invalid.json()).toMatchObject({
          status: "error",
          clips: [],
        });
      }
    } finally {
      await new Promise<void>((resolve, reject) =>
        server.close(error => (error ? reject(error) : resolve()))
      );
    }
  });
});

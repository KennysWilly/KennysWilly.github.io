# KennysWilly

A dark reflective iOS-style glass, music-editorial brand landing page for KennysWilly: music, hoops, streams, and direct copy. Kenneth Williams is the person behind the brand. Built with React, TypeScript, Vite, and Express.

## Run

Use Node.js 22 and the pinned pnpm version from `package.json`.

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

The application listens on port 3000 by default. Set `PORT` when required. `pnpm check`, `pnpm test`, and `pnpm build` validate types, integration tests, and the production bundle. `pnpm start` serves the built site. The included Dockerfile builds and runs both frontend and backend; `/api/health` is its health endpoint.

## GitHub Pages

The repository includes `.github/workflows/deploy.yml` for GitHub Pages. It builds the static Vite site with `VITE_BASE_PATH=/kennyswilly/`, uploads `dist/public`, and deploys it with the official Pages artifact actions. In the repository’s **Settings → Pages**, choose **GitHub Actions** as the source. The Pages version works without Express: it uses the checked-in public Spotify snapshot, public playlist embeds, and public YouTube highlights. Server-only features such as live Lanyard activity, authenticated Spotify playback, and credential-backed Twitch/YouTube refresh require the normal Node deployment.

## Content and data

All six social destinations match Kenneth’s supplied accounts. The wallpaper uses a refreshed representative snapshot of original album covers discovered across the public playlists on [his Spotify profile](https://open.spotify.com/user/kw8640173), not invented favorites or a pretend full library. Empty/unavailable playlists are omitted, album tiles change at independent intervals, and the album source is shuffled with pause and reduced-motion support. The Spotify carousel uses only public playlists with non-zero tracks and usable artwork.

YouTube highlight picks are ranked by rounded public view counts among 15 visible channel Shorts, checked November 26, 2026. The UI labels this snapshot and does not represent it as an exhaustive all-time ranking. Video playback opens on demand in an accessible dialog, with original-platform links if embedding is unavailable.

The live activity card reads Kenneth’s public Discord Rich Presence through the supplied Lanyard user endpoint, `https://lanyard.callen.page/v1/users/1181246957390413827`. It is normalized server-side at `/api/activity`, refreshed every five seconds, and shows the exact Lanyard Spotify song, artist, matching album art, and Spotify link when present. No Discord token is stored or exposed.

Spotify live listening and full library sync, ranked Twitch clips, and refreshed YouTube analytics require server-side provider credentials. Without them, disconnected states are truthful and public playlist/video features still work. See [secure integration setup](docs/INTEGRATIONS.md). Never commit credentials or paste them in chat. Use a secure secret manager or Manus’s protected input card. Visitors do not authorize Spotify; the website displays only the owner’s explicitly shared activity and permitted collection data.

## Structure

`client/src/components` contains the album wall, brand hero, music player/carousel, highlights, and social sections. `client/src/glass.css` defines the shape-free liquid-glass surface system with reflective iOS-style sheen, inset edge highlights, saturation, and chromatic light treatment without a displacement filter. `client/src/data` stores verified public playlist artwork and channel highlights. `server/integrations.ts` handles providers, token refresh, bounded caching, errors, and privacy gates. `shared/integrations.ts` defines the public response contracts. `docs/SOURCES.md` records content provenance. The Python public-artwork snapshot script is development-only and requires `requests`; it reads public profile/embed metadata without private credentials.

This site is saved in a Manus-managed project and copied to the supplied GitHub repository as a separate source backup; that copy does not switch the managed project’s canonical repository. Publishing is separate from saving a checkpoint. Until an actual public website domain is chosen, canonical URL and `og:url` are intentionally omitted. A static-only GitHub Pages deployment will not provide the live Express integration endpoints; use a Node/container host for those features. The username-origin copy intentionally does not claim a reason Kenneth has not supplied.

# KennysWilly

A dark liquid-glass, music-editorial personal website for Kenneth Williams: music, hoops, streams, and direct copy. Built with React, TypeScript, Vite, and Express.

## Run

Use Node.js 22 and the pinned pnpm version from `package.json`.

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

The application listens on port 3000 by default. Set `PORT` when required. `pnpm check`, `pnpm test`, and `pnpm build` validate types, integration tests, and the production bundle. `pnpm start` serves the built site. The included Dockerfile builds and runs both frontend and backend; `/api/health` is its health endpoint.

## Content and data

All six social destinations match Kenneth’s supplied accounts. The wallpaper uses an expanded representative snapshot of 63 original album covers from songs in his public **Chillrap**, **Idlsidgo**, and **That music we don’t get no more** playlists, not invented favorites or a pretend full library. Album tiles change at independent intervals, with pause and reduced-motion support. The Spotify carousel includes all four supplied playlist links. The original second playlist returned a public 404 when checked; its link remains, but the UI does not invent its title, artwork, or contents.

YouTube highlight picks are ranked by rounded public view counts among 15 visible channel Shorts, checked November 26, 2026. The UI labels this snapshot and does not represent it as an exhaustive all-time ranking. Video playback opens on demand in an accessible dialog, with original-platform links if embedding is unavailable.

Spotify live listening and full library sync, ranked Twitch clips, and refreshed YouTube analytics require server-side provider credentials. Without them, disconnected states are truthful and public playlist/video features still work. See [secure integration setup](docs/INTEGRATIONS.md). Never commit credentials or paste them in chat. Use a secure secret manager or Manus’s protected input card. Visitors do not authorize Spotify; the website displays only the owner’s explicitly shared activity and permitted collection data.

## Structure

`client/src/components` contains the album wall, hero, music player/carousel, highlights, and personal/social sections. `client/src/data` stores verified public playlist artwork and channel highlights. `server/integrations.ts` handles providers, token refresh, bounded caching, errors, and privacy gates. `shared/integrations.ts` defines the public response contracts. `docs/SOURCES.md` records content provenance. The Python public-artwork snapshot script is development-only and requires `requests`; it reads public embed metadata without private credentials.

This site is saved in a Manus-managed project and copied to the supplied GitHub repository as a separate source backup; that copy does not switch the managed project’s canonical repository. Publishing is separate from saving a checkpoint. Until an actual public website domain is chosen, canonical URL and `og:url` are intentionally omitted. A static-only GitHub Pages deployment will not provide the live Express integration endpoints; use a Node/container host for those features. The username-origin copy intentionally does not claim a reason Kenneth has not supplied.

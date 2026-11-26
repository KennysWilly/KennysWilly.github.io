# GitHub Pages deployment

The repository deploys the Vite client through `.github/workflows/deploy.yml`. The workflow installs the pinned pnpm dependencies, runs `pnpm build:static` with `VITE_BASE_PATH=/kennyswilly/` and `VITE_STATIC_BUILD=true`, uploads `dist/public`, and deploys it with the official Pages artifact actions. The repository must have **Settings → Pages → Source → GitHub Actions** selected.

GitHub Pages serves the static client only. Static mode disables the Express-backed `/api/music`, `/api/activity`, and `/api/clips` queries. The page remains useful through the checked-in Spotify snapshot, public Spotify embeds, and verified public YouTube fallback clips. Live Lanyard presence, authenticated Spotify playback, and credential-backed provider refreshes require the normal Node deployment.

The workflow and base-path approach follow [GitHub's publishing-source guidance](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), [Vite's static deployment guide](https://vite.dev/guide/static-deploy), and the [official deploy-pages action](https://github.com/actions/deploy-pages).

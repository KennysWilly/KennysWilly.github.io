# Content sources

The supplied repository https://github.com/kennywill1324/kennyswilly was empty, verified via public page and authenticated GitHub CLI on 2026-11-26. The build is a new implementation, not an overwrite of existing code.

Kenneth’s exact social URLs come from the user request. Twitch username is **kennyswillyy**. Search also finds a different kennyswilly account, which is not substituted.

## Spotify

The user supplied profile https://open.spotify.com/user/kw8640173 and playlists https://open.spotify.com/playlist/1mRhwA8wntU3ELVX4lwg4N and https://open.spotify.com/playlist/5QrHkxq29YrtjzgwQgSleC .

The first public embed was accessible at https://open.spotify.com/embed/playlist/1mRhwA8wntU3ELVX4lwg4N and identifies **Chillrap**, by **KennysWilly**. Its public embedded metadata exposed 97 track entries; that is not asserted as the playlist’s exact total. Sixty-three representative unique album covers were retrieved across all three accessible public playlists from actual song embed metadata. Example: Drive Slow / Kanye West, Paul Wall, GLC at https://open.spotify.com/embed/track/5AMekX6PigBBeBRHvB4MfZ . Other verified playlist artists include NxWorries, Vince Staples, J. Cole, Chance the Rapper, Freddie Gibbs, MAVI, Isaiah Rashad, Daniel Caesar, D’Angelo, MF DOOM, Marvin Gaye, Stevie Wonder, Teddy Pendergrass, Aaliyah, Erykah Badu, Maxwell, and Al Green. `client/src/data/spotify-snapshot.json` records source track and playlist IDs. Covers are the original Spotify CDN artwork and link to the corresponding source tracks. Saved copies live in the project’s reference assets.

The original second embed https://open.spotify.com/embed/playlist/5QrHkxq29YrtjzgwQgSleC returned a 404 “Page not found.” The UI retains the user-supplied link, but uses an explicitly unavailable state. No title, artwork, or contents are invented.

The wallpaper now uses the actual public Chillrap artwork snapshot, not the earlier Kanye inspiration search. Search images retained under reference assets are not presented as Kenneth’s library. Full saved-library sync and live playback require owner OAuth authorization.

## YouTube

Channel https://www.youtube.com/channel/UCrk3hPLM7Po9C6qheU-591w/videos?view=0&sort=p identifies KennysWilly, @KennysWillyy. Public channel metadata yielded 15 visible Shorts and their rounded counts on 2026-11-26. The highest count was 1.4K; three Shorts tied at 1.3K, with two selected for the three-card showcase. This is a scoped public sample, not an exhaustive all-time ranking or live analytics.

Featured sources: https://www.youtube.com/shorts/L8u-_7tjVj8 — NBA injuries are changing everything, 1.4K; https://www.youtube.com/shorts/GRkyJ2uQhb8 — NBA foul-baiting debate, 1.3K; https://www.youtube.com/shorts/Ey2HFsp01xM — GTA roleplay clip, 1.3K. Kanye feature: https://www.youtube.com/shorts/fjYp_Xw1nVE — Kanye conversation clip, 1.2K. Titles are shortened on cards without changing their meaning.

A separately verified replay https://www.youtube.com/watch?v=odD06iffWhM had 27 views and identifies the same channel. It is not featured as a top-ranked video because the Shorts have higher public counts.

## Integration guidance

Official Spotify and provider documentation is cited in `docs/INTEGRATIONS.md`. No provider credentials were supplied during the initial build. The application’s live endpoints truthfully return disconnected states until secure setup is complete.

The two additional public embeds were verified on 2026-11-26: https://open.spotify.com/playlist/64nVsGH5e0HaYV4steCmrr is **Idlsidgo** by KennysWilly, with 57 exposed track entries; https://open.spotify.com/playlist/6qZovSxZvgQj0xSe1gSgMG is **That music we don’t get no more** by KennysWilly, with 99 exposed track entries. Their public cover art and representative track artwork are included in the current snapshot.

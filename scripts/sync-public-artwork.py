"""Snapshot original artwork from owner-supplied public Spotify playlists.
Development utility only. Reads public embed metadata; no private credentials.
"""
import concurrent.futures
import json
import re
from datetime import date
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[1]
PLAYLIST_IDS = ["1mRhwA8wntU3ELVX4lwg4N", "64nVsGH5e0HaYV4steCmrr", "6qZovSxZvgQj0xSe1gSgMG"]
(ROOT / "assets/reference").mkdir(parents=True, exist_ok=True)


def public_entity(kind, entity_id):
    response = requests.get(f"https://open.spotify.com/embed/{kind}/{entity_id}", timeout=25)
    response.raise_for_status()
    match = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', response.text)
    if not match:
        raise RuntimeError("Public Spotify embed metadata unavailable")
    return json.loads(match.group(1))["props"]["pageProps"].get("state", {}).get("data", {}).get("entity")


selected, playlists, selected_ids = [], [], set()
for playlist_id in PLAYLIST_IDS:
    entity = public_entity("playlist", playlist_id)
    if not entity:
        print(f"Playlist unavailable: {playlist_id}", flush=True)
        continue
    name = entity["title"].strip()
    # Keep actual words; decorative emoji in a provider title do not need to be reproduced.
    name = re.sub(r"[^\w\s’'.,&!?-]", "", name).strip()
    description = {
        "1mRhwA8wntU3ELVX4lwg4N": "Kanye, NxWorries, Freddie Gibbs & the rest of the rotation.",
        "64nVsGH5e0HaYV4steCmrr": "Daniel Caesar, D’Angelo, MF DOOM & a little late-night feeling.",
        "6qZovSxZvgQj0xSe1gSgMG": "Marvin Gaye, Stevie Wonder, Teddy Pendergrass. Soul that stays with you.",
    }[playlist_id]
    playlists.append({"id": playlist_id, "name": name, "description": description, "image": entity["coverArt"]["sources"][0]["url"], "url": f"https://open.spotify.com/playlist/{playlist_id}", "totalTracks": None, "available": True})
    tracks = entity["trackList"]
    artists, picks = set(), []
    for track in tracks:
        artist = track["subtitle"].split(",")[0]
        if artist not in artists:
            picks.append(track)
            artists.add(artist)
        if len(picks) >= 18:
            break
    # Different records by the same soul artist add variety, too.
    for track in tracks[:16]:
        if track not in picks and len(picks) < 24:
            picks.append(track)
    picks.sort(key=lambda track: "Kanye West" not in track["subtitle"])
    for track in picks:
        track_id = track["uri"].split(":")[-1]
        if track_id not in selected_ids:
            selected.append((track, playlist_id))
            selected_ids.add(track_id)
    print(f"Playlist: {name}; {len(picks)} representative track picks.", flush=True)


def snapshot(item):
    track, playlist_id = item
    track_id = track["uri"].split(":")[-1]
    entity = public_entity("track", track_id)
    if not entity:
        return None
    images = entity.get("visualIdentity", {}).get("image", [])
    if not images:
        return None
    image = max(images, key=lambda value: value.get("maxWidth", 0))["url"]
    cover = {"id": track_id, "name": track["title"], "artist": track["subtitle"].replace("\u00a0", " "), "image": image, "url": f"https://open.spotify.com/track/{track_id}", "sourcePlaylist": playlist_id}
    local = ROOT / f"assets/reference/library-{track_id}.jpg"
    if not local.exists():
        artwork = requests.get(image, timeout=20)
        artwork.raise_for_status()
        local.write_bytes(artwork.content)
    print(f"Artwork: {cover['name']} / {cover['artist']}", flush=True)
    return cover


covers, seen = [], set()
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    for future in [pool.submit(snapshot, item) for item in selected]:
        try:
            cover = future.result()
            if cover and cover["image"] not in seen:
                covers.append(cover)
                seen.add(cover["image"])
        except Exception as error:
            print(f"Skipped unavailable public track: {type(error).__name__}", flush=True)

playlists.append({"id": "5QrHkxq29YrtjzgwQgSleC", "name": "Playlist 04", "description": "This playlist isn’t publicly available yet. Open it in Spotify or check back later.", "image": "", "url": "https://open.spotify.com/playlist/5QrHkxq29YrtjzgwQgSleC", "totalTracks": None, "available": False})
out = {"checkedAt": date.today().isoformat(), "source": "Owner-supplied public playlists; representative original-artwork snapshot, not the full saved library.", "albums": covers, "playlists": playlists}
(ROOT / "client/src/data").mkdir(parents=True, exist_ok=True)
(ROOT / "client/src/data/spotify-snapshot.json").write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n")
print(f"Saved {len(covers)} unique covers across {len(playlists)-1} public playlists.", flush=True)

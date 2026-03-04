# M14U Music API — Full Reference

> **Base URL (local):** `http://localhost:4000`  
> **Base URL (production):** _set when deployed_  
> All responses are `Content-Type: application/json`.

---

## Table of Contents

1. [Health Check](#1-health-check)
2. [Search Songs](#2-search-songs)
3. [Trending / Home Feed](#3-trending--home-feed)
4. [Stream Audio Link](#4-stream-audio-link)
5. [Data Schemas](#5-data-schemas)
6. [Error Handling](#6-error-handling)
7. [Caching Behaviour](#7-caching-behaviour)
8. [Frontend Integration Guide](#8-frontend-integration-guide)
9. [WebRTC Signaling API](#9-webrtc-signaling-api)

---

## 1. Health Check

**`GET /`**

Confirms the API server is alive. Use this to gate your UI loading state.

### Response `200 OK`
```json
{
  "message": "M14U Music API is running."
}
```

---

## 2. Search Songs

**`GET /api/search`**

Searches YouTube Music for songs matching a query. Returns enriched metadata — all fields needed to display a song card, a now-playing bar, and an album/artist detail page are included in a single call. No extra requests needed when a user taps a song.

### Query Parameters

| Parameter | Type   | Required | Description                     |
|-----------|--------|----------|---------------------------------|
| `q`       | string | ✅        | Search term — song name, artist, album, lyric snippet |

### Example Request

```
GET /api/search?q=believer
GET /api/search?q=AR+Rahman
GET /api/search?q=Blinding+Lights
```

### Response `200 OK`

Returns an **array** of Song objects.

```json
[
  {
    "type": "SONG",
    "videoId": "Kx7B-XvmFtE",
    "name": "Believer",
    "artist": {
      "name": "Imagine Dragons",
      "artistId": "UC0aXrjVxG5pZr99v77wZdPQ"
    },
    "album": {
      "name": "Evolve",
      "albumId": "MPREb_q16Gzaa1WK8"
    },
    "duration": 205,
    "thumbnails": [
      { "url": "https://lh3.googleusercontent.com/...=w60-h60-l90-rj",   "width": 60,   "height": 60   },
      { "url": "https://lh3.googleusercontent.com/...=w120-h120-l90-rj", "width": 120,  "height": 120  },
      { "url": "https://lh3.googleusercontent.com/...=w226-h226-l90-rj", "width": 226,  "height": 226  },
      { "url": "https://lh3.googleusercontent.com/...=w544-h544-l90-rj", "width": 544,  "height": 544  },
      { "url": "https://lh3.googleusercontent.com/...=w1080-h1080-l90-rj","width": 1080, "height": 1080 }
    ],
    "description": "Listen to \"Believer\" by Imagine Dragons. Featured on the album \"Evolve\". Duration: 3:25.",
    "streamUrl": "/api/stream/Kx7B-XvmFtE"
  }
]
```

### Response `400 Bad Request`
```json
{ "error": "Query parameter 'q' is required" }
```

### Response `500 Internal Server Error`
```json
{ "error": "Failed to search songs" }
```

### Field Reference

| Field         | Type            | Description |
|---------------|-----------------|-------------|
| `type`        | `"SONG"`        | Always `SONG` for this endpoint |
| `videoId`     | string          | YouTube video ID — use this as the unique song key across your app |
| `name`        | string          | Song title |
| `artist.name` | string          | Primary artist display name |
| `artist.artistId` | string      | YouTube Music artist ID (can be used for future artist page APIs) |
| `album.name`  | string \| null  | Album name — may be null for singles |
| `album.albumId` | string \| null | Album ID — may be null |
| `duration`    | number          | Duration in **seconds** |
| `thumbnails`  | Thumbnail[]     | Sorted ascending by width. Always contains `60`, `120`, `226`, `544`, `1080` sizes |
| `description` | string          | Pre-formatted string for meta tags and UI subtitles |
| `streamUrl`   | string          | Relative path to the stream endpoint for this song — pass to `/api/stream/:videoId` |

---

## 3. Trending / Home Feed

**`GET /api/trending`**

Returns the YouTube Music home page sections (e.g. "Quick picks", "Trending", "Albums for you") filtered for a specific country and/or language. This powers your home screen.

Accepts **friendly plain-English names** — no need to look up ISO codes.

### Query Parameters

> Use **either** `q` (friendly) **or** `gl`+`hl` (raw codes). `q` takes priority.

| Parameter | Type   | Required | Default | Description |
|-----------|--------|----------|---------|-------------|
| `q`       | string | optional | —       | Plain-English location/language: `tamil`, `india`, `usa`, `korean`, `tamil india`, etc. |
| `gl`      | string | optional | `IN`    | ISO 3166-1 alpha-2 country code (e.g. `US`, `GB`, `JP`) |
| `hl`      | string | optional | `en`    | ISO 639-1 language code (e.g. `ta`, `hi`, `en`, `ko`) |

### Locale Resolution Logic

The `q` parameter is parsed with this priority:

1. Multi-word country names checked first (`south korea`, `sri lanka`, `saudi arabia`)
2. Single words matched against country names (`india` → `IN`, `usa` → `US`)
3. Single words matched against language names (`tamil` → `ta`, `korean` → `ko`)
4. Raw 2-letter codes accepted (`IN`, `en`)
5. If language is resolved but country is not → country is **inferred from language** (e.g. `tamil` → `IN`)
6. Unresolved fields fall back to `IN` / `en`

### Supported Friendly Names

**Countries:**
`india`, `usa`, `uk`, `japan`, `korea`, `south korea`, `germany`, `france`, `brazil`, `canada`, `australia`, `spain`, `mexico`, `indonesia`, `russia`, `italy`, `turkey`, `pakistan`, `bangladesh`, `nigeria`, `egypt`, `sri lanka`, `nepal`, `singapore`, `malaysia`, `thailand`, `philippines`, `argentina`, `colombia`, `south africa`, `uae`, `saudi arabia`, `vietnam`, `china`, `taiwan`

**Languages:**
`tamil`, `hindi`, `telugu`, `kannada`, `malayalam`, `bengali`, `marathi`, `gujarati`, `punjabi`, `urdu`, `english`, `spanish`, `french`, `german`, `japanese`, `korean`, `portuguese`, `russian`, `arabic`, `chinese`, `italian`, `dutch`, `turkish`, `thai`, `vietnamese`, `indonesian`, `malay`, `filipino`

### Example Requests

```
GET /api/trending?q=tamil
GET /api/trending?q=india
GET /api/trending?q=tamil india
GET /api/trending?q=usa
GET /api/trending?q=korean
GET /api/trending?q=japanese
GET /api/trending?gl=US&hl=en
```

### Resolved Locale Quick Reference

| `q` value      | Resolved `gl` | Resolved `hl` |
|----------------|---------------|---------------|
| `tamil`        | IN            | ta            |
| `india`        | IN            | en            |
| `tamil india`  | IN            | ta            |
| `hindi`        | IN            | hi            |
| `usa`          | US            | en            |
| `uk`           | GB            | en            |
| `korean`       | KR            | ko            |
| `japanese`     | JP            | ja            |
| `arabic`       | IN *(default)*| ar            |

### Response `200 OK`

```json
{
  "locale": {
    "gl": "IN",
    "hl": "ta"
  },
  "sections": [
    {
      "title": "Quick picks",
      "contents": [
        {
          "type": "SONG",
          "videoId": "abc123",
          "name": "Vivegam Theme",
          "artist": {
            "name": "Anirudh Ravichander",
            "artistId": "UC..."
          },
          "album": {
            "name": "Vivegam",
            "albumId": "MPREb_..."
          },
          "duration": 210,
          "thumbnails": [
            { "url": "https://lh3.googleusercontent.com/...=w60-h60-l90-rj",    "width": 60,   "height": 60   },
            { "url": "https://lh3.googleusercontent.com/...=w120-h120-l90-rj",  "width": 120,  "height": 120  },
            { "url": "https://lh3.googleusercontent.com/...=w226-h226-l90-rj",  "width": 226,  "height": 226  },
            { "url": "https://lh3.googleusercontent.com/...=w544-h544-l90-rj",  "width": 544,  "height": 544  },
            { "url": "https://lh3.googleusercontent.com/...=w1080-h1080-l90-rj","width": 1080, "height": 1080 }
          ],
          "streamUrl": "/api/stream/abc123"
        }
      ]
    },
    {
      "title": "Albums & singles",
      "contents": [
        {
          "type": "ALBUM",
          "albumId": "MPREb_...",
          "playlistId": "OLAK5uy_...",
          "name": "Sivakasi",
          "artist": {
            "name": "Vidyasagar",
            "artistId": "UC..."
          },
          "year": 2005,
          "thumbnails": [...]
        }
      ]
    },
    {
      "title": "Recommended artists",
      "contents": [
        {
          "type": "ARTIST",
          "artistId": "UC...",
          "name": "Anirudh Ravichander",
          "thumbnails": [...]
        }
      ]
    }
  ]
}
```

### Section Content Types

Each section's `contents` array can contain any of these types — check the `type` field:

| `type`    | Key Fields                                                              | Has `streamUrl`? |
|-----------|-------------------------------------------------------------------------|------------------|
| `SONG`    | `videoId`, `name`, `artist`, `album`, `duration`, `thumbnails`         | ✅ Yes            |
| `ALBUM`   | `albumId`, `playlistId`, `name`, `artist`, `year`, `thumbnails`        | ❌ No             |
| `ARTIST`  | `artistId`, `name`, `thumbnails`                                       | ❌ No             |
| `PLAYLIST`| `playlistId`, `name`, `thumbnails`                                     | ❌ No             |
| `VIDEO`   | `videoId`, `name`, `artist`, `duration`, `thumbnails`                  | ✅ Yes            |

### Response `500 Internal Server Error`
```json
{ "error": "Failed to fetch trending content" }
```

---

## 4. Stream Audio Link

**`GET /api/stream/:videoId`**

Resolves a YouTube video ID to a **direct Google Video CDN audio URL** (best available audio quality). This URL can be used directly in an HTML5 `<audio>` tag or passed to any audio player library (Howler.js, Web Audio API, etc.).

> ⚠️ **Important:** Audio URLs expire in ~6 hours. The server caches them for 2 hours. For a smooth UX, fetch this URL only when the user actually plays a song, not in advance.

### Path Parameter

| Parameter | Type   | Required | Description                          |
|-----------|--------|----------|--------------------------------------|
| `videoId` | string | ✅        | YouTube video ID (11-character string from `videoId` in search or trending results) |

### Example Request

```
GET /api/stream/Kx7B-XvmFtE
GET /api/stream/dQw4w9WgXcQ
```

### Response `200 OK`

```json
{
  "url": "https://rr1---sn-i5uif5t-h556.googlevideo.com/videoplayback?expire=1741111200&..."
}
```

### Response `404 Not Found`
```json
{ "error": "Audio stream not found" }
```

Possible causes: video is private, region-locked, or removed.

### Response `500 Internal Server Error`
```json
{ "error": "Failed to fetch stream link" }
```

### Using the URL in the Frontend

```html
<audio controls>
  <source src="<url from response>" type="audio/webm">
  Your browser does not support audio.
</audio>
```

```javascript
// Fetch and play
const res = await fetch(`/api/stream/${videoId}`);
const { url } = await res.json();
const audio = new Audio(url);
audio.play();
```

---

## 5. Data Schemas

### Song Object
```ts
interface Song {
  type: "SONG";
  videoId: string;           // Unique ID — use as React key, map key, etc.
  name: string;              // Display title
  artist: {
    name: string;
    artistId: string;
  };
  album: {
    name: string;
    albumId: string;
  } | null;
  duration: number;           // Seconds
  thumbnails: Thumbnail[];    // Always sorted smallest → largest
  description: string;        // Pre-built subtitle / meta description
  streamUrl: string;          // e.g. "/api/stream/Kx7B-XvmFtE"
}
```

### Thumbnail Object
```ts
interface Thumbnail {
  url: string;    // Absolute lh3.googleusercontent.com URL
  width: number;  // Pixel width (one of: 60, 120, 226, 544, 1080)
  height: number; // Always equals width (square)
}
```

**Thumbnail size usage guide:**

| Size    | Use case                                               |
|---------|--------------------------------------------------------|
| `60`    | Mini player avatar, notification icon                  |
| `120`   | Song list row thumbnail, search result                 |
| `226`   | Song card in grid, home shelf item                     |
| `544`   | Now-playing panel album art, album detail header       |
| `1080`  | Full-screen/hero background, blurred backdrop          |

### Trending Response Object
```ts
interface TrendingResponse {
  locale: {
    gl: string;   // ISO country code that was resolved
    hl: string;   // ISO language code that was resolved
  };
  sections: Section[];
}

interface Section {
  title: string;
  contents: (Song | Album | Artist | Playlist | Video)[];
}
```

### Stream Response Object
```ts
interface StreamResponse {
  url: string;   // Direct Google Video CDN audio URL
}
```

### Error Object
```ts
interface ErrorResponse {
  error: string;   // Human-readable error message
}
```

---

## 6. Error Handling

All endpoints follow a consistent error shape:

```json
{ "error": "Human-readable message" }
```

| HTTP Status | Meaning                              | When it happens                                                  |
|-------------|--------------------------------------|------------------------------------------------------------------|
| `200`       | Success                              | —                                                                |
| `400`       | Bad Request                          | Required query param missing (e.g. no `q` on `/api/search`)     |
| `404`       | Not Found                            | Video not available — private, deleted, or region-locked         |
| `500`       | Internal Server Error                | YouTube Music or yt-dlp returned an unexpected response          |

### Frontend Error Handling Pattern

```javascript
async function searchSongs(query) {
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error);      // Bubble up to your error boundary / toast
  }
  return res.json();
}
```

---

## 7. Caching Behaviour

The server uses an in-memory `node-cache` store. Identical requests within the TTL window return instantly without hitting YouTube.

| Endpoint          | Cache Key                          | TTL     | Notes                                               |
|-------------------|------------------------------------|---------|-----------------------------------------------------|
| `GET /api/search` | `search-{q}`                       | 1 hour  | Cached per exact query string                       |
| `GET /api/trending`| `trending-home-{gl}-{hl}`         | 30 min  | Cached per resolved locale pair                     |
| `GET /api/stream` | `stream-{videoId}`                 | 2 hours | Audio CDN URLs expire ~6h; cached safely for 2h     |

> Cache is **in-memory** and resets on server restart. For production, consider replacing with Redis.

---

## 8. Frontend Integration Guide

### Recommended Architecture

```
App
├── HomePage
│   ├── fetch /api/trending?q={userLocale}
│   └── Renders section shelves (songs, albums, artists)
│
├── SearchPage
│   ├── onInput → debounce → fetch /api/search?q={term}
│   └── Renders song list rows
│
└── PlayerBar (global)
    ├── Holds currently playing Song object (from search or trending)
    ├── onPlay → fetch /api/stream/{song.videoId}
    └── Passes stream URL to <audio> element
```

### Getting a Thumbnail for a Specific Size

The `thumbnails` array is always sorted ascending by `width`. Pick the best size for the context:

```javascript
function getThumbnail(thumbnails, preferredSize = 226) {
  // Find exact match or nearest larger size
  return (
    thumbnails.find(t => t.width >= preferredSize) ||
    thumbnails[thumbnails.length - 1]   // fallback to largest available
  ).url;
}

// Usage
const cardArt    = getThumbnail(song.thumbnails, 226);   // Grid card
const playerArt  = getThumbnail(song.thumbnails, 544);   // Now-playing
const heroBg     = getThumbnail(song.thumbnails, 1080);  // Full-screen backdrop
```

### Duration Formatting

```javascript
function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}
// formatDuration(205) → "3:25"
```

### Playing a Song (End-to-End)

```javascript
let currentAudio = null;

async function playSong(song) {
  // 1. song object already has all the metadata you need for the UI
  updateNowPlayingUI(song);   // name, artist, thumbnail immediately

  // 2. Fetch the stream URL only when playing
  const res = await fetch(`http://localhost:4000${song.streamUrl}`);
  if (!res.ok) throw new Error('Could not get stream URL');
  const { url } = await res.json();

  // 3. Play
  if (currentAudio) currentAudio.pause();
  currentAudio = new Audio(url);
  currentAudio.play();
}
```

### Home Screen: Rendering Sections

```javascript
// /api/trending response → { locale, sections }
const { locale, sections } = await fetch('/api/trending?q=tamil').then(r => r.json());

for (const section of sections) {
  console.log(section.title);       // "Quick picks", "Albums for you", etc.
  for (const item of section.contents) {
    if (item.type === 'SONG') {
      // render song card — has streamUrl, thumbnails, name, artist
    } else if (item.type === 'ALBUM') {
      // render album card — albumId, name, artist, year, thumbnails
    } else if (item.type === 'ARTIST') {
      // render artist chip — artistId, name, thumbnails
    }
  }
}
```

### Locale Detection (UX Tip)

Let users set their region in settings, but also offer auto-detection:

```javascript
// Browser locale to ?q= value
function getDefaultLocaleQuery() {
  const lang = navigator.language || 'en';     // e.g. "ta-IN", "en-US", "ko-KR"
  const parts = lang.split('-');
  const langName = new Intl.DisplayNames(['en'], { type: 'language' })
    .of(parts[0]);                              // e.g. "Tamil", "English", "Korean"
  return langName?.toLowerCase() || 'english'; // → "tamil", "english", "korean"
}

fetch(`/api/trending?q=${getDefaultLocaleQuery()}`);
```

---

---

## 9. WebRTC Signaling API

Enables real-time audio sharing between devices using WebRTC. The backend acts as a **signaling server** — it stores and relays SDP offers/answers and ICE candidates between peers using HTTP polling. No WebSocket required.

### Architecture Overview

```
┌─────────┐                 ┌──────────────┐                 ┌─────────┐
│  Peer A  │   POST/GET     │   Backend    │    POST/GET     │  Peer B  │
│ (Host)   │ ◄──── HTTP ──► │  SQLite DB   │ ◄──── HTTP ──► │ (Guest)  │
└─────────┘   polling       └──────────────┘   polling       └─────────┘
     │                             │                              │
     └───── WebRTC P2P Audio ──────┼──────── WebRTC P2P Audio ────┘
                                   │
                            (signaling only,
                             no media flows
                             through server)
```

**Flow:**
1. Host creates a room → gets a 6-character `roomCode`
2. Guest joins using the `roomCode`
3. Both peers exchange SDP offer/answer + ICE candidates via `/signal` endpoints
4. WebRTC peer connection is established directly between devices
5. Peers send heartbeats to stay "online"; stale peers/rooms are auto-purged

### Database Storage

Uses **better-sqlite3** (file-based, zero-config). The DB file `webrtc-signaling.db` is created in the backend root. Data is ephemeral — rooms expire after **2 hours**, signals after **5 minutes**.

| Table      | Purpose                                     | Auto-Purge  |
|------------|---------------------------------------------|-------------|
| `rooms`    | Room codes, host info, expiry               | 2 hours     |
| `peers`    | Peer membership per room + last-seen        | 60 s timeout|
| `signals`  | SDP offers/answers + ICE candidates queued  | 5 minutes   |

---

### 9.1 Create Room

**`POST /api/rooms`**

Creates a new listening room. The creator becomes the **host**. Returns a shareable room code.

#### Request Body

| Field         | Type   | Required | Description           |
|---------------|--------|----------|-----------------------|
| `displayName` | string | ✅        | Host's display name   |

#### Example Request

```bash
curl -X POST http://localhost:4000/api/rooms \
  -H "Content-Type: application/json" \
  -d '{"displayName": "Santhosh"}'
```

#### Response `201 Created`

```json
{
  "roomCode": "A7X2QP",
  "peerId": "550e8400-e29b-41d4-a716-446655440000",
  "expiresAt": 1741123200000,
  "message": "Room created. Share code \"A7X2QP\" with others to join."
}
```

#### Response `400 Bad Request`
```json
{ "error": "displayName is required (non-empty string)" }
```

#### Field Reference

| Field       | Type   | Description                                          |
|-------------|--------|------------------------------------------------------|
| `roomCode`  | string | 6-character alphanumeric code (no ambiguous chars)   |
| `peerId`    | string | UUID assigned to the host — store locally for all subsequent requests |
| `expiresAt` | number | Unix timestamp (ms) when the room auto-expires       |

---

### 9.2 Join Room

**`POST /api/rooms/:code/join`**

Join an existing room using its code. Returns the peer list including the host.

#### Path Parameter

| Parameter | Type   | Required | Description             |
|-----------|--------|----------|-------------------------|
| `code`    | string | ✅        | Room code (case-insensitive) |

#### Request Body

| Field         | Type   | Required | Description           |
|---------------|--------|----------|-----------------------|
| `displayName` | string | ✅        | Joiner's display name |

#### Example Request

```bash
curl -X POST http://localhost:4000/api/rooms/A7X2QP/join \
  -H "Content-Type: application/json" \
  -d '{"displayName": "Friend"}'
```

#### Response `200 OK`

```json
{
  "roomCode": "A7X2QP",
  "peerId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
  "hostPeerId": "550e8400-e29b-41d4-a716-446655440000",
  "peers": [
    { "peerId": "550e8400-...", "displayName": "Santhosh", "isHost": true },
    { "peerId": "6ba7b810-...", "displayName": "Friend", "isHost": false }
  ]
}
```

#### Response `404 Not Found`
```json
{ "error": "Room not found or expired" }
```

---

### 9.3 Get Room Info

**`GET /api/rooms/:code`**

Retrieve current room details and peer list. Useful for UI status display.

#### Path Parameter

| Parameter | Type   | Required | Description          |
|-----------|--------|----------|----------------------|
| `code`    | string | ✅        | Room code            |

#### Example Request

```bash
curl http://localhost:4000/api/rooms/A7X2QP
```

#### Response `200 OK`

```json
{
  "roomCode": "A7X2QP",
  "hostPeerId": "550e8400-...",
  "createdAt": 1741116000000,
  "expiresAt": 1741123200000,
  "peers": [
    {
      "peerId": "550e8400-...",
      "displayName": "Santhosh",
      "isHost": true,
      "lastSeen": 1741116050000,
      "isOnline": true
    },
    {
      "peerId": "6ba7b810-...",
      "displayName": "Friend",
      "isHost": false,
      "lastSeen": 1741116045000,
      "isOnline": true
    }
  ]
}
```

---

### 9.4 Close Room (Host Only)

**`DELETE /api/rooms/:code`**

Closes the room and removes all peers + signals. Only the host can close the room.

#### Request Body

| Field    | Type   | Required | Description          |
|----------|--------|----------|----------------------|
| `peerId` | string | ✅        | Must be the host's peerId |

#### Example Request

```bash
curl -X DELETE http://localhost:4000/api/rooms/A7X2QP \
  -H "Content-Type: application/json" \
  -d '{"peerId": "550e8400-..."}'
```

#### Response `200 OK`
```json
{ "message": "Room closed" }
```

#### Response `403 Forbidden`
```json
{ "error": "Only the host can close the room" }
```

---

### 9.5 Leave Room

**`POST /api/rooms/:code/leave`**

Removes the peer from the room. If the **host** leaves, the entire room is closed.

#### Request Body

| Field    | Type   | Required | Description |
|----------|--------|----------|-------------|
| `peerId` | string | ✅        | Your peerId |

#### Example Request

```bash
curl -X POST http://localhost:4000/api/rooms/A7X2QP/leave \
  -H "Content-Type: application/json" \
  -d '{"peerId": "6ba7b810-..."}'
```

#### Response `200 OK`
```json
{ "message": "Left room" }
```
Or if the host leaves:
```json
{ "message": "Host left — room closed" }
```

---

### 9.6 Heartbeat

**`POST /api/rooms/:code/heartbeat`**

Send a keep-alive ping. Peers that don't heartbeat within **60 seconds** are marked offline and eventually purged. Returns the current peer list with online status.

> **Recommended interval:** Call every **10–15 seconds** from the frontend.

#### Request Body

| Field    | Type   | Required | Description |
|----------|--------|----------|-------------|
| `peerId` | string | ✅        | Your peerId |

#### Example Request

```bash
curl -X POST http://localhost:4000/api/rooms/A7X2QP/heartbeat \
  -H "Content-Type: application/json" \
  -d '{"peerId": "550e8400-..."}'
```

#### Response `200 OK`

```json
{
  "peers": [
    { "peerId": "550e8400-...", "displayName": "Santhosh", "isHost": true, "isOnline": true },
    { "peerId": "6ba7b810-...", "displayName": "Friend", "isHost": false, "isOnline": true }
  ]
}
```

---

### 9.7 Send Signal

**`POST /api/rooms/:code/signal`**

Send an SDP offer, SDP answer, or ICE candidate to a specific peer. The data is queued in the database and delivered when the target peer polls.

#### Request Body

| Field          | Type          | Required | Description                                          |
|----------------|---------------|----------|------------------------------------------------------|
| `peerId`       | string        | ✅        | Sender's peerId                                      |
| `targetPeerId` | string        | ✅        | Recipient's peerId                                   |
| `type`         | string        | ✅        | One of: `offer`, `answer`, `ice-candidate`           |
| `payload`      | object/string | ✅        | The SDP or ICE candidate data (stored as JSON)       |

#### Example Request — SDP Offer

```bash
curl -X POST http://localhost:4000/api/rooms/A7X2QP/signal \
  -H "Content-Type: application/json" \
  -d '{
    "peerId": "550e8400-...",
    "targetPeerId": "6ba7b810-...",
    "type": "offer",
    "payload": {
      "type": "offer",
      "sdp": "v=0\r\no=- 123456 2 IN IP4 127.0.0.1\r\n..."
    }
  }'
```

#### Example Request — ICE Candidate

```bash
curl -X POST http://localhost:4000/api/rooms/A7X2QP/signal \
  -H "Content-Type: application/json" \
  -d '{
    "peerId": "550e8400-...",
    "targetPeerId": "6ba7b810-...",
    "type": "ice-candidate",
    "payload": {
      "candidate": "candidate:842163049 1 udp ...",
      "sdpMid": "0",
      "sdpMLineIndex": 0
    }
  }'
```

#### Response `201 Created`
```json
{ "message": "Signal queued" }
```

#### Response `400 Bad Request`
```json
{ "error": "type must be one of: offer, answer, ice-candidate" }
```

---

### 9.8 Poll Signals

**`GET /api/rooms/:code/signal?peerId=<your-peer-id>`**

Poll for pending signals addressed to your peer. Signals are returned in chronological order and **marked as consumed** — they won't appear again. Also refreshes your heartbeat automatically.

> **Recommended interval:** Poll every **1–2 seconds** during connection setup; slow to **5 seconds** once connected.

#### Query Parameters

| Parameter | Type   | Required | Description      |
|-----------|--------|----------|------------------|
| `peerId`  | string | ✅        | Your peerId      |

#### Example Request

```bash
curl "http://localhost:4000/api/rooms/A7X2QP/signal?peerId=6ba7b810-..."
```

#### Response `200 OK`

```json
{
  "signals": [
    {
      "fromPeer": "550e8400-...",
      "toPeer": "6ba7b810-...",
      "type": "offer",
      "payload": {
        "type": "offer",
        "sdp": "v=0\r\n..."
      },
      "createdAt": 1741116100000
    },
    {
      "fromPeer": "550e8400-...",
      "toPeer": "6ba7b810-...",
      "type": "ice-candidate",
      "payload": {
        "candidate": "candidate:842163049 ...",
        "sdpMid": "0",
        "sdpMLineIndex": 0
      },
      "createdAt": 1741116101000
    }
  ]
}
```

> When no signals are pending, `signals` is an empty array `[]`.

---

### 9.9 WebRTC Data Schemas

#### Room Response Object
```ts
interface RoomResponse {
  roomCode: string;        // 6-char uppercase alphanumeric
  peerId: string;          // UUID assigned to you
  hostPeerId: string;      // UUID of the room host
  expiresAt: number;       // Unix ms
  peers: PeerInfo[];
}
```

#### Peer Info Object
```ts
interface PeerInfo {
  peerId: string;
  displayName: string;
  isHost: boolean;
  lastSeen?: number;       // Unix ms — present in GET /rooms/:code
  isOnline?: boolean;      // true if lastSeen < 60s ago
}
```

#### Signal Object
```ts
interface Signal {
  fromPeer: string;
  toPeer: string;
  type: 'offer' | 'answer' | 'ice-candidate';
  payload: RTCSessionDescriptionInit | RTCIceCandidateInit;
  createdAt: number;       // Unix ms
}
```

---

### 9.10 WebRTC Frontend Integration Guide

#### Step-by-Step Connection Flow

```
Host                              Backend                           Guest
 │                                   │                                │
 │  POST /api/rooms                  │                                │
 │ ──────────────────────────────►   │                                │
 │  ◄── { roomCode, peerId }        │                                │
 │                                   │                                │
 │                                   │  POST /api/rooms/:code/join    │
 │                                   │  ◄────────────────────────────  │
 │                                   │  ──► { peerId, peers }         │
 │                                   │                                │
 │  createOffer()                    │                                │
 │  POST /signal (type=offer)        │                                │
 │ ──────────────────────────────►   │                                │
 │                                   │  GET /signal?peerId=guest      │
 │                                   │  ◄────────────────────────────  │
 │                                   │  ──► { signals: [offer] }      │
 │                                   │                                │
 │                                   │  createAnswer()                │
 │                                   │  POST /signal (type=answer)    │
 │                                   │  ◄────────────────────────────  │
 │  GET /signal?peerId=host          │                                │
 │ ──────────────────────────────►   │                                │
 │  ◄── { signals: [answer] }       │                                │
 │                                   │                                │
 │  ◄─── ICE candidates exchanged via same POST/GET /signal ──────►  │
 │                                   │                                │
 │  ◄════════ WebRTC P2P Audio Connected ════════►                   │
```

#### Sample Frontend Implementation

```javascript
// ── 1. Create or Join a Room ─────────────────────────────────────────
const API = 'http://localhost:4000/api';

async function createRoom(displayName) {
  const res = await fetch(`${API}/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ displayName }),
  });
  return res.json(); // { roomCode, peerId, expiresAt }
}

async function joinRoom(code, displayName) {
  const res = await fetch(`${API}/rooms/${code}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ displayName }),
  });
  return res.json(); // { roomCode, peerId, hostPeerId, peers }
}

// ── 2. Signal Exchange ───────────────────────────────────────────────
async function sendSignal(roomCode, peerId, targetPeerId, type, payload) {
  await fetch(`${API}/rooms/${roomCode}/signal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ peerId, targetPeerId, type, payload }),
  });
}

async function pollSignals(roomCode, peerId) {
  const res = await fetch(`${API}/rooms/${roomCode}/signal?peerId=${peerId}`);
  const { signals } = await res.json();
  return signals;
}

// ── 3. WebRTC Connection ─────────────────────────────────────────────
async function connectToPeer(roomCode, myPeerId, remotePeerId) {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
  });

  // Send ICE candidates to remote peer via backend
  pc.onicecandidate = ({ candidate }) => {
    if (candidate) {
      sendSignal(roomCode, myPeerId, remotePeerId, 'ice-candidate', candidate);
    }
  };

  // Create and send offer
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  await sendSignal(roomCode, myPeerId, remotePeerId, 'offer', offer);

  // Poll for answer + ICE from remote
  const pollInterval = setInterval(async () => {
    const signals = await pollSignals(roomCode, myPeerId);
    for (const signal of signals) {
      if (signal.type === 'answer') {
        await pc.setRemoteDescription(signal.payload);
      } else if (signal.type === 'ice-candidate') {
        await pc.addIceCandidate(signal.payload);
      }
    }
    if (pc.connectionState === 'connected') clearInterval(pollInterval);
  }, 1500);

  return pc;
}

// ── 4. Heartbeat ─────────────────────────────────────────────────────
function startHeartbeat(roomCode, peerId) {
  return setInterval(() => {
    fetch(`${API}/rooms/${roomCode}/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ peerId }),
    }).catch(console.error);
  }, 12_000);  // every 12 seconds
}
```

#### Polling Intervals Guide

| Phase                   | Endpoint        | Interval     |
|-------------------------|-----------------|--------------|
| Connection setup        | `GET /signal`   | 1–2 seconds  |
| Post-connection         | `GET /signal`   | 5 seconds    |
| Always                  | `POST /heartbeat` | 10–15 seconds |
| UI status update        | `GET /rooms/:code` | 5–10 seconds |

---

*Last updated: 2026-03-05 · M14U Backend v1.1*


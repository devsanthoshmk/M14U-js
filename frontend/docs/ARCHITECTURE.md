# M14U Frontend — Architecture & Development Guide

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS v4 + shadcn/ui |
| State Management | Zustand (with LocalStorage persistence) |
| Routing | React Router v7 |
| Animations | Framer Motion |
| Drag & Drop | @dnd-kit |
| Accessible Primitives | Radix UI (Slider, Tooltip, Dialog) |

## Project Structure

```
src/
├── main.tsx                      # Entry point (BrowserRouter, audio init)
├── App.tsx                       # Routes definition
├── index.css                     # Design system (tokens, utilities, animations)
│
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx          # Root layout (sidebar + content + player)
│   │   ├── Sidebar.tsx           # Desktop left sidebar
│   │   └── MobileNav.tsx         # Mobile bottom navigation
│   ├── player/
│   │   ├── PlayerBar.tsx         # Persistent bottom player bar
│   │   ├── PlayerControls.tsx    # Play/pause/skip/shuffle/repeat
│   │   ├── ProgressBar.tsx       # Seekable Radix Slider
│   │   ├── VolumeControl.tsx     # Volume slider with mute
│   │   └── SleepTimer.tsx        # Sleep timer dropdown
│   ├── song/
│   │   ├── SongCard.tsx          # Grid card with album art
│   │   └── SongRow.tsx           # Compact list row
│   ├── queue/
│   │   └── QueuePanel.tsx        # Draggable queue panel
│   ├── lyrics/
│   │   └── LyricsPanel.tsx       # Time-synced lyrics
│   ├── onboarding/
│   │   └── OnboardingModal.tsx   # First-visit language picker
│   └── ui/                       # shadcn/ui components
│
├── pages/
│   ├── HomePage.tsx              # Trending + recently played
│   ├── SearchPage.tsx            # Search with debounce
│   ├── NowPlayingPage.tsx        # Full-screen player
│   ├── QueuePage.tsx             # Queue (mobile full-page)
│   ├── FavoritesPage.tsx         # Favorites library
│   └── NotFoundPage.tsx          # 404
│
├── stores/
│   ├── playerStore.ts            # Playback, queue, favorites, history
│   └── uiStore.ts                # UI panels, locale, searches, onboarding
│
├── engine/
│   └── AudioEngine.ts            # Singleton HTMLAudioElement manager
│
├── services/
│   ├── api.ts                    # Backend API calls
│   └── lyrics.ts                 # LRCLIB lyrics API
│
├── hooks/
│   ├── useDebounce.ts            # Debounced value
│   ├── useMediaSession.ts        # OS media controls
│   ├── useSleepTimer.ts          # Sleep timer logic
│   └── useKeyboardShortcuts.ts   # Global keyboard shortcuts
│
├── types/
│   ├── music.ts                  # Song, Section, Thumbnail types
│   ├── player.ts                 # Queue, Favorites, PlayerState types
│   └── lyrics.ts                 # LRCLIB response types
│
└── utils/
    ├── constants.ts              # API URLs, limits, shortcuts, locales
    ├── format.ts                 # Duration, greeting, shuffle, ID generation
    └── storage.ts                # Type-safe LocalStorage helpers
```

## Design System

### Color Palette (Dark-First)
- **Background**: `240 6% 6%` — near-black with warm undertone
- **Accent**: `38 78% 56%` — warm amber (distinct from Spotify/YouTube)
- **Surfaces**: Layered grays with 2-3% lightness increments for depth

### Typography
- **Headings**: Plus Jakarta Sans (geometric, modern)
- **Body**: DM Sans (clean legibility)

### Key Utilities
- `.glass` / `.glass-heavy` — backdrop blur for overlays
- `.glow-accent` — amber glow for active elements
- `.scrollbar-thin` / `.scrollbar-none` — minimal scrollbars
- `.gradient-fade-bottom` / `.gradient-fade-top` — gradient overlays

## State Architecture

### PlayerStore (Zustand + LocalStorage)
Manages all playback state. Persists queue, favorites, history, volume across sessions. Does NOT persist rapidly-changing values (currentTime, isPlaying, isBuffering).

Key methods:
- `playSong(song)` — fetches stream URL and plays
- `setQueue(songs, startIndex)` — replaces queue and starts playback
- `addToQueue(song)` / `addNext(song)` — queue manipulation
- `toggleFavorite(song)` — persisted favorites
- `exportState()` / `importState()` — serializable for listen-along
- `toggleShuffle()` — preserves original order for toggle-off

### UIStore (Zustand + LocalStorage)
- Panel visibility (queue, lyrics)
- User locale (selected on first visit)
- Recent searches
- Onboarding completion

### AudioEngine (Singleton)
Wraps HTMLAudioElement with:
- Retry logic (3 attempts with exponential backoff)
- Event forwarding to PlayerStore
- Volume/mute/seek control

## Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | HomePage | Trending sections + recently played |
| `/search` | SearchPage | Search with debounce + grid/list toggle |
| `/favorites` | FavoritesPage | Favorites library |
| `/now-playing` | NowPlayingPage | Full-screen player (mobile primary) |
| `/queue` | QueuePage | Queue management |
| `*` | NotFoundPage | 404 |

**Keep-Alive Routing:**
To preserve page state (scroll position, fetched data, input queries) when navigating between main tabs (`/`, `/search`, `/favorites`), these pages are kept permanently mounted inside `AppShell` using a custom `KeepAliveRoute` wrapper. They are conditionally displayed using CSS (`display: block / none`) rather than being unmounted by React Router.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Play/Pause |
| → | Seek +5s |
| ← | Seek -5s |
| ↑ | Volume +5% |
| ↓ | Volume -5% |
| N | Next track |
| P | Previous track |
| M | Mute toggle |
| L | Toggle lyrics |
| Q | Toggle queue |

## APIs

### Backend (`VITE_API_URL`)
- `GET /api/search?q=<query>` — Song search
- `GET /api/trending?q=<locale>` — Trending sections
- `GET /api/stream/:videoId` — Stream URL

### LRCLIB (`https://lrclib.net`)
- `GET /api/get?track_name=&artist_name=&album_name=&duration=` — Exact lyrics match
- `GET /api/search?track_name=&artist_name=` — Search fallback

## Key Design Decisions

1. **Queue uses unique `queueId`** — same song can appear multiple times
2. **Original queue preserved** — toggle shuffle off restores original order
3. **LocalStorage persistence** — favorites, history, queue survive page reloads
4. **MediaSession integration** — hardware play/pause/skip buttons work
5. **Sleep timer with volume fade** — last 30 seconds gradually reduce volume
6. **Lyrics auto-scroll** — pauses on user scroll, resumes after 5s inactivity
7. **Error boundaries** — failed song loads show clear error state with retry

## Running

```bash
pnpm install
pnpm run dev        # Development server
pnpm run build      # Production build
pnpm run preview    # Preview production build
```

## Environment Variables

```env
VITE_API_URL=http://localhost:4000
```

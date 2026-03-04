/**
 * Backend API service.
 * All calls to the M14U Express backend go through here.
 */

import { API_BASE_URL } from '@/utils/constants';
import type { Song, TrendingResponse, StreamResponse } from '@/types/music';

const DEFAULT_TIMEOUT = 15000; // 15 seconds

async function fetchJson<T>(endpoint: string, timeoutMs = DEFAULT_TIMEOUT): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const res = await fetch(url, { signal: controller.signal });

        if (!res.ok) {
            const body = await res.json().catch(() => ({ error: 'Network error' }));
            throw new Error(body.error || `HTTP ${res.status}`);
        }

        return res.json() as Promise<T>;
    } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
            throw new Error('Request timed out — server may be slow');
        }
        throw err;
    } finally {
        clearTimeout(timeoutId);
    }
}

/**
 * Search for songs by query string.
 * Returns enriched Song objects with thumbnails, artist, album, streamUrl.
 */
export async function searchSongs(query: string): Promise<Song[]> {
    if (!query.trim()) return [];
    return fetchJson<Song[]>(`/api/search?q=${encodeURIComponent(query.trim())}`);
}

/**
 * Fetch trending / home feed sections.
 * @param locale - Friendly name like "tamil", "english", "korean"
 */
export async function getTrending(locale: string = 'english'): Promise<TrendingResponse> {
    return fetchJson<TrendingResponse>(`/api/trending?q=${encodeURIComponent(locale)}`);
}

/**
 * Get direct audio CDN URL for a video ID.
 * URLs expire in ~6h, server caches for 2h.
 * Only call this when user actually plays — not in advance.
 */
export async function getStreamUrl(videoId: string): Promise<string> {
    const data = await fetchJson<StreamResponse>(`/api/stream/${encodeURIComponent(videoId)}`);
    return data.url;
}

/**
 * Health check — gate UI loading state on this.
 */
export async function healthCheck(): Promise<boolean> {
    try {
        await fetchJson<{ message: string }>('/');
        return true;
    } catch {
        return false;
    }
}

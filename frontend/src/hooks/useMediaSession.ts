/**
 * MediaSession API hook.
 * Syncs player state to OS-level media controls (lock screen, notification, headphone buttons).
 *
 * Why: Users with Bluetooth headphones or on mobile expect hardware play/pause/skip to work.
 * This bridges the web player to those native controls.
 */

import { useEffect } from 'react';
import { usePlayerStore } from '@/stores/playerStore';


export function useMediaSession(): void {
    const currentSong = usePlayerStore(s => s.currentSong);
    const isPlaying = usePlayerStore(s => s.isPlaying);
    const currentTime = usePlayerStore(s => s.currentTime);
    const duration = usePlayerStore(s => s.duration);

    // Update metadata when song changes
    useEffect(() => {
        if (!('mediaSession' in navigator) || !currentSong) return;

        navigator.mediaSession.metadata = new MediaMetadata({
            title: currentSong.name,
            artist: currentSong.artist.name,
            album: currentSong.album?.name || '',
            artwork: currentSong.thumbnails.map(t => ({
                src: t.url,
                sizes: `${t.width}x${t.height}`,
                type: 'image/jpeg',
            })),
        });
    }, [currentSong]);

    // Update playback state
    useEffect(() => {
        if (!('mediaSession' in navigator)) return;
        navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';
    }, [isPlaying]);

    // Update position state
    useEffect(() => {
        if (!('mediaSession' in navigator) || !duration) return;

        try {
            navigator.mediaSession.setPositionState({
                duration: duration,
                playbackRate: 1,
                position: Math.min(currentTime, duration),
            });
        } catch {
            // Some browsers don't support setPositionState yet
        }
    }, [currentTime, duration]);

    // Register action handlers
    useEffect(() => {
        if (!('mediaSession' in navigator)) return;
        const store = usePlayerStore.getState;

        const handlers: [MediaSessionAction, MediaSessionActionHandler][] = [
            ['play', () => store().togglePlay()],
            ['pause', () => store().togglePlay()],
            ['nexttrack', () => store().next()],
            ['previoustrack', () => store().previous()],
            ['seekto', (details) => {
                if (details.seekTime !== undefined) {
                    store().seek(details.seekTime);
                }
            }],
            ['seekforward', () => {
                store().seek(store().currentTime + 10);
            }],
            ['seekbackward', () => {
                store().seek(Math.max(0, store().currentTime - 10));
            }],
        ];

        for (const [action, handler] of handlers) {
            try {
                navigator.mediaSession.setActionHandler(action, handler);
            } catch {
                // Action not supported
            }
        }

        return () => {
            for (const [action] of handlers) {
                try {
                    navigator.mediaSession.setActionHandler(action, null);
                } catch {
                    // Cleanup
                }
            }
        };
    }, []);
}

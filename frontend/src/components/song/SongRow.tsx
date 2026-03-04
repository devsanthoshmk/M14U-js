/**
 * SongRow — Horizontal list row for search results and queue lists.
 * Compact layout with thumbnail, title, artist, duration and action buttons.
 */

import { Play, Plus, Heart, ListPlus, MoreHorizontal } from 'lucide-react';
import { usePlayerStore } from '@/stores/playerStore';
import { getThumbnail, formatDuration } from '@/utils/format';
import { cn } from '@/lib/utils';
import type { Song } from '@/types/music';
import { useState, useRef, useEffect } from 'react';

interface SongRowProps {
    song: Song;
    index?: number;
    showIndex?: boolean;
    onPlay?: () => void;
}

export function SongRow({ song, index = 0, showIndex = false, onPlay }: SongRowProps) {
    const playSong = usePlayerStore(s => s.playSong);
    const addToQueue = usePlayerStore(s => s.addToQueue);
    const addNext = usePlayerStore(s => s.addNext);
    const toggleFavorite = usePlayerStore(s => s.toggleFavorite);
    const isFavorite = usePlayerStore(s => s.isFavorite(song.videoId));
    const currentSong = usePlayerStore(s => s.currentSong);
    const isPlaying = usePlayerStore(s => s.isPlaying);
    const isCurrentSong = currentSong?.videoId === song.videoId;

    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const thumbnail = getThumbnail(song.thumbnails, 60);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowMenu(false);
            }
        };
        if (showMenu) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [showMenu]);

    const handlePlay = () => {
        if (onPlay) {
            onPlay();
        } else {
            playSong(song);
        }
    };

    return (
        <div
            className={cn(
                'group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all hover:bg-surface-hover',
                isCurrentSong && 'bg-primary/5'
            )}
            onClick={handlePlay}
        >
            {/* Index / play icon */}
            {showIndex && (
                <div className="w-6 text-center text-sm text-muted-foreground">
                    <span className="group-hover:hidden">
                        {isCurrentSong && isPlaying ? (
                            <span className="flex justify-center gap-0.5">
                                <span className="w-0.5 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-0.5 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-0.5 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </span>
                        ) : (
                            index + 1
                        )}
                    </span>
                    <Play className="h-4 w-4 hidden group-hover:block mx-auto text-foreground" fill="currentColor" />
                </div>
            )}

            {/* Thumbnail */}
            <div className="h-10 w-10 flex-shrink-0 rounded overflow-hidden bg-muted">
                <img src={thumbnail} alt={song.name} className="h-full w-full object-cover" loading="lazy" />
            </div>

            {/* Song info */}
            <div className="flex-1 min-w-0">
                <p className={cn('text-sm font-medium line-clamp-1', isCurrentSong ? 'text-primary' : 'text-foreground')}>
                    {song.name}
                </p>
                <p className="text-xs text-muted-foreground line-clamp-1">
                    {song.artist.name}
                    {song.album?.name && ` · ${song.album.name}`}
                </p>
            </div>

            {/* Favorite button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(song);
                }}
                className={cn(
                    'p-1.5 rounded-full transition-all opacity-0 group-hover:opacity-100',
                    isFavorite && 'opacity-100 text-primary'
                )}
            >
                <Heart className={cn('h-4 w-4', isFavorite && 'fill-primary')} />
            </button>

            {/* Duration */}
            <span className="text-xs text-muted-foreground tabular-nums w-10 text-right hidden sm:block">
                {formatDuration(song.duration)}
            </span>

            {/* More menu */}
            <div className="relative" ref={menuRef}>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowMenu(!showMenu);
                    }}
                    className="p-1.5 rounded-full text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground transition-all"
                >
                    <MoreHorizontal className="h-4 w-4" />
                </button>

                {showMenu && (
                    <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-popover border border-border shadow-xl p-1 z-50 animate-fade-in">
                        <button
                            onClick={(e) => { e.stopPropagation(); addNext(song); setShowMenu(false); }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-surface-hover transition-colors"
                        >
                            <ListPlus className="h-4 w-4 text-muted-foreground" /> Play next
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); addToQueue(song); setShowMenu(false); }}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-surface-hover transition-colors"
                        >
                            <Plus className="h-4 w-4 text-muted-foreground" /> Add to queue
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

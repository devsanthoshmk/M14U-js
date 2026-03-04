/**
 * HomePage — Trending sections + personalized greeting + recently played.
 *
 * Reference-matched: Bold greeting, horizontal card scrollers with larger cards,
 * locale picker, clean spacing.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { Loader2, RefreshCw, ChevronLeft, ChevronRight, Globe, AlertCircle } from 'lucide-react';
import { getTrending } from '@/services/api';
import { usePlayerStore } from '@/stores/playerStore';
import { useUIStore } from '@/stores/uiStore';
import { SongCard } from '@/components/song/SongCard';
import { getGreeting } from '@/utils/format';
import { LOCALE_OPTIONS } from '@/utils/constants';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import type { Section, Song } from '@/types/music';

export function HomePage() {
    const [sections, setSections] = useState<Section[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const userLocale = useUIStore(s => s.userLocale);
    const setUserLocale = useUIStore(s => s.setUserLocale);
    const listeningHistory = usePlayerStore(s => s.listeningHistory);

    const [showLocalePicker, setShowLocalePicker] = useState(false);
    const localeRef = useRef<HTMLDivElement>(null);

    const fetchTrending = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getTrending(userLocale || 'english');
            setSections(data.sections);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load content');
        } finally {
            setIsLoading(false);
        }
    }, [userLocale]);

    useEffect(() => {
        fetchTrending();
    }, [fetchTrending]);

    // Close locale picker on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (localeRef.current && !localeRef.current.contains(e.target as Node)) {
                setShowLocalePicker(false);
            }
        };
        if (showLocalePicker) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showLocalePicker]);

    const greeting = getGreeting();
    const recentSongs = listeningHistory.slice(0, 8).map(h => h.song);

    return (
        <div className="pb-8">
            {/* ─── Header ─── */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-white/[0.04]">
                <div className="flex items-center justify-between px-5 md:px-8 py-5">
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl md:text-3xl font-bold font-heading"
                    >
                        {greeting}
                    </motion.h1>

                    {/* Locale picker */}
                    <div className="relative" ref={localeRef}>
                        <button
                            onClick={() => setShowLocalePicker(!showLocalePicker)}
                            className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.1] transition-colors text-sm"
                        >
                            <Globe className="h-4 w-4 text-muted-foreground" />
                            <span className="hidden sm:inline capitalize text-foreground">
                                {userLocale || 'English'}
                            </span>
                        </button>

                        {showLocalePicker && (
                            <div className="absolute right-0 top-full mt-2 w-52 max-h-64 overflow-y-auto scrollbar-thin rounded-xl bg-popover/95 backdrop-blur-xl border border-white/10 shadow-2xl py-1 z-50 animate-fade-in">
                                {LOCALE_OPTIONS.map(({ label, value }) => (
                                    <button
                                        key={value}
                                        onClick={() => {
                                            setUserLocale(value);
                                            setShowLocalePicker(false);
                                        }}
                                        className={cn(
                                            'w-full flex items-center px-3 py-2 text-sm transition-colors text-left',
                                            userLocale === value
                                                ? 'bg-primary/10 text-primary font-medium'
                                                : 'text-foreground hover:bg-white/[0.06]'
                                        )}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="px-3 md:px-6 mt-4 space-y-6">
                {/* ─── Recently Played ─── */}
                {recentSongs.length > 0 && (
                    <section>
                        <h2 className="text-lg font-bold font-heading mb-2 px-2">Recently Played</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-0">
                            {recentSongs.map((song, i) => (
                                <SongCard key={`recent-${song.videoId}-${i}`} song={song} index={i} />
                            ))}
                        </div>
                    </section>
                )}

                {/* ─── Loading ─── */}
                {isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Loading trending music...</p>
                    </div>
                )}

                {/* ─── Error ─── */}
                {error && !isLoading && (
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                        <AlertCircle className="h-10 w-10 text-destructive" />
                        <div>
                            <p className="text-sm font-medium text-foreground">{error}</p>
                            <p className="text-xs text-muted-foreground mt-1">Check if the backend server is running</p>
                        </div>
                        <button
                            onClick={fetchTrending}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] transition-colors text-sm"
                        >
                            <RefreshCw className="h-4 w-4" /> Retry
                        </button>
                    </div>
                )}

                {/* ─── Trending Sections ─── */}
                {!isLoading && !error && sections.map((section, sectionIndex) => (
                    <HorizontalSection
                        key={`${section.title}-${sectionIndex}`}
                        section={section}
                    />
                ))}
            </div>
        </div>
    );
}

/** Horizontal scrolling section with navigation arrows */
function HorizontalSection({ section }: { section: Section }) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 10);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    }, []);

    useEffect(() => {
        checkScroll();
        const el = scrollRef.current;
        if (el) el.addEventListener('scroll', checkScroll, { passive: true });
        return () => el?.removeEventListener('scroll', checkScroll);
    }, [checkScroll]);

    const scroll = (direction: 'left' | 'right') => {
        const el = scrollRef.current;
        if (!el) return;
        const amount = el.clientWidth * 0.75;
        el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
    };

    const songs = section.contents.filter((c): c is Song => c.type === 'SONG');
    if (songs.length === 0) return null;

    return (
        <section>
            <div className="flex items-center justify-between mb-1 px-2">
                <h2 className="text-lg font-bold font-heading">{section.title}</h2>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => scroll('left')}
                        disabled={!canScrollLeft}
                        className={cn(
                            'p-1.5 rounded-full transition-all',
                            canScrollLeft
                                ? 'text-foreground hover:bg-white/[0.06]'
                                : 'text-muted-foreground/20 cursor-default'
                        )}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => scroll('right')}
                        disabled={!canScrollRight}
                        className={cn(
                            'p-1.5 rounded-full transition-all',
                            canScrollRight
                                ? 'text-foreground hover:bg-white/[0.06]'
                                : 'text-muted-foreground/20 cursor-default'
                        )}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div
                ref={scrollRef}
                className="flex gap-0 overflow-x-auto scrollbar-none snap-x snap-mandatory pb-2"
            >
                {songs.map((song, i) => (
                    <div key={`${song.videoId}-${i}`} className="flex-shrink-0 w-[160px] md:w-[190px] snap-start">
                        <SongCard song={song} index={i} />
                    </div>
                ))}
            </div>
        </section>
    );
}

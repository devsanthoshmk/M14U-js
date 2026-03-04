/**
 * Core music domain types.
 * Mirrors the backend API response shapes exactly.
 */

export interface Thumbnail {
    url: string;
    width: number;
    height: number;
}

export interface Artist {
    name: string;
    artistId: string;
}

export interface Album {
    name: string;
    albumId: string;
}

export interface Song {
    type: 'SONG';
    videoId: string;
    name: string;
    artist: Artist;
    album: Album | null;
    duration: number | null; // seconds
    thumbnails: Thumbnail[];
    description?: string;
    streamUrl: string;
}

export interface AlbumItem {
    type: 'ALBUM';
    albumId: string;
    playlistId?: string;
    name: string;
    artist: Artist;
    year?: number;
    thumbnails: Thumbnail[];
}

export interface ArtistItem {
    type: 'ARTIST';
    artistId: string;
    name: string;
    thumbnails: Thumbnail[];
}

export interface PlaylistItem {
    type: 'PLAYLIST';
    playlistId: string;
    name: string;
    thumbnails: Thumbnail[];
}

export interface VideoItem {
    type: 'VIDEO';
    videoId: string;
    name: string;
    artist: Artist;
    duration: number | null;
    thumbnails: Thumbnail[];
    streamUrl?: string;
}

export type SectionContent = Song | AlbumItem | ArtistItem | PlaylistItem | VideoItem;

export interface Section {
    title: string;
    contents: SectionContent[];
}

export interface TrendingResponse {
    locale: {
        gl: string;
        hl: string;
    };
    sections: Section[];
}

export interface StreamResponse {
    url: string;
}

export interface ErrorResponse {
    error: string;
}

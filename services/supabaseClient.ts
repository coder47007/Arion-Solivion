
import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// --- Database Types (Matches Schema) ---

export interface DatabaseAlbum {
    id: string;
    title: string;
    artist: string;
    release_year: number;
    cover_art: string;
    description: string;
    created_at?: string;
}

export interface DatabaseSong {
    id: string;
    title: string;
    artist: string;
    audio_src: string; // URL from Supabase Storage
    cover_art: string; // URL from Supabase Storage
    duration: string;
    plays: number;
    likes: number;
    moods: string[];
    lyrics?: string;
    album_id?: string;
    created_at?: string;
}

export interface DatabaseProfile {
    id: number;
    name: string;
    tagline: string;
    bio: string;
    stats: any; // JSONB
    image_url: string;
    updated_at?: string;
}

export interface DatabasePlaylist {
    id: string;
    title: string;
    cover_art?: string;
    created_at?: string;
}

export interface DatabasePlaylistSong {
    playlist_id: string;
    song_id: string;
    added_at?: string;
}

// --- Helper Functions ---

export const getAlbums = async () => {
    const { data, error } = await supabase
        .from('albums')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as DatabaseAlbum[];
};

export const createAlbum = async (album: Omit<DatabaseAlbum, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
        .from('albums')
        .insert([album])
        .select()
        .single();

    if (error) throw error;
    return data as DatabaseAlbum;
};

export const getSongs = async () => {
    const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data as DatabaseSong[];
};

export const getProfile = async () => {
    const { data, error } = await supabase
        .from('artist_profile')
        .select('*')
        .single();

    if (error) throw error;
    return data as DatabaseProfile;
};

export const uploadSongMetadata = async (song: Omit<DatabaseSong, 'id' | 'created_at' | 'plays' | 'likes'>) => {
    const { data, error } = await supabase
        .from('songs')
        .insert([song])
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const updateProfile = async (profile: Partial<DatabaseProfile>) => {
    // Always update ID 1 as enforced by schema
    const { data, error } = await supabase
        .from('artist_profile')
        .update(profile)
        .eq('id', 1)
        .select()
        .single();

    if (error) throw error;
    return data;
};

export const deleteSong = async (id: string) => {
    const { error } = await supabase
        .from('songs')
        .delete()
        .eq('id', id);

    if (error) throw error;
};

export const getPlaylists = async () => {
    const { data, error } = await supabase
        .from('playlists')
        .select(`
            *,
            playlist_songs (
                song_id
            )
        `)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const createPlaylist = async (title: string, coverArt?: string) => {
    const { data, error } = await supabase
        .from('playlists')
        .insert([{ title, cover_art: coverArt }])
        .select()
        .single();
    if (error) throw error;
    return data;
};

export const deletePlaylist = async (id: string) => {
    const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', id);
    if (error) throw error;
};

export const addSongToPlaylist = async (playlistId: string, songId: string) => {
    const { error } = await supabase
        .from('playlist_songs')
        .insert([{ playlist_id: playlistId, song_id: songId }]);

    // Ignore duplicate key error (if song already in playlist)
    if (error && error.code !== '23505') throw error;
};

// --- Storage Helper Functions ---

/**
 * Uploads a file to a specific Supabase Storage bucket.
 * @param file The file to upload
 * @param bucket The bucket name (e.g., 'songs', 'covers')
 * @param path The path/filename within the bucket
 */
export const uploadFile = async (file: File, bucket: string, path: string) => {
    const { data, error } = await supabase
        .storage
        .from(bucket)
        .upload(path, file, {
            cacheControl: '3600',
            upsert: false
        });

    if (error) throw error;
    return data;
};

/**
 * Gets the public URL for a file in Supabase Storage.
 * @param bucket The bucket name
 * @param path The path/filename
 */
export const getPublicUrl = (bucket: string, path: string) => {
    const { data } = supabase
        .storage
        .from(bucket)
        .getPublicUrl(path);

    return data.publicUrl;
};

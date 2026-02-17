
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

export interface DatabaseSong {
    id: string;
    title: string;
    artist: string;
    audio_url: string; // Cloudinary Link
    cover_url: string; // Cloudinary Link
    duration: string;
    plays: number;
    likes: number;
    moods: string[];
    lyrics?: string;
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

// --- Helper Functions ---

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

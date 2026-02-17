
export interface Song {
  id: string;
  title: string;
  artist: string;
  duration: string; // Display string "3:45"
  audioSrc: string; // URL or Blob URL
  coverArt?: string;
  albumId?: string;
  lyrics?: string;
  plays: number;
  likes: number;
  moods: string[];
  isPremium?: boolean;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  releaseYear: number;
  coverArt: string;
  description: string;
  songs: Song[];
}

export interface Playlist {
  id: string;
  title: string;
  songs: Song[];
  coverArt?: string;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum ViewState {
  HOME = 'HOME',
  LIBRARY = 'LIBRARY',
  ALBUM_DETAILS = 'ALBUM_DETAILS',
  PLAYLIST_DETAILS = 'PLAYLIST_DETAILS',
  SONG_DETAILS = 'SONG_DETAILS',
  ARTIST_PROFILE = 'ARTIST_PROFILE',
  ADMIN = 'ADMIN',
}

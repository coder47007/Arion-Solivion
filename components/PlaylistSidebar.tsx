
import React, { useState } from 'react';
import { Playlist } from '../types';
import { PlusIcon, MusicNoteIcon, TrashIcon } from './Icons';

interface PlaylistSidebarProps {
  playlists: Playlist[];
  isOpen: boolean;
  onCreatePlaylist: (name: string) => void;
  onSelectPlaylist: (playlist: Playlist) => void;
  onDropSong: (playlistId: string) => void;
  onDeletePlaylist: (playlistId: string) => void;
  isAdminAuthenticated: boolean;
}

const PlaylistSidebar: React.FC<PlaylistSidebarProps> = ({
  playlists,
  isOpen,
  onCreatePlaylist,
  onSelectPlaylist,
  onDropSong,
  onDeletePlaylist,
  isAdminAuthenticated
}) => {
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPlaylistName.trim()) {
      onCreatePlaylist(newPlaylistName);
      setNewPlaylistName('');
    }
  };

  const handleDragOver = (e: React.DragEvent, playlistId: string) => {
    e.preventDefault();
    setDragOverId(playlistId);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, playlistId: string) => {
    e.preventDefault();
    setDragOverId(null);
    onDropSong(playlistId);
  };

  return (
    <div
      className={`fixed top-20 left-0 bottom-0 z-30 w-72 bg-caribbean-deep/90 backdrop-blur-2xl border-r border-white/10 shadow-2xl transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="p-6 h-full flex flex-col">
        <h3 className="font-display font-bold text-white text-xl mb-6 flex items-center gap-2">
          🏝️ My Coves
        </h3>

        {/* Create Playlist Form */}
        {isAdminAuthenticated && (
          <form onSubmit={handleSubmit} className="mb-6 relative">
            <input
              type="text"
              placeholder="New Playlist Name"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-10 text-sm text-white focus:border-caribbean-turquoise focus:bg-white/10 outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!newPlaylistName.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-caribbean-turquoise rounded-lg text-caribbean-deep hover:bg-white disabled:opacity-50 disabled:bg-transparent disabled:text-slate-500 transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Playlist List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
          {playlists.length === 0 && (
            <div className="text-center text-cyan-100/40 text-sm py-8 italic border-2 border-dashed border-white/5 rounded-xl">
              Create a playlist and drag songs here!
            </div>
          )}

          {playlists.map(playlist => (
            <div
              key={playlist.id}
              onClick={() => onSelectPlaylist(playlist)}
              onDragOver={(e) => handleDragOver(e, playlist.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, playlist.id)}
              className={`group relative p-3 rounded-xl cursor-pointer transition-all border ${dragOverId === playlist.id
                ? 'bg-caribbean-turquoise/20 border-caribbean-turquoise scale-105 shadow-[0_0_15px_rgba(45,212,191,0.3)]'
                : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-caribbean-ocean to-caribbean-deep flex items-center justify-center flex-shrink-0 shadow-inner overflow-hidden">
                  {playlist.coverArt ? (
                    <img src={playlist.coverArt} className="w-full h-full object-cover opacity-80" />
                  ) : (
                    <MusicNoteIcon className="w-5 h-5 text-caribbean-turquoise opacity-50" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold text-sm truncate ${dragOverId === playlist.id ? 'text-caribbean-turquoise' : 'text-white'}`}>{playlist.title}</h4>
                  <p className="text-xs text-cyan-100/50">{playlist.songs.length} Tracks</p>
                </div>
                {isAdminAuthenticated && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDeletePlaylist(playlist.id); }}
                    className="p-1.5 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlaylistSidebar;

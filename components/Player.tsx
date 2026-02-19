import React, { useState, useEffect, useRef } from 'react';
import { Song } from '../types';
import { PlayIcon, PauseIcon, SkipBackIcon, SkipForwardIcon, HeartIcon, DownloadIcon, LyricsIcon } from './Icons';
import Visualizer from './Visualizer';

interface PlayerProps {
  currentSong: Song | null;
  playlist: Song[];
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  likedSongs: Set<string>;
  toggleLike: (id: string) => void;
  isAdminAuthenticated: boolean;
}

const Player: React.FC<PlayerProps> = ({ currentSong, isPlaying, onPlayPause, onNext, onPrev, likedSongs, toggleLike, isAdminAuthenticated }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [showLyrics, setShowLyrics] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.warn("Audio play blocked", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateProgress = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    const handleEnded = () => {
      onNext();
    }

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);
    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [onNext]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume])

  // Handle seeking
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (audio) {
      const seekTime = (parseFloat(e.target.value) / 100) * audio.duration;
      audio.currentTime = seekTime;
      setProgress(parseFloat(e.target.value));
    }
  };

  const handleDownload = () => {
    if (currentSong?.audioSrc) {
      const link = document.createElement('a');
      link.href = currentSong.audioSrc;
      link.download = `${currentSong.artist} - ${currentSong.title}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!currentSong) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      {/* Lyrics Overlay */}
      {showLyrics && (
        <div className="absolute bottom-full right-4 md:right-8 mb-4 w-80 md:w-96 bg-caribbean-deep/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[60vh] animate-in fade-in slide-in-from-bottom-10">
          <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
            <h3 className="font-display font-bold text-caribbean-turquoise text-sm tracking-wider">LYRICS</h3>
            <button onClick={() => setShowLyrics(false)} className="text-slate-400 hover:text-white">✕</button>
          </div>
          <div className="p-6 overflow-y-auto custom-scrollbar">
            <p className="whitespace-pre-wrap text-cyan-100/90 leading-relaxed font-sans text-sm text-center">
              {currentSong.lyrics || "No lyrics available for this track."}
            </p>
          </div>
        </div>
      )}

      {/* Glassmorphism Player Container */}
      <div className="bg-caribbean-deep/90 backdrop-blur-xl border-t border-white/10 p-4 pb-6 md:px-8 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">

        {/* Progress Bar - Absolute Top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800 cursor-pointer group">
          <div
            className="h-full bg-gradient-to-r from-caribbean-sun to-caribbean-coral relative transition-all duration-150"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 -top-1.5 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity transform scale-0 group-hover:scale-100" />
          </div>
          {/* Invisible input for range seeking */}
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 mt-2">

          {/* Song Info */}
          <div className="flex items-center gap-4 w-full md:w-1/3 min-w-0">
            <div className={`w-14 h-14 rounded-lg overflow-hidden shadow-lg border border-white/10 flex-shrink-0 ${isPlaying ? 'animate-pulse-slow' : ''}`}>
              <img
                src={currentSong.coverArt || "https://picsum.photos/100/100"}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-display font-bold text-lg truncate leading-tight">{currentSong.title}</h3>
              <p className="text-caribbean-turquoise text-sm truncate">{currentSong.artist}</p>
            </div>
            <button
              onClick={() => toggleLike(currentSong.id)}
              className={`p-2 transition-colors ${likedSongs.has(currentSong.id) ? 'text-caribbean-coral' : 'text-slate-400 hover:text-white'}`}
            >
              <HeartIcon className="w-6 h-6" filled={likedSongs.has(currentSong.id)} />
            </button>
            <button
              onClick={() => setShowLyrics(!showLyrics)}
              className={`p-2 transition-colors ${showLyrics ? 'text-caribbean-turquoise' : 'text-slate-400 hover:text-white'}`}
              title="Show Lyrics"
            >
              <LyricsIcon className="w-5 h-5" active={showLyrics} />
            </button>
          </div>

          {/* Controls */}
          <div className="flex flex-col items-center justify-center w-full md:w-1/3">
            <div className="flex items-center gap-6">
              <button onClick={onPrev} className="text-slate-400 hover:text-white transition-colors">
                <SkipBackIcon className="w-6 h-6" />
              </button>
              <button
                onClick={onPlayPause}
                className="w-12 h-12 rounded-full bg-gradient-to-tr from-caribbean-turquoise to-caribbean-ocean flex items-center justify-center text-white shadow-lg hover:shadow-caribbean-turquoise/50 hover:scale-105 transition-all"
              >
                {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6 ml-1" />}
              </button>
              <button onClick={onNext} className="text-slate-400 hover:text-white transition-colors">
                <SkipForwardIcon className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Volume & Visualizer */}
          <div className="w-full md:w-1/3 flex items-center gap-4 justify-end">
            <div className="hidden md:block h-10 w-32 relative overflow-hidden rounded-lg bg-black/20">
              <Visualizer isPlaying={isPlaying} />
            </div>
            {isAdminAuthenticated && (
              <button
                onClick={handleDownload}
                className="p-2 text-slate-400 hover:text-caribbean-turquoise transition-colors"
                title="Download MP3"
              >
                <DownloadIcon className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-2 w-24">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-slate-400">
                <path d="M13.5 4.06c0-1.336-1.616-2.005-2.56-1.06l-4.5 4.5H4.508c-1.141 0-2.318.664-2.66 1.905A9.76 9.76 0 001.5 12c0 .898.121 1.768.35 2.595.341 1.24 1.518 1.905 2.659 1.905h1.93l4.5 4.5c.945.945 2.561.276 2.561-1.06V4.06zM18.584 5.106a.75.75 0 011.06 0c3.808 3.807 3.808 9.98 0 13.788a.75.75 0 11-1.06-1.06 8.25 8.25 0 000-11.668.75.75 0 010-1.06z" />
                <path d="M15.932 7.757a.75.75 0 011.061 0 6 6 0 010 8.486.75.75 0 01-1.06-1.061 4.5 4.5 0 000-6.364.75.75 0 010-1.06z" />
              </svg>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-caribbean-turquoise"
              />
            </div>
          </div>
        </div>

        <audio
          ref={audioRef}
          src={currentSong.audioSrc}
          crossOrigin="anonymous"
        />
      </div>
    </div>
  );
};

export default Player;

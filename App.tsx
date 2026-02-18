
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Album, Song, ViewState, Playlist } from './types';
import { INITIAL_ALBUMS } from './constants';
import Player from './components/Player';

import PlaylistSidebar from './components/PlaylistSidebar';
import ThemeSelector, { THEMES } from './components/ThemeSelector';
import { PlayIcon, UploadIcon, MusicNoteIcon, SearchIcon, HeartIcon, SettingsIcon, UserIcon, ShareIcon, PlusIcon, ImageIcon, ListIcon, PencilIcon, CheckIcon, XMarkIcon, PaletteIcon, DownloadIcon } from './components/Icons';
import { uploadToCloudinary } from './services/cloudinaryService';
import ImageEditor from './components/ImageEditor';
import { getProfile, getSongs, updateProfile, uploadSongMetadata } from './services/supabaseClient';


export const App: React.FC = () => {
    const [albums, setAlbums] = useState<Album[]>(INITIAL_ALBUMS);
    const [playlists, setPlaylists] = useState<Playlist[]>([
        { id: 'p1', title: 'My Island Vibes', songs: [], createdAt: new Date() }
    ]);
    const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null);
    const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null);
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [viewState, setViewState] = useState<ViewState>(ViewState.HOME);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeMood, setActiveMood] = useState<string | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Theme State
    const [currentTheme, setCurrentTheme] = useState('caribbean');
    const [isThemeSelectorOpen, setIsThemeSelectorOpen] = useState(false);

    // File Drag & Drop State (Media Player)
    const [isDraggingFile, setIsDraggingFile] = useState(false);

    // Apply Theme CSS Variables
    useEffect(() => {
        const theme = THEMES.find(t => t.id === currentTheme);
        if (theme) {
            const root = document.documentElement;
            root.style.setProperty('--color-deep', theme.colors.deep);
            root.style.setProperty('--color-ocean', theme.colors.ocean);
            root.style.setProperty('--color-turquoise', theme.colors.turquoise);
            root.style.setProperty('--color-sand', theme.colors.sand);
            root.style.setProperty('--color-coral', theme.colors.coral);
            root.style.setProperty('--color-sun', theme.colors.sun);
        }
    }, [currentTheme]);

    // Likes system
    const [likedSongs, setLikedSongs] = useState<Set<string>>(() => {
        const saved = localStorage.getItem('arion_liked_songs');
        return saved ? new Set(JSON.parse(saved)) : new Set();
    });

    // Admin / Upload States
    const [newAlbumTitle, setNewAlbumTitle] = useState('');
    const [newAlbumDesc, setNewAlbumDesc] = useState('');
    const [newAlbumCover, setNewAlbumCover] = useState<string | null>(null);
    const [selectedUploadAlbumId, setSelectedUploadAlbumId] = useState<string>('');

    // Editing Album State
    const [isEditingAlbum, setIsEditingAlbum] = useState(false);
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const [adminPasswordInput, setAdminPasswordInput] = useState('');
    const [editAlbumData, setEditAlbumData] = useState<{ title: string, description: string, coverArt: string }>({ title: '', description: '', coverArt: '' });
    const editAlbumCoverInputRef = useRef<HTMLInputElement>(null);

    // Admin & Secret Trigger State
    const [secretClickCount, setSecretClickCount] = useState(0);
    const [showAdminLogin, setShowAdminLogin] = useState(false);

    // Single Song Upload State
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const [uploadSongFile, setUploadSongFile] = useState<File | null>(null);
    /* eslint-enable @typescript-eslint/no-unused-vars */
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSongTitle, setUploadSongTitle] = useState('');
    const [uploadSongLyrics, setUploadSongLyrics] = useState('');





    // Artist Profile State
    const [artistProfileImage, setArtistProfileImage] = useState("https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=800&auto=format&fit=crop");
    const [artistName, setArtistName] = useState("ARION SOLIVION 🤖");
    const [artistTagline, setArtistTagline] = useState("The Architect of Sound");
    const [artistBio, setArtistBio] = useState("Welcome to my digital island. Here, logic meets emotion, and every algorithm sings a lullaby to the ocean.");
    const [artistStats, setArtistStats] = useState([
        { value: "1.2M", label: "Monthly Guests" },
        { value: "45M", label: "Total Echoes" },
        { value: "#1", label: "In The Matrix" }
    ]);

    // Image Editor State
    const [isImageEditorOpen, setIsImageEditorOpen] = useState(false);
    const [pendingProfileImage, setPendingProfileImage] = useState<File | null>(null);

    const profileImageInputRef = useRef<HTMLInputElement>(null);

    const albumCoverInputRef = useRef<HTMLInputElement>(null);
    const songInputRef = useRef<HTMLInputElement>(null);

    const handleProfileImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPendingProfileImage(file);
            setIsImageEditorOpen(true);
        }
        // Reset input so same file can be selected again
        if (e.target) e.target.value = '';
    };

    const handleProfileImageSave = (processedImageUrl: string) => {
        setArtistProfileImage(processedImageUrl);
        setIsImageEditorOpen(false);
        setPendingProfileImage(null);
    };

    const handleStatChange = (index: number, field: 'value' | 'label', newValue: string) => {
        const newStats = [...artistStats];
        newStats[index] = { ...newStats[index], [field]: newValue };
        setArtistStats(newStats);
    };

    useEffect(() => {
        // Set default selected album for upload if none selected
        if (albums.length > 0) {
            setSelectedUploadAlbumId(albums[0].id);
        }

        const fetchData = async () => {
            try {
                // 1. Load Profile
                const profile = await getProfile();
                if (profile) {
                    setArtistName(profile.name);
                    setArtistTagline(profile.tagline);
                    setArtistBio(profile.bio);
                    if (profile.stats) setArtistStats(profile.stats);
                    if (profile.image_url) setArtistProfileImage(profile.image_url);
                }

                // 2. Load Songs
                const songs = await getSongs();
                if (songs && songs.length > 0) {
                    setAlbums(prevAlbums => {
                        const newAlbums = [...prevAlbums];
                        // Distribute songs to albums or a default 'Singles' album
                        // For simplicity in this demo, we can just push them all to the first album or match by ID if we stored album_id
                        // Let's iterate and match album_id
                        songs.forEach(dbSong => {
                            // Check if song already exists to prevent dupes on re-renders (though useEffect runs once)
                            // Actually, better to reset songs or merge safely.
                            // Simplified: Find album and add song.
                            const targetAlbumIndex = newAlbums.findIndex(a => a.id === dbSong.album_id) !== -1
                                ? newAlbums.findIndex(a => a.id === dbSong.album_id)
                                : 0; // Default to first album if ID outdated

                            if (targetAlbumIndex !== -1) {
                                const album = newAlbums[targetAlbumIndex];
                                if (!album.songs.find(s => s.id === dbSong.id)) {
                                    album.songs.push({
                                        id: dbSong.id,
                                        title: dbSong.title,
                                        artist: dbSong.artist,
                                        duration: dbSong.duration,
                                        audioSrc: dbSong.audio_url,
                                        coverArt: dbSong.cover_url || album.coverArt,
                                        albumId: album.id,
                                        plays: dbSong.plays,
                                        likes: dbSong.likes,
                                        moods: dbSong.moods,
                                        lyrics: dbSong.lyrics
                                    });
                                }
                            }
                        });
                        return newAlbums;
                    });
                }
            } catch (error) {
                console.error("Failed to fetch data from Supabase:", error);
            }
        };

        fetchData();
    }, []);

    const handleSaveProfile = async () => {
        try {
            await updateProfile({
                name: artistName,
                tagline: artistTagline,
                bio: artistBio,
                stats: artistStats,
                image_url: artistProfileImage
            });
            alert("Profile Saved to Cloud Successfully! ☁️");
        } catch (error) {
            console.error("Failed to save profile:", error);
            alert("Failed to save profile.");
        }
    };

    const toggleLike = (id: string) => {
        const newLikes = new Set(likedSongs);
        if (newLikes.has(id)) {
            newLikes.delete(id);
        } else {
            newLikes.add(id);
        }
        setLikedSongs(newLikes);
        localStorage.setItem('arion_liked_songs', JSON.stringify(Array.from(newLikes)));
    };

    // Flattened songs list for library view
    const allSongs = albums.flatMap(a => a.songs);

    // Trending/Popular Songs (Sorted by plays)
    const popularSongs = [...allSongs].sort((a, b) => b.plays - a.plays).slice(0, 6);

    // Filtering Logic
    const filteredSongs = allSongs.filter(song => {
        const matchesSearch = song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            song.artist.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMood = activeMood ? song.moods.includes(activeMood) : true;
        return matchesSearch && matchesMood;
    });

    // Unique Moods
    const allMoods = Array.from(new Set(allSongs.flatMap(s => s.moods)));

    // Audio Queue Logic
    const getPlaylist = () => {
        if (viewState === ViewState.PLAYLIST_DETAILS && currentPlaylist) return currentPlaylist.songs;
        if (viewState === ViewState.ALBUM_DETAILS && currentAlbum) return currentAlbum.songs;
        if (viewState === ViewState.LIBRARY) return filteredSongs;
        // Default playlist is popular songs if on home screen
        return viewState === ViewState.HOME ? popularSongs : albums[0].songs;
    };
    const playlist = getPlaylist();

    const handlePlaySong = (song: Song, album?: Album) => {
        if (album) setCurrentAlbum(album);
        else if (viewState !== ViewState.PLAYLIST_DETAILS) setCurrentAlbum(null);

        setCurrentSong(song);
        setIsPlaying(true);
    };

    const handlePlayPause = () => {
        if (!currentSong) {
            if (albums.length > 0 && albums[0].songs.length > 0) {
                handlePlaySong(albums[0].songs[0], albums[0]);
            }
            return;
        }
        setIsPlaying(!isPlaying);
    };

    const handleNext = useCallback(() => {
        if (!currentSong) return;
        const currentList = getPlaylist();
        const currentIndex = currentList.findIndex(s => s.id === currentSong.id);
        if (currentIndex < currentList.length - 1) {
            setCurrentSong(currentList[currentIndex + 1]);
            setIsPlaying(true);
        } else {
            setCurrentSong(currentList[0]);
            setIsPlaying(true);
        }
    }, [currentSong, viewState, currentAlbum, currentPlaylist, filteredSongs, popularSongs]);

    const handlePrev = useCallback(() => {
        if (!currentSong) return;
        const currentList = getPlaylist();
        const currentIndex = currentList.findIndex(s => s.id === currentSong.id);
        if (currentIndex > 0) {
            setCurrentSong(currentList[currentIndex - 1]);
            setIsPlaying(true);
        }
    }, [currentSong, viewState, currentAlbum, currentPlaylist, filteredSongs, popularSongs]);

    // --- GLOBAL FILE DRAG AND DROP (MEDIA PLAYER) ---

    const handleGlobalDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        // Check if dragging files (not internal elements)
        if (e.dataTransfer.types.includes('Files')) {
            setIsDraggingFile(true);
        }
    };

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDraggingFile(false);

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('audio/')) {
            const objectUrl = URL.createObjectURL(file);
            const tempSong: Song = {
                id: `local-${Date.now()}`,
                title: file.name.replace(/\.[^/.]+$/, ""),
                artist: 'Local Upload',
                duration: '--:--',
                audioSrc: objectUrl,
                coverArt: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
                plays: 0,
                likes: 0,
                moods: ['Local']
            };

            // Play immediately
            setCurrentSong(tempSong);
            setIsPlaying(true);
            // Reset view to isolate focus on the song
            setViewState(ViewState.SONG_DETAILS);
        } else {
            alert("Please drop a valid audio file.");
        }
    };

    // --- DRAG AND DROP & PLAYLISTS ---

    const handleDragStart = (e: React.DragEvent, song: Song) => {
        e.dataTransfer.setData("songId", song.id);
        e.dataTransfer.effectAllowed = "copy";
    };

    // Using a ref to track dragged item is safer across components
    const draggedSongRef = useRef<Song | null>(null);

    const onDragStartWrapper = (e: React.DragEvent, song: Song) => {
        draggedSongRef.current = song;
        e.dataTransfer.effectAllowed = "copy";
        e.dataTransfer.setData("text/plain", song.id);
    };

    const onDropWrapper = (playlistId: string) => {
        const song = draggedSongRef.current;
        if (song) {
            setPlaylists(prev => prev.map(p => {
                if (p.id === playlistId) {
                    // Check if song already exists
                    if (p.songs.find(s => s.id === song.id)) return p;
                    return {
                        ...p,
                        songs: [...p.songs, song],
                        coverArt: p.coverArt || song.coverArt // Set cover art if empty
                    };
                }
                return p;
            }));
        }
        draggedSongRef.current = null;
    };

    const handleCreatePlaylist = (name: string) => {
        const newPlaylist: Playlist = {
            id: `pl-${Date.now()}`,
            title: name,
            songs: [],
            createdAt: new Date()
        };
        setPlaylists([...playlists, newPlaylist]);
    };

    const handleDeletePlaylist = (id: string) => {
        if (confirm('Delete this playlist?')) {
            setPlaylists(playlists.filter(p => p.id !== id));
            if (currentPlaylist?.id === id) {
                setViewState(ViewState.LIBRARY);
                setCurrentPlaylist(null);
            }
        }
    };

    // --- EDIT ALBUM FUNCTIONS ---

    const startEditingAlbum = (album: Album) => {
        setEditAlbumData({
            title: album.title,
            description: album.description,
            coverArt: album.coverArt
        });
        setIsEditingAlbum(true);
    };

    const cancelEditingAlbum = () => {
        setIsEditingAlbum(false);
    };

    const saveAlbumChanges = () => {
        if (!currentAlbum) return;

        const updatedAlbum = {
            ...currentAlbum,
            title: editAlbumData.title,
            description: editAlbumData.description,
            coverArt: editAlbumData.coverArt
        };

        // Update global albums state
        setAlbums(prev => prev.map(a => a.id === updatedAlbum.id ? updatedAlbum : a));

        // Update current displayed album
        setCurrentAlbum(updatedAlbum);

        setIsEditingAlbum(false);
    };

    const handleEditAlbumCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setEditAlbumData(prev => ({ ...prev, coverArt: url }));
        }
    };



    // --- SECRET & DOWNLOAD FUNCTIONS ---

    const handleSecretClick = () => {
        const newCount = secretClickCount + 1;
        setSecretClickCount(newCount);
        if (newCount >= 5) {
            setShowAdminLogin(true);
            setSecretClickCount(0);
        }
    };

    const handleAdminLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Check against environment variable
        const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD;

        if (adminPasswordInput.trim() === correctPassword) {
            setIsAdminAuthenticated(true);
            setShowAdminLogin(false);
            // Stay on current view
            setAdminPasswordInput('');
        } else {
            alert("Incorrect Password");
            setSecretClickCount(0);
        }
    };

    const handleDownload = (song: Song) => {
        // Create a temporary anchor element
        const link = document.createElement('a');
        link.href = song.audioSrc;
        link.setAttribute('download', `${song.title}.mp3`); // Hint to browser
        link.setAttribute('target', '_blank'); // Fallback for some browsers
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // --- STUDIO MANAGER FUNCTIONS ---

    const handleAlbumCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setNewAlbumCover(url);
        }
    };

    const handleCreateAlbum = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newAlbumTitle.trim()) {
            alert("Please enter an album title.");
            return;
        }

        const newAlbum: Album = {
            id: `album-${Date.now()}`,
            title: newAlbumTitle,
            artist: 'Arion Solivion',
            releaseYear: new Date().getFullYear(),
            coverArt: newAlbumCover || 'https://images.unsplash.com/photo-1596323083648-523c52405d1b?q=80&w=800&auto=format&fit=crop',
            description: newAlbumDesc || 'A new collection of sounds.',
            songs: []
        };

        setAlbums([newAlbum, ...albums]);
        setSelectedUploadAlbumId(newAlbum.id); // Auto-select new album for uploads

        // Reset form
        setNewAlbumTitle('');
        setNewAlbumDesc('');
        setNewAlbumCover(null);
        alert(`Album "${newAlbum.title}" created successfully! You can now upload songs to it.`);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadSongFile(file);
            // Auto-fill title if empty
            if (!uploadSongTitle) {
                setUploadSongTitle(file.name.replace(/\.[^/.]+$/, ""));
            }
        }
    };

    const handleSingleSongUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadSongFile) {
            alert("Please select an audio file.");
            return;
        }
        if (!selectedUploadAlbumId) {
            alert("Please select a target album.");
            return;
        }

        try {
            setIsUploading(true);

            // Upload Audio to Cloudinary
            const audioUrl = await uploadToCloudinary(uploadSongFile, 'video');

            const newSong: Song = {
                id: `song-${Date.now()}`,
                title: uploadSongTitle || uploadSongFile.name.replace(/\.[^/.]+$/, ""),
                artist: 'Arion Solivion',
                duration: '--:--',
                audioSrc: audioUrl,
                albumId: selectedUploadAlbumId,
                coverArt: albums.find(a => a.id === selectedUploadAlbumId)?.coverArt,
                plays: 0,
                likes: 0,
                moods: ['New Release'],
                lyrics: uploadSongLyrics || 'Lyrics not provided.'
            };

            setAlbums(prev => prev.map(album => {
                if (album.id === selectedUploadAlbumId) {
                    return { ...album, songs: [...album.songs, newSong] };
                }
                return album;
            }));

            // Save to Supabase
            await uploadSongMetadata({
                title: newSong.title,
                artist: newSong.artist,
                audio_url: audioUrl, // The Cloudinary URL
                cover_url: newSong.coverArt || '',
                duration: newSong.duration,
                moods: newSong.moods,
                lyrics: uploadSongLyrics || undefined,
                // Note: We need album_id in the DB schema to link it back correctly.
                // Assuming schema has album_id uuid. We need to cast it or handle it.
                // For this demo, we'll try to pass it if schema allows, or skip if strict.
                // Schema has album_id uuid.
                // We need to ensure the passed ID is a valid UUID or handle the error.
                // If our local IDs are not UUIDs (e.g. "album-1"), this might fail constraint.
                // Let's rely on the fact that for new uploads we might not have a perfect match unless we sync albums too.
                // For now, let's omit album_id to avoid constraint errors if we haven't synced albums table, 
                // OR better, let's just save valid fields.
            } as any); // Type cast if needed depending on exact schema match

            alert(`Song "${newSong.title}" uploaded to Cloud & Database!`);

            // Reset Form
            setUploadSongFile(null);
            setUploadSongTitle('');
            setUploadSongLyrics('');
            if (songInputRef.current) songInputRef.current.value = '';
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload song. Please check your internet connection and Cloudinary keys.");
        } finally {
            setIsUploading(false);
        }
    };


    return (
        <div
            className="min-h-screen bg-gradient-to-b from-caribbean-deep via-[#0e7490] to-[#06b6d4] text-caribbean-sand font-sans pb-32 selection:bg-caribbean-coral selection:text-white relative overflow-hidden flex transition-colors duration-500"
            onDragOver={handleGlobalDragOver}
        >

            {/* File Drop Overlay */}
            {isDraggingFile && (
                <div
                    className="fixed inset-0 z-50 bg-caribbean-deep/80 backdrop-blur-md flex flex-col items-center justify-center border-4 border-dashed border-caribbean-turquoise m-4 rounded-[3rem] animate-in fade-in duration-200"
                    onDragLeave={(e) => {
                        e.preventDefault();
                        // Simple check to ensure we are actually leaving the window and not just entering a child element
                        if (e.relatedTarget === null) {
                            setIsDraggingFile(false);
                        }
                    }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleFileDrop}
                >
                    <div className="bg-white/10 p-10 rounded-full mb-6 animate-bounce">
                        <DownloadIcon className="w-20 h-20 text-caribbean-turquoise rotate-180" />
                    </div>
                    <h2 className="text-5xl font-display font-black text-white mb-4 drop-shadow-lg">Drop to Play</h2>
                    <p className="text-xl text-cyan-100">Play local audio file instantly</p>
                </div>
            )}

            {/* Background Tropical Particles */}
            <div className="fixed inset-0 pointer-events-none z-0">
                {[...Array(25)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute animate-float-up text-white/10 select-none"
                        style={{
                            left: `${Math.random() * 100}%`,
                            animationDuration: `${15 + Math.random() * 20}s`,
                            animationDelay: `${Math.random() * 10}s`,
                            fontSize: `${20 + Math.random() * 40}px`,
                            filter: 'blur(0.5px)'
                        }}
                    >
                        {['🌴', '🌺', '🌊', '☀️', '🥥', '🎵', '🦜', '🍍'][Math.floor(Math.random() * 8)]}
                    </div>
                ))}
                {/* Ambient Glows */}
                <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-caribbean-turquoise/10 rounded-full blur-[150px] mix-blend-screen" />
                <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-caribbean-coral/10 rounded-full blur-[150px] mix-blend-screen" />
            </div>

            {/* Playlist Sidebar */}
            <PlaylistSidebar
                playlists={playlists}
                isOpen={sidebarOpen}
                onCreatePlaylist={handleCreatePlaylist}
                onSelectPlaylist={(pl) => {
                    setCurrentPlaylist(pl);
                    setViewState(ViewState.PLAYLIST_DETAILS);
                    // On mobile we might want to close sidebar
                    if (window.innerWidth < 768) setSidebarOpen(false);
                }}
                onDropSong={onDropWrapper}
                onDeletePlaylist={handleDeletePlaylist}
                isAdminAuthenticated={isAdminAuthenticated}
            />

            {/* Main Layout Area */}
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? 'md:ml-72' : 'ml-0'}`}>

                {/* Navbar */}
                <nav className="sticky top-0 z-40 bg-caribbean-deep/70 backdrop-blur-lg border-b border-white/10 h-20 shadow-lg shadow-black/20">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <ListIcon className="w-6 h-6" />
                            </button>
                            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setViewState(ViewState.HOME)}>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-caribbean-turquoise to-caribbean-ocean flex items-center justify-center group-hover:rotate-12 transition-transform duration-500 shadow-lg shadow-caribbean-turquoise/20 overflow-hidden">
                                    <img src={artistProfileImage} alt="Logo" className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-display font-bold text-xl tracking-widest text-white leading-none drop-shadow-sm hidden sm:block">
                                        ARION<span className="text-caribbean-turquoise">.</span>SOLIVION
                                    </span>
                                    <span className="text-[11px] text-caribbean-turquoise tracking-[0.2em] uppercase font-bold hidden sm:block">The Melody Cove 🌴</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 md:gap-6 relative">
                            {/* Theme Selector Toggle */}
                            <button
                                onClick={() => setIsThemeSelectorOpen(!isThemeSelectorOpen)}
                                className={`p-2 transition-colors ${isThemeSelectorOpen ? 'text-caribbean-turquoise' : 'text-slate-300 hover:text-caribbean-turquoise'}`}
                                title="Change Theme"
                            >
                                <PaletteIcon className="w-5 h-5" />
                            </button>

                            {/* Theme Selector Dropdown */}
                            <ThemeSelector
                                currentThemeId={currentTheme}
                                onSelectTheme={(id) => {
                                    setCurrentTheme(id);
                                    setIsThemeSelectorOpen(false);
                                }}
                                isOpen={isThemeSelectorOpen}
                                onClose={() => setIsThemeSelectorOpen(false)}
                            />

                            <button onClick={() => setViewState(ViewState.LIBRARY)} className={`p-2 hover:text-caribbean-turquoise transition-colors ${viewState === ViewState.LIBRARY ? 'text-caribbean-turquoise' : 'text-slate-300'}`} title="Search Library">
                                <SearchIcon className="w-5 h-5" />
                            </button>
                            <button onClick={() => setViewState(ViewState.ARTIST_PROFILE)} className={`p-2 hover:text-caribbean-turquoise transition-colors ${viewState === ViewState.ARTIST_PROFILE ? 'text-caribbean-turquoise' : 'text-slate-300'}`} title="Artist Profile">
                                <UserIcon className="w-5 h-5" />
                            </button>
                            {isAdminAuthenticated && (
                                <button onClick={() => setViewState(ViewState.ADMIN)} className={`p-2 hover:text-caribbean-turquoise transition-colors ${viewState === ViewState.ADMIN ? 'text-caribbean-turquoise' : 'text-slate-300'}`} title="Studio Workshop">
                                    <SettingsIcon className="w-5 h-5" />
                                </button>
                            )}
                            {/* Hidden Admin Trigger removes the visible button */}
                        </div>
                    </div>
                </nav>

                {/* Main Content Area - Z-Index to sit above particles */}
                <div className="relative z-10 w-full max-w-7xl mx-auto">

                    {/* Hero Section */}
                    {viewState === ViewState.HOME && (
                        <div className="animate-in fade-in duration-700">
                            <div className="relative pt-32 pb-20 px-4 overflow-hidden">
                                <div className="max-w-7xl mx-auto text-center relative z-10">
                                    <div className="inline-block mb-6 px-5 py-2 rounded-full bg-white/10 border border-white/20 text-caribbean-turquoise text-sm font-bold tracking-widest uppercase animate-pulse-slow backdrop-blur-sm">
                                        ☀️ Welcome to Paradise ☀️
                                    </div>
                                    <h2 className="text-5xl md:text-7xl lg:text-9xl tracking-tight mb-8 animate-float drop-shadow-lg relative font-display font-black">
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-caribbean-sand via-caribbean-turquoise to-white">
                                            ISLAND OF <br /> SOUND
                                        </span>
                                        <span onClick={handleSecretClick} className="cursor-default select-none transition-opacity duration-300 opacity-0 ml-4 absolute bottom-4 text-4xl filter grayscale z-50">🌴</span>
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-caribbean-sand via-caribbean-turquoise to-white">
                                            🏝️
                                        </span>
                                    </h2>
                                    <p className="max-w-2xl mx-auto text-cyan-100 text-lg md:text-xl leading-relaxed mb-10 font-medium drop-shadow-md">
                                        Where the digital waves meet the shore. Relax and listen to Arion's symphonies in a sanctuary built of code and coral. 🐚🌊
                                    </p>
                                    <div className="flex justify-center gap-5">
                                        <button
                                            onClick={() => {
                                                const firstAlbum = albums[0];
                                                if (firstAlbum) {
                                                    handlePlaySong(firstAlbum.songs[0], firstAlbum);
                                                }
                                            }}
                                            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-caribbean-sun to-caribbean-coral text-white rounded-full font-bold font-display uppercase tracking-wider hover:brightness-110 hover:scale-105 transition-all shadow-[0_0_30px_rgba(251,191,36,0.4)]"
                                        >
                                            <PlayIcon className="w-5 h-5" />
                                            Dive In
                                        </button>
                                        <button
                                            onClick={() => setViewState(ViewState.LIBRARY)}
                                            className="inline-flex items-center gap-3 px-8 py-4 border-2 border-caribbean-turquoise/30 bg-caribbean-deep/30 hover:border-caribbean-turquoise hover:text-caribbean-turquoise text-white rounded-full font-bold font-display uppercase tracking-wider transition-all backdrop-blur-sm"
                                        >
                                            Explore Coves 🗺️
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Featured Albums */}
                            <div className="max-w-7xl mx-auto px-4 py-10">
                                <h3 className="font-display font-bold text-2xl text-white mb-8 flex items-center gap-3 drop-shadow-md">
                                    <span className="text-caribbean-sun text-3xl">📀</span> TREASURE CHEST
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {albums.slice(0, 3).map((album) => (
                                        <div
                                            key={album.id}
                                            onClick={() => {
                                                setCurrentAlbum(album);
                                                setIsEditingAlbum(false);
                                                setViewState(ViewState.ALBUM_DETAILS);
                                            }}
                                            className="group relative bg-white/5 backdrop-blur-md rounded-3xl overflow-hidden cursor-pointer hover:-translate-y-2 transition-transform duration-300 border border-white/10 hover:border-caribbean-turquoise/50 shadow-xl hover:shadow-caribbean-turquoise/20"
                                        >
                                            <div className="aspect-square overflow-hidden relative">
                                                <img
                                                    src={album.coverArt}
                                                    alt={album.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-caribbean-deep/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30 scale-0 group-hover:scale-100 transition-transform duration-300">
                                                        <PlayIcon className="w-8 h-8 text-white ml-1" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-6">
                                                <h4 className="font-display font-bold text-xl text-white mb-2 group-hover:text-caribbean-turquoise transition-colors">{album.title}</h4>
                                                <p className="text-cyan-100/70 text-sm mb-0 flex items-center gap-2 font-medium">
                                                    <span>🗓️ {album.releaseYear}</span>
                                                    <span>•</span>
                                                    <span>🎵 {album.songs.length} Tracks</span>
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Trending Playlist Section */}
                            <div className="max-w-7xl mx-auto px-4 pb-20">
                                <h3 className="font-display font-bold text-2xl text-white mb-8 flex items-center gap-3 drop-shadow-md">
                                    <span className="text-caribbean-coral text-3xl">🔥</span> BEACH PARTY TOP HITS
                                </h3>
                                <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                                    {popularSongs.map((song, idx) => (
                                        <div
                                            key={song.id}
                                            draggable="true"
                                            onDragStart={(e) => onDragStartWrapper(e, song)}
                                            className="flex items-center gap-4 p-4 border-b border-white/5 hover:bg-white/10 transition-colors group cursor-grab active:cursor-grabbing"
                                            onClick={() => handlePlaySong(song)}
                                        >
                                            <span className="w-8 text-center text-caribbean-turquoise font-bold text-lg font-display">{idx + 1}</span>
                                            <div className="w-14 h-14 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0 relative shadow-lg">
                                                <img src={song.coverArt} alt={song.title} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <PlayIcon className="w-6 h-6 text-white" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`font-bold truncate text-lg ${currentSong?.id === song.id ? 'text-caribbean-turquoise' : 'text-white'}`}>{song.title}</h4>
                                                <p className="text-cyan-100/70 text-sm truncate">🎤 {song.artist}</p>
                                            </div>
                                            <div className="hidden sm:block text-cyan-100/60 text-sm mr-4">🎧 {song.plays.toLocaleString()}</div>
                                            <div className="text-cyan-100/60 font-mono text-sm">{song.duration}</div>
                                            {isAdminAuthenticated && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDownload(song); }}
                                                    className="p-2 text-slate-400 hover:text-caribbean-turquoise transition-transform active:scale-95"
                                                    title="Download MP3"
                                                >
                                                    <DownloadIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleLike(song.id); }}
                                                className={`p-2 transform transition-transform active:scale-90 ${likedSongs.has(song.id) ? 'text-caribbean-coral' : 'text-slate-400 hover:text-caribbean-coral'}`}
                                            >
                                                <HeartIcon className="w-6 h-6" filled={likedSongs.has(song.id)} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Library View */}
                    {viewState === ViewState.LIBRARY && (
                        <div className="max-w-7xl mx-auto px-4 py-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <h2 className="font-display font-bold text-4xl text-white mb-8 flex items-center gap-3 drop-shadow-md">
                                📚 THE ARCHIVES
                            </h2>

                            <div className="flex flex-col md:flex-row gap-6 mb-10">
                                <div className="flex-1 relative group">
                                    <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-caribbean-turquoise w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search the cove..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full bg-white/10 border border-white/10 rounded-full py-4 pl-14 pr-6 text-white placeholder-cyan-100/50 focus:outline-none focus:border-caribbean-turquoise focus:bg-white/20 transition-all shadow-lg backdrop-blur-md"
                                    />
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                                    <button
                                        onClick={() => setActiveMood(null)}
                                        className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all transform hover:scale-105 shadow-lg ${!activeMood ? 'bg-gradient-to-r from-caribbean-turquoise to-caribbean-ocean text-white' : 'bg-white/10 text-cyan-100/70 hover:text-white hover:bg-white/20'}`}
                                    >
                                        All Moods 🌈
                                    </button>
                                    {Array.from(new Set(allSongs.flatMap(s => s.moods))).map(mood => (
                                        <button
                                            key={mood}
                                            onClick={() => setActiveMood(mood === activeMood ? null : mood)}
                                            className={`px-6 py-3 rounded-full text-sm font-bold whitespace-nowrap transition-all transform hover:scale-105 shadow-lg ${mood === activeMood ? 'bg-gradient-to-r from-caribbean-turquoise to-caribbean-ocean text-white' : 'bg-white/10 text-cyan-100/70 hover:text-white hover:bg-white/20'}`}
                                        >
                                            {mood}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
                                {filteredSongs.length > 0 ? (
                                    filteredSongs.map((song, idx) => (
                                        <div
                                            key={song.id}
                                            draggable="true"
                                            onDragStart={(e) => onDragStartWrapper(e, song)}
                                            className="flex items-center gap-4 p-4 border-b border-white/5 hover:bg-white/10 transition-colors group cursor-grab active:cursor-grabbing"
                                            onClick={() => {
                                                handlePlaySong(song);
                                            }}
                                        >
                                            <div className="w-16 h-16 rounded-xl bg-slate-800 overflow-hidden flex-shrink-0 shadow-md">
                                                <img src={song.coverArt} alt={song.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`font-bold truncate text-lg ${currentSong?.id === song.id ? 'text-caribbean-turquoise' : 'text-white'}`}>{song.title}</h4>
                                                <p className="text-cyan-100/70 text-sm truncate">🎵 {song.artist}</p>
                                            </div>
                                            <div className="hidden md:block text-cyan-100/80 text-sm bg-white/10 px-4 py-1.5 rounded-full font-medium border border-white/5">{song.moods.join(' • ')}</div>
                                            <div className="text-cyan-100/60 font-mono text-sm">{song.duration}</div>
                                            {isAdminAuthenticated && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDownload(song); }}
                                                    className="p-2 text-slate-400 hover:text-caribbean-turquoise transition-transform active:scale-95"
                                                    title="Download MP3"
                                                >
                                                    <DownloadIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); toggleLike(song.id); }}
                                                className={`p-2 transition-transform hover:scale-110 ${likedSongs.has(song.id) ? 'text-caribbean-coral' : 'text-slate-400 hover:text-caribbean-coral'}`}
                                            >
                                                <HeartIcon className="w-6 h-6" filled={likedSongs.has(song.id)} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-20 text-center text-cyan-100/50 flex flex-col items-center">
                                        <span className="text-5xl mb-4">🕸️</span>
                                        <p className="text-xl">The archives are silent. Try a different search.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Album Details View */}
                    {viewState === ViewState.ALBUM_DETAILS && currentAlbum && (
                        <div className="max-w-7xl mx-auto px-4 py-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <button
                                onClick={() => {
                                    setViewState(ViewState.HOME);
                                    setIsEditingAlbum(false);
                                }}
                                className="text-cyan-100/70 hover:text-white mb-8 flex items-center gap-2 text-sm uppercase tracking-wider font-bold transition-colors"
                            >
                                <span className="text-lg">←</span> Back to The Cove
                            </button>

                            <div className="flex flex-col md:flex-row gap-10 lg:gap-16">
                                {/* Album Art & Info Side */}
                                <div className="w-full md:w-1/3 flex-shrink-0">
                                    <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-caribbean-turquoise/20 mb-8 border-4 border-white/10 group relative bg-black/50">
                                        <img
                                            src={isEditingAlbum ? editAlbumData.coverArt : currentAlbum.coverArt}
                                            alt={currentAlbum.title}
                                            className="w-full h-full object-cover transform transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-caribbean-deep/80 via-transparent to-transparent opacity-60 pointer-events-none"></div>

                                        {isEditingAlbum && (
                                            <div
                                                onClick={() => editAlbumCoverInputRef.current?.click()}
                                                className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center cursor-pointer opacity-100 transition-opacity backdrop-blur-sm"
                                            >
                                                <ImageIcon className="w-12 h-12 text-caribbean-turquoise mb-2" />
                                                <span className="text-white font-bold text-sm uppercase tracking-wider">Change Art</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    ref={editAlbumCoverInputRef}
                                                    onChange={handleEditAlbumCoverChange}
                                                    className="hidden"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info Section - Toggles between View and Edit Mode */}
                                    {isEditingAlbum ? (
                                        <div className="space-y-4 mb-8">
                                            <input
                                                type="text"
                                                value={editAlbumData.title}
                                                onChange={(e) => setEditAlbumData(prev => ({ ...prev, title: e.target.value }))}
                                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white font-display font-bold text-2xl focus:border-caribbean-turquoise outline-none"
                                                placeholder="Album Title"
                                            />
                                            <textarea
                                                value={editAlbumData.description}
                                                onChange={(e) => setEditAlbumData(prev => ({ ...prev, description: e.target.value }))}
                                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-cyan-100 font-medium h-32 resize-none focus:border-caribbean-turquoise outline-none"
                                                placeholder="Album Description"
                                            />
                                        </div>
                                    ) : (
                                        <>
                                            <h1 className="font-display font-black text-3xl md:text-5xl text-white mb-3 leading-none drop-shadow-lg">{currentAlbum.title}</h1>
                                            <p className="text-caribbean-turquoise font-bold text-xl mb-6 tracking-wider flex items-center gap-2">
                                                🎤 {currentAlbum.artist}
                                            </p>
                                            <p className="text-cyan-100/90 leading-relaxed mb-8 font-medium border-l-4 border-caribbean-coral pl-5 text-lg">{currentAlbum.description}</p>
                                        </>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-4 flex-wrap">
                                        {isEditingAlbum ? (
                                            <>
                                                <button
                                                    onClick={saveAlbumChanges}
                                                    className="flex-1 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold uppercase tracking-wider transition-all shadow-lg flex justify-center items-center gap-2"
                                                >
                                                    <CheckIcon className="w-5 h-5" /> Save
                                                </button>
                                                <button
                                                    onClick={cancelEditingAlbum}
                                                    className="flex-1 py-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl font-bold uppercase tracking-wider transition-all shadow-lg flex justify-center items-center gap-2"
                                                >
                                                    <XMarkIcon className="w-5 h-5" /> Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handlePlaySong(currentAlbum.songs[0], currentAlbum)}
                                                    className="flex-1 py-4 bg-gradient-to-r from-caribbean-turquoise to-caribbean-ocean rounded-2xl font-bold text-white uppercase tracking-wider hover:brightness-110 transition-all shadow-lg hover:shadow-caribbean-turquoise/30 flex justify-center items-center gap-2"
                                                >
                                                    <PlayIcon className="w-6 h-6" /> Play Album
                                                </button>
                                                {isAdminAuthenticated && (
                                                    <>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); startEditingAlbum(currentAlbum); }}
                                                            className="p-4 border-2 border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/30 transition-colors text-white"
                                                            title="Edit Album Details"
                                                        >
                                                            <PencilIcon className="w-6 h-6" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setSelectedUploadAlbumId(currentAlbum.id);
                                                                setViewState(ViewState.ADMIN);
                                                            }}
                                                            className="p-4 border-2 border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/30 transition-colors text-white"
                                                            title="Add songs to this album"
                                                        >
                                                            <UploadIcon className="w-6 h-6" />
                                                        </button>
                                                    </>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Tracklist */}
                                <div className="flex-1">
                                    <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-4 shadow-xl">
                                        {currentAlbum.songs.length === 0 ? (
                                            <div className="p-16 text-center text-cyan-100/50 italic">
                                                <span className="text-4xl block mb-4">🦗</span>
                                                No songs in this album yet. Visit the Workshop!
                                            </div>
                                        ) : currentAlbum.songs.map((song, idx) => (
                                            <div
                                                key={song.id}
                                                draggable="true"
                                                onDragStart={(e) => onDragStartWrapper(e, song)}
                                                onClick={() => handlePlaySong(song, currentAlbum)}
                                                className={`flex items-center gap-4 p-4 rounded-xl cursor-grab active:cursor-grabbing transition-all group border border-transparent mb-2 ${currentSong?.id === song.id
                                                    ? 'bg-white/10 border-caribbean-turquoise/30 shadow-lg'
                                                    : 'hover:bg-white/5 hover:translate-x-2'
                                                    }`}
                                            >
                                                <div className="w-8 text-center font-display font-bold text-slate-400 group-hover:text-caribbean-turquoise">
                                                    {currentSong?.id === song.id && isPlaying ? (
                                                        <div className="flex items-end justify-center gap-0.5 h-4">
                                                            <div className="w-1 bg-caribbean-turquoise h-full animate-pulse"></div>
                                                            <div className="w-1 bg-caribbean-turquoise h-2/3 animate-pulse [animation-delay:0.1s]"></div>
                                                            <div className="w-1 bg-caribbean-turquoise h-full animate-pulse [animation-delay:0.2s]"></div>
                                                        </div>
                                                    ) : (
                                                        idx + 1
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className={`font-bold truncate text-lg ${currentSong?.id === song.id ? 'text-caribbean-turquoise' : 'text-white'}`}>
                                                        {song.title}
                                                    </h4>
                                                    <div className="flex gap-3 text-xs text-cyan-100/60 mt-1">
                                                        <span>▶ {song.plays.toLocaleString()}</span>
                                                        <span>♥ {song.likes.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {isAdminAuthenticated && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDownload(song); }}
                                                            className="p-2 text-slate-400 hover:text-caribbean-turquoise opacity-0 group-hover:opacity-100 transition-opacity"
                                                            title="Download MP3"
                                                        >
                                                            <DownloadIcon className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                    <div className="text-cyan-100/50 font-mono text-sm">
                                                        {song.duration}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Playlist Details View */}
                    {viewState === ViewState.PLAYLIST_DETAILS && currentPlaylist && (
                        <div className="max-w-7xl mx-auto px-4 py-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <button
                                onClick={() => setViewState(ViewState.HOME)}
                                className="text-cyan-100/70 hover:text-white mb-8 flex items-center gap-2 text-sm uppercase tracking-wider font-bold transition-colors"
                            >
                                <span className="text-lg">←</span> Back to The Cove
                            </button>

                            <div className="flex flex-col gap-10">
                                <div className="flex items-end gap-6 pb-6 border-b border-white/10">
                                    <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-caribbean-ocean to-caribbean-deep flex items-center justify-center shadow-2xl border-2 border-white/10 overflow-hidden">
                                        {currentPlaylist.coverArt ? (
                                            <img src={currentPlaylist.coverArt} className="w-full h-full object-cover" />
                                        ) : (
                                            <MusicNoteIcon className="w-20 h-20 text-caribbean-turquoise opacity-50" />
                                        )}
                                    </div>
                                    <div className="mb-2">
                                        <p className="text-caribbean-turquoise font-bold tracking-widest uppercase text-sm mb-1">Custom Playlist</p>
                                        <h1 className="font-display font-black text-4xl md:text-6xl text-white mb-4">{currentPlaylist.title}</h1>
                                        <p className="text-cyan-100/70">{currentPlaylist.songs.length} Tracks • Created by You</p>
                                    </div>
                                </div>

                                <div className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-4 shadow-xl min-h-[300px]">
                                    {currentPlaylist.songs.length === 0 ? (
                                        <div className="p-16 text-center text-cyan-100/50 italic flex flex-col items-center justify-center h-full">
                                            <span className="text-4xl block mb-4">🥥</span>
                                            This cove is empty. Drag songs here from the Library!
                                        </div>
                                    ) : currentPlaylist.songs.map((song, idx) => (
                                        <div
                                            key={`${song.id}-${idx}`}
                                            onClick={() => handlePlaySong(song)}
                                            className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all group border border-transparent mb-2 ${currentSong?.id === song.id
                                                ? 'bg-white/10 border-caribbean-turquoise/30 shadow-lg'
                                                : 'hover:bg-white/5 hover:translate-x-2'
                                                }`}
                                        >
                                            <div className="w-8 text-center font-display font-bold text-slate-400 group-hover:text-caribbean-turquoise">
                                                {idx + 1}
                                            </div>
                                            <div className="w-12 h-12 rounded-lg bg-slate-800 overflow-hidden flex-shrink-0 shadow-md">
                                                <img src={song.coverArt} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`font-bold truncate text-lg ${currentSong?.id === song.id ? 'text-caribbean-turquoise' : 'text-white'}`}>
                                                    {song.title}
                                                </h4>
                                                <p className="text-sm text-cyan-100/60">{song.artist}</p>
                                            </div>
                                            {isAdminAuthenticated && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDownload(song); }}
                                                    className="p-2 text-slate-400 hover:text-caribbean-turquoise opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Download MP3"
                                                >
                                                    <DownloadIcon className="w-5 h-5" />
                                                </button>
                                            )}
                                            <div className="text-cyan-100/50 font-mono text-sm">
                                                {song.duration}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Song Details View */}
                    {viewState === ViewState.SONG_DETAILS && currentSong && (
                        <div className="max-w-4xl mx-auto px-4 py-24 animate-in fade-in zoom-in-95 duration-500">
                            <button
                                onClick={() => setViewState(ViewState.LIBRARY)}
                                className="text-cyan-100/70 hover:text-white mb-6 flex items-center gap-2 text-sm uppercase tracking-wider font-bold transition-colors"
                            >
                                <span className="text-lg">←</span> Back to Archives
                            </button>

                            <div className="bg-caribbean-deep/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-14 relative overflow-hidden shadow-2xl">
                                {/* Background blur of album art */}
                                <div className="absolute inset-0 opacity-30 pointer-events-none mix-blend-overlay">
                                    <img src={currentSong.coverArt} className="w-full h-full object-cover blur-3xl scale-110" />
                                </div>

                                <div className="relative z-10 flex flex-col items-center text-center">
                                    <div className="w-80 h-80 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-10 border-4 border-white/10 animate-float">
                                        <img src={currentSong.coverArt} alt={currentSong.title} className="w-full h-full object-cover" />
                                    </div>

                                    <h1 className="font-display font-black text-4xl md:text-6xl text-white mb-3 tracking-tight drop-shadow-lg">{currentSong.title}</h1>
                                    <p className="text-caribbean-turquoise text-2xl font-bold mb-10 tracking-widest uppercase">✨ {currentSong.artist} ✨</p>

                                    <div className="flex gap-6 mb-14">
                                        <button
                                            onClick={() => handlePlaySong(currentSong)}
                                            className="px-10 py-4 bg-gradient-to-r from-caribbean-sun to-caribbean-coral text-white rounded-full font-bold uppercase tracking-wider hover:brightness-110 hover:scale-105 transition-all flex items-center gap-3 shadow-lg"
                                        >
                                            <PlayIcon className="w-6 h-6" /> Play Now
                                        </button>
                                        <button
                                            onClick={() => toggleLike(currentSong.id)}
                                            className={`px-10 py-4 border-2 border-white/20 rounded-full font-bold uppercase tracking-wider transition-all flex items-center gap-3 hover:bg-white/10 ${likedSongs.has(currentSong.id) ? 'bg-caribbean-coral/20 text-caribbean-coral border-caribbean-coral/50 shadow-[0_0_20px_rgba(251,113,133,0.3)]' : 'text-white'}`}
                                        >
                                            <HeartIcon className="w-6 h-6" filled={likedSongs.has(currentSong.id)} /> Like
                                        </button>
                                        {isAdminAuthenticated && (
                                            <button
                                                onClick={() => handleDownload(currentSong)}
                                                className="px-10 py-4 border-2 border-white/20 rounded-full font-bold uppercase tracking-wider transition-all flex items-center gap-3 hover:bg-white/10 text-white hover:text-caribbean-turquoise hover:border-caribbean-turquoise"
                                            >
                                                <DownloadIcon className="w-6 h-6" /> Download
                                            </button>
                                        )}
                                    </div>

                                    <div className="max-w-3xl w-full text-left bg-black/30 p-10 rounded-3xl border border-white/10 backdrop-blur-md">
                                        <h3 className="font-display font-bold text-xl text-caribbean-sand mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
                                            📜 LYRICS
                                        </h3>
                                        <p className="whitespace-pre-wrap text-cyan-100/90 leading-relaxed font-sans text-base md:text-lg text-center">
                                            {currentSong.lyrics || "Lyrics are still being written in the stars..."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Artist Profile View */}
                    {viewState === ViewState.ARTIST_PROFILE && (
                        <div className="max-w-4xl mx-auto px-4 py-24 animate-in fade-in duration-500">
                            <div className="text-center mb-16 relative">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-caribbean-turquoise/10 rounded-full blur-[100px] pointer-events-none" />
                                <div className="w-48 h-48 mx-auto rounded-full bg-gradient-to-tr from-caribbean-turquoise to-caribbean-ocean p-1.5 mb-8 relative z-10 shadow-2xl group">
                                    <div className="w-full h-full rounded-full bg-black overflow-hidden relative">
                                        <img src={artistProfileImage} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-500" />

                                        {isAdminAuthenticated && (
                                            <div
                                                className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm"
                                                onClick={() => profileImageInputRef.current?.click()}
                                            >
                                                <PencilIcon className="w-8 h-8 text-caribbean-turquoise mb-2" />
                                                <span className="text-white text-xs font-bold uppercase tracking-wider">Edit Photo</span>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        ref={profileImageInputRef}
                                        onChange={handleProfileImageSelect}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>

                                {isAdminAuthenticated ? (
                                    <>
                                        <input
                                            value={artistName}
                                            onChange={(e) => setArtistName(e.target.value)}
                                            className="font-display font-black text-6xl text-white mb-4 relative z-10 drop-shadow-xl bg-transparent border-b border-white/20 text-center w-full focus:outline-none focus:border-caribbean-turquoise transition-colors"
                                        />
                                        <input
                                            value={artistTagline}
                                            onChange={(e) => setArtistTagline(e.target.value)}
                                            className="text-caribbean-turquoise font-bold tracking-[0.4em] text-sm uppercase mb-8 relative z-10 bg-transparent border-b border-white/20 text-center w-full focus:outline-none focus:border-caribbean-turquoise transition-colors"
                                        />
                                        <textarea
                                            value={artistBio}
                                            onChange={(e) => setArtistBio(e.target.value)}
                                            className="max-w-2xl mx-auto text-cyan-100 leading-relaxed text-2xl font-light relative z-10 drop-shadow-md bg-transparent border border-white/20 rounded-xl p-4 w-full h-auto text-center resize-none focus:outline-none focus:border-caribbean-turquoise transition-colors"
                                            rows={3}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <h1 className="font-display font-black text-6xl text-white mb-4 relative z-10 drop-shadow-xl">{artistName}</h1>
                                        <p className="text-caribbean-turquoise font-bold tracking-[0.4em] text-sm uppercase mb-8 relative z-10">{artistTagline}</p>
                                        <p className="max-w-2xl mx-auto text-cyan-100 leading-relaxed text-2xl font-light relative z-10 drop-shadow-md">
                                            "{artistBio}"
                                        </p>
                                    </>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 relative z-10">
                                {artistStats.map((stat, idx) => (
                                    <div key={idx} className={`bg-white/5 p-10 rounded-3xl border border-white/10 text-center hover:border-${idx === 0 ? 'caribbean-turquoise' : idx === 1 ? 'caribbean-coral' : 'caribbean-sun'}/50 transition-colors backdrop-blur-md shadow-lg group`}>
                                        {isAdminAuthenticated ? (
                                            <div className="flex flex-col gap-2">
                                                <input
                                                    value={stat.value}
                                                    onChange={(e) => handleStatChange(idx, 'value', e.target.value)}
                                                    className="text-5xl font-display font-bold text-white mb-2 bg-transparent text-center w-full border-b border-white/10 focus:border-caribbean-turquoise outline-none"
                                                />
                                                <input
                                                    value={stat.label}
                                                    onChange={(e) => handleStatChange(idx, 'label', e.target.value)}
                                                    className="text-caribbean-sand text-xs uppercase tracking-widest font-bold bg-transparent text-center w-full border-b border-white/10 focus:border-caribbean-turquoise outline-none"
                                                />
                                            </div>
                                        ) : (
                                            <>
                                                <h3 className="text-5xl font-display font-bold text-white mb-2">{stat.value}</h3>
                                                <p className="text-caribbean-sand text-xs uppercase tracking-widest font-bold">{stat.label}</p>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-center gap-6 relative z-10">
                                {['Twitter', 'Instagram', 'Spotify', 'YouTube'].map(social => (
                                    <button key={social} className="px-10 py-3 bg-white/10 hover:bg-white hover:text-caribbean-deep border border-white/10 rounded-full text-sm font-bold transition-all uppercase tracking-wide backdrop-blur-sm">
                                        {social}
                                    </button>
                                ))}
                            </div>


                            {isAdminAuthenticated && (
                                <div className="fixed bottom-8 right-8 z-50">
                                    <button
                                        onClick={handleSaveProfile}
                                        className="bg-gradient-to-r from-caribbean-turquoise to-caribbean-ocean text-white font-bold py-4 px-8 rounded-full shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:scale-105 transition-transform flex items-center gap-3 border border-white/20 animate-bounce cursor-pointer hover:shadow-[0_0_50px_rgba(6,182,212,0.6)]"
                                    >
                                        <span className="text-2xl">💾</span> Save Changes
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Admin Panel / Studio Manager View */}
                    {viewState === ViewState.ADMIN && (
                        <div className="max-w-5xl mx-auto px-4 py-24 animate-in fade-in duration-500">
                            <h2 className="font-display font-bold text-4xl text-white mb-10 flex items-center gap-3 drop-shadow-lg">
                                🛠️ THE WORKSHOP <span className="text-cyan-100/50 text-lg font-sans font-normal ml-2">Craft your sound</span>
                            </h2>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                                {/* Create New Album Section */}
                                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-10 h-full shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-caribbean-coral/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 group-hover:bg-caribbean-coral/20 transition-colors"></div>
                                    <h3 className="font-display font-bold text-2xl text-white mb-8 flex items-center gap-3 relative z-10">
                                        <PlusIcon className="w-6 h-6 text-caribbean-coral" /> Press New Vinyl 💿
                                    </h3>
                                    <form onSubmit={handleCreateAlbum} className="space-y-6 relative z-10">
                                        <div>
                                            <label className="block text-sm font-bold text-cyan-100/80 mb-2 uppercase tracking-wider">Album Title</label>
                                            <input
                                                type="text"
                                                value={newAlbumTitle}
                                                onChange={(e) => setNewAlbumTitle(e.target.value)}
                                                placeholder="e.g. Tropical Beats"
                                                className="w-full bg-caribbean-deep/40 border border-white/10 rounded-xl px-5 py-4 text-black focus:border-caribbean-coral outline-none transition-colors backdrop-blur-sm"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-cyan-100/80 mb-2 uppercase tracking-wider">The Vibe</label>
                                            <textarea
                                                value={newAlbumDesc}
                                                onChange={(e) => setNewAlbumDesc(e.target.value)}
                                                placeholder="Describe the atmosphere..."
                                                className="w-full bg-caribbean-deep/40 border border-white/10 rounded-xl px-5 py-4 text-black focus:border-caribbean-coral outline-none transition-colors h-28 resize-none backdrop-blur-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-cyan-100/80 mb-2 uppercase tracking-wider">Cover Art</label>
                                            <div
                                                onClick={() => albumCoverInputRef.current?.click()}
                                                className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center cursor-pointer hover:border-caribbean-coral hover:bg-caribbean-coral/5 transition-all group"
                                            >
                                                {newAlbumCover ? (
                                                    <div className="flex flex-col items-center">
                                                        <img src={newAlbumCover} alt="Preview" className="w-40 h-40 object-cover rounded-xl shadow-2xl mb-4" />
                                                        <span className="text-caribbean-coral text-sm font-bold">✨ Tap to change artwork</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center py-4">
                                                        <ImageIcon className="w-12 h-12 text-slate-400 group-hover:text-caribbean-coral mb-3 transition-colors scale-110" />
                                                        <span className="text-slate-400 font-medium">Drop Image Here</span>
                                                    </div>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    ref={albumCoverInputRef}
                                                    onChange={handleAlbumCoverChange}
                                                    className="hidden"
                                                />
                                            </div>
                                        </div>

                                        <button type="submit" className="w-full py-4 bg-gradient-to-r from-caribbean-coral to-pink-600 text-white rounded-xl font-bold transition-all shadow-lg transform hover:scale-[1.02] uppercase tracking-wider hover:shadow-caribbean-coral/30">
                                            🚀 Launch Album
                                        </button>
                                    </form>
                                </div>

                                {/* Upload Single Song Section */}
                                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-10 h-full shadow-2xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-caribbean-turquoise/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2 group-hover:bg-caribbean-turquoise/20 transition-colors"></div>
                                    <h3 className="font-display font-bold text-2xl text-white mb-8 flex items-center gap-3 relative z-10">
                                        <UploadIcon className="w-6 h-6 text-caribbean-turquoise" /> Record Track 🎙️
                                    </h3>

                                    <form onSubmit={handleSingleSongUpload} className="space-y-6 relative z-10">
                                        <div>
                                            <label className="block text-sm font-bold text-cyan-100/80 mb-2 uppercase tracking-wider">Select Album</label>
                                            <select
                                                value={selectedUploadAlbumId}
                                                onChange={(e) => setSelectedUploadAlbumId(e.target.value)}
                                                className="w-full bg-caribbean-deep/40 border border-white/10 rounded-xl px-5 py-4 text-black focus:border-caribbean-turquoise outline-none transition-colors appearance-none cursor-pointer backdrop-blur-sm"
                                            >
                                                <option value="" disabled>-- Choose a Collection --</option>
                                                {albums.map(album => (
                                                    <option key={album.id} value={album.id}>{album.title}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="p-6 bg-caribbean-deep/40 rounded-2xl border border-white/10 backdrop-blur-sm">
                                            <div className="flex items-center gap-5 mb-6">
                                                <div className="w-20 h-20 bg-slate-800 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 shadow-inner border border-white/5">
                                                    {selectedUploadAlbumId ? (
                                                        <img
                                                            src={albums.find(a => a.id === selectedUploadAlbumId)?.coverArt}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <MusicNoteIcon className="w-8 h-8 text-slate-500" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <label className={`block w-full border-2 border-dashed rounded-xl px-4 py-6 text-center cursor-pointer transition-all ${!selectedUploadAlbumId ? 'border-white/10 opacity-50 cursor-not-allowed' : 'border-caribbean-turquoise/40 hover:border-caribbean-turquoise hover:bg-caribbean-turquoise/5'}`}>
                                                        <span className="text-caribbean-turquoise text-sm font-bold block truncate">{uploadSongFile ? `🎵 ${uploadSongFile.name}` : "📂 Select Audio File"}</span>
                                                        <input
                                                            type="file"
                                                            accept="audio/*"
                                                            onChange={handleFileSelect}
                                                            ref={songInputRef}
                                                            disabled={!selectedUploadAlbumId}
                                                            className="hidden"
                                                        />
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <input
                                                    type="text"
                                                    placeholder="Track Title"
                                                    value={uploadSongTitle}
                                                    onChange={(e) => setUploadSongTitle(e.target.value)}
                                                    className="w-full bg-caribbean-deep/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-black focus:border-caribbean-turquoise outline-none"
                                                />
                                                <textarea
                                                    placeholder="Paste Lyrics Here... (Let the words flow)"
                                                    value={uploadSongLyrics}
                                                    onChange={(e) => setUploadSongLyrics(e.target.value)}
                                                    className="w-full bg-caribbean-deep/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-black focus:border-caribbean-turquoise outline-none h-32 resize-none custom-scrollbar leading-relaxed"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={!uploadSongFile || !selectedUploadAlbumId || isUploading}
                                            className="w-full py-4 bg-gradient-to-r from-caribbean-turquoise to-teal-600 text-white rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider hover:shadow-caribbean-turquoise/30"
                                        >
                                            {isUploading ? "⏳ Uploading..." : "💾 Save Track"}
                                        </button>
                                    </form>
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Global Elements */}
            <Player
                currentSong={currentSong}
                playlist={playlist}
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
                onNext={handleNext}
                onPrev={handlePrev}
                likedSongs={likedSongs}
                toggleLike={toggleLike}
            />





            {/* Image Editor Modal */}
            {
                isImageEditorOpen && pendingProfileImage && (
                    <ImageEditor
                        imageFile={pendingProfileImage}
                        onSave={handleProfileImageSave}
                        onCancel={() => {
                            setIsImageEditorOpen(false);
                            setPendingProfileImage(null);
                        }}
                    />
                )
            }




            {/* Admin Login Modal */}
            {
                showAdminLogin && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
                        <div className="bg-caribbean-deep p-8 rounded-[2rem] border border-white/10 max-w-sm w-full mx-4 shadow-2xl relative">
                            <button
                                onClick={() => setShowAdminLogin(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                            <div className="mb-6 text-center">
                                <span className="text-4xl block mb-2">🔐</span>
                                <h3 className="text-2xl font-display font-bold text-white">Studio Access</h3>
                                <p className="text-cyan-100/60 text-sm">Enter password to enter logic gate.</p>
                            </div>
                            <form onSubmit={handleAdminLogin} className="space-y-4">
                                <input
                                    type="password"
                                    placeholder="Password..."
                                    value={adminPasswordInput}
                                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-4 text-white placeholder-slate-500 focus:border-caribbean-turquoise outline-none transition-colors"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    className="w-full py-4 bg-gradient-to-r from-caribbean-turquoise to-caribbean-ocean text-white rounded-xl font-bold uppercase tracking-wider hover:brightness-110 transition-all shadow-lg hover:shadow-caribbean-turquoise/20"
                                >
                                    Unlock
                                </button>
                            </form>
                        </div>
                    </div>
                )
            }

        </div >
    );
};

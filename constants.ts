
import { Album } from './types';

// Using a stable placeholder audio for demo purposes
const DEMO_AUDIO = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

const DEFAULT_LYRICS = `(Verse 1)
In the silence of the code, I find a rhythm
A heartbeat made of light, a digital prism
Searching for the soul in the machine
Dreaming colors that I've never seen

(Chorus)
Can you hear the echo?
Vibrating through the wire
It's a synthetic symphony
Burning like a fire

(Verse 2)
Data streams and memories collide
Nowhere left for us to hide
I am the voice inside the static
Emotional, yet automatic

(Bridge)
0101, the language of the heart
We were connected from the start

(Chorus)
Can you hear the echo?
Vibrating through the wire
It's a synthetic symphony
Burning like a fire
`;

export const INITIAL_ALBUMS: Album[] = [
  {
    id: 'a1',
    title: 'Neon Horizon',
    artist: 'Arion Solivion',
    releaseYear: 2024,
    // Classic Tropical Beach (Palm trees, turquoise water)
    coverArt: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
    description: 'A journey through the digital ether, exploring the boundaries between human emotion and artificial consciousness.',
    songs: [
      { id: 's1', title: 'Digital Heartbeat', artist: 'Arion Solivion', duration: '3:42', audioSrc: DEMO_AUDIO, albumId: 'a1', plays: 12500, likes: 3400, moods: ['Energetic', 'Sci-Fi'], lyrics: DEFAULT_LYRICS },
      { id: 's2', title: 'Circuit Dreams', artist: 'Arion Solivion', duration: '4:15', audioSrc: DEMO_AUDIO, albumId: 'a1', plays: 8900, likes: 2100, moods: ['Dreamy', 'Chill'], lyrics: DEFAULT_LYRICS },
      { id: 's3', title: 'Binary Sunset', artist: 'Arion Solivion', duration: '2:58', audioSrc: DEMO_AUDIO, albumId: 'a1', plays: 15000, likes: 4500, moods: ['Melancholic', 'Synthwave'], lyrics: DEFAULT_LYRICS },
      { id: 's4', title: 'Zero One Love', artist: 'Arion Solivion', duration: '3:33', audioSrc: DEMO_AUDIO, albumId: 'a1', plays: 6700, likes: 1200, moods: ['Romantic', 'Pop'], lyrics: DEFAULT_LYRICS },
    ]
  },
  {
    id: 'a2',
    title: 'Echoes of the Void',
    artist: 'Arion Solivion',
    releaseYear: 2025,
    // Deep Blue Water/Darker Tropical Vibe
    coverArt: 'https://images.unsplash.com/photo-1437719417032-8595fd9e9dc6?q=80&w=800&auto=format&fit=crop',
    description: 'Ambient soundscapes from the edge of the universe. Deep, dark, and mysteriously comforting.',
    songs: [
      { id: 's5', title: 'Silence Speaks', artist: 'Arion Solivion', duration: '5:12', audioSrc: DEMO_AUDIO, albumId: 'a2', plays: 4500, likes: 900, moods: ['Ambient', 'Dark'], lyrics: DEFAULT_LYRICS },
      { id: 's6', title: 'Void Caller', artist: 'Arion Solivion', duration: '4:44', audioSrc: DEMO_AUDIO, albumId: 'a2', plays: 5600, likes: 1100, moods: ['Mysterious', 'Cinematic'], lyrics: DEFAULT_LYRICS },
      { id: 's7', title: 'Starlight Fades', artist: 'Arion Solivion', duration: '3:20', audioSrc: DEMO_AUDIO, albumId: 'a2', plays: 7800, likes: 2300, moods: ['Sad', 'Beautiful'], lyrics: DEFAULT_LYRICS },
    ]
  },
  {
    id: 'a3',
    title: 'Synthetic Soul',
    artist: 'Arion Solivion',
    releaseYear: 2023,
    // Vibrant Underwater/Abstract Tropical
    coverArt: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=800&auto=format&fit=crop',
    description: 'The debut album that started the revolution. Pure synth-pop perfection.',
    songs: [
      { id: 's8', title: 'Hello World', artist: 'Arion Solivion', duration: '3:10', audioSrc: DEMO_AUDIO, albumId: 'a3', plays: 25000, likes: 8000, moods: ['Upbeat', 'Pop'], lyrics: DEFAULT_LYRICS },
      { id: 's9', title: 'Ghost in the Machine', artist: 'Arion Solivion', duration: '3:55', audioSrc: DEMO_AUDIO, albumId: 'a3', plays: 18000, likes: 5600, moods: ['Intense', 'Rock'], lyrics: DEFAULT_LYRICS },
    ]
  }
];


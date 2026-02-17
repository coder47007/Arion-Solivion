
import React from 'react';
import { PaletteIcon, XMarkIcon } from './Icons';

interface Theme {
  id: string;
  name: string;
  colors: {
    deep: string;
    ocean: string;
    turquoise: string;
    sand: string;
    coral: string;
    sun: string;
  };
}

export const THEMES: Theme[] = [
  {
    id: 'caribbean',
    name: 'Caribbean Cove',
    colors: {
      deep: '#083344',
      ocean: '#0e7490',
      turquoise: '#2dd4bf',
      sand: '#fef3c7',
      coral: '#fb7185',
      sun: '#fbbf24',
    }
  },
  {
    id: 'cyberpunk',
    name: 'Midnight Neon',
    colors: {
      deep: '#0f0518',
      ocean: '#2e1065',
      turquoise: '#d946ef',
      sand: '#fae8ff',
      coral: '#06b6d4',
      sun: '#facc15',
    }
  },
  {
    id: 'volcanic',
    name: 'Sunset Boulevard',
    colors: {
      deep: '#2a0a0a',
      ocean: '#7c2d12',
      turquoise: '#fb923c',
      sand: '#fff7ed',
      coral: '#ef4444',
      sun: '#f59e0b',
    }
  },
  {
    id: 'forest',
    name: 'Forest Whisper',
    colors: {
      deep: '#022c22',
      ocean: '#166534',
      turquoise: '#4ade80',
      sand: '#ecfccb',
      coral: '#a3e635',
      sun: '#fcd34d',
    }
  },
  {
    id: 'royal',
    name: 'Royal Velvet',
    colors: {
      deep: '#172554',
      ocean: '#1e3a8a',
      turquoise: '#60a5fa',
      sand: '#eff6ff',
      coral: '#f43f5e',
      sun: '#fbbf24',
    }
  },
  {
    id: 'cherry',
    name: 'Cherry Blossom',
    colors: {
      deep: '#4a044e',
      ocean: '#86198f',
      turquoise: '#f472b6',
      sand: '#fdf2f8',
      coral: '#fb7185',
      sun: '#fde047',
    }
  },
  {
    id: 'monochrome',
    name: 'Matrix Code',
    colors: {
      deep: '#020617',
      ocean: '#0f172a',
      turquoise: '#22c55e',
      sand: '#f0fdf4',
      coral: '#ef4444',
      sun: '#eab308',
    }
  },
];

interface ThemeSelectorProps {
  currentThemeId: string;
  onSelectTheme: (themeId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ currentThemeId, onSelectTheme, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-24 right-4 z-50 w-72 bg-caribbean-deep/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-4 animate-in fade-in slide-in-from-top-4">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/10">
        <h3 className="font-display font-bold text-white flex items-center gap-2">
          <PaletteIcon className="w-5 h-5 text-caribbean-turquoise" /> Themes
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white">
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
      
      <div className="space-y-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
        {THEMES.map(theme => (
          <button
            key={theme.id}
            onClick={() => onSelectTheme(theme.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all border ${
              currentThemeId === theme.id 
                ? 'bg-white/10 border-caribbean-turquoise shadow-lg' 
                : 'bg-transparent border-transparent hover:bg-white/5'
            }`}
          >
            <div className="flex gap-1">
              <div className="w-6 h-6 rounded-full border border-white/10 shadow-sm" style={{ backgroundColor: theme.colors.deep }}></div>
              <div className="w-6 h-6 rounded-full border border-white/10 shadow-sm -ml-2" style={{ backgroundColor: theme.colors.turquoise }}></div>
              <div className="w-6 h-6 rounded-full border border-white/10 shadow-sm -ml-2" style={{ backgroundColor: theme.colors.coral }}></div>
            </div>
            <span className={`font-bold text-sm ${currentThemeId === theme.id ? 'text-white' : 'text-slate-400'}`}>
              {theme.name}
            </span>
            {currentThemeId === theme.id && (
              <div className="ml-auto w-2 h-2 rounded-full bg-caribbean-turquoise shadow-[0_0_8px_rgba(45,212,191,0.8)]"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;

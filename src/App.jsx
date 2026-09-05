import React, { useState, useEffect, useRef } from 'react';
import { audioEngine } from './audio/AudioEngine';
import { SAMPLE_TRACKS } from './audio/sampleTracks';

import { Header } from './components/Header';
import { PlayerControls } from './components/PlayerControls';
import { EqualizerPanel } from './components/EqualizerPanel';
import { Spatial8DPanel } from './components/Spatial8DPanel';
import { PlaylistPanel } from './components/PlaylistPanel';
import { LyricsPanel } from './components/LyricsPanel';

import { NeonRingVisualizer } from './components/visualizers/NeonRingVisualizer';
import { VinylPlayerView } from './components/visualizers/VinylPlayerView';
import { WaveformVisualizer } from './components/visualizers/WaveformVisualizer';
import { Radar3DVisualizer } from './components/visualizers/Radar3DVisualizer';
import { Sparkles, Headphones, Compass, Sliders, Music, Monitor } from 'lucide-react';

const DEFAULT_PLAYLISTS = [
  { id: 'all', name: 'All Songs', icon: '🎵', description: 'Complete library of demo and custom uploaded songs' },
  { id: 'pl-8d', name: '8D Spatial Master Mix', icon: '🎧', description: 'Optimized for 360° HRTF binaural headphone spatializer', trackIds: ['track-1', 'track-2', 'track-3', 'track-4'] },
  { id: 'pl-electro', name: 'Cyberpunk Electro Beats', icon: '⚡', description: 'High energy bass boost and neon audio pulse', trackIds: ['track-1', 'track-3'] },
  { id: 'pl-ocean', name: 'Ambient Ocean Waves', icon: '🌊', description: 'Calming spatial reverb and sea piano echoes', trackIds: ['track-2', 'track-4'] }
];

export function App() {
  // Load custom tracks from localStorage
  const [allTracks, setAllTracks] = useState(() => {
    try {
      const saved = localStorage.getItem('antigravity_custom_tracks');
      if (saved) {
        const parsed = JSON.parse(saved);
        return [...parsed, ...SAMPLE_TRACKS];
      }
    } catch (e) {
      console.error('Error loading custom tracks:', e);
    }
    return SAMPLE_TRACKS;
  });

  // Load playlists from localStorage
  const [playlists, setPlaylists] = useState(() => {
    try {
      const saved = localStorage.getItem('antigravity_custom_playlists');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading custom playlists:', e);
    }
    return DEFAULT_PLAYLISTS;
  });

  const [activePlaylistId, setActivePlaylistId] = useState('all');
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);

  const [activeTab, setActiveTab] = useState('player');
  const [uiTheme, setUiTheme] = useState('ios26');
  const [is8DActive, setIs8DActive] = useState(true);

  // Desktop Screen Pass-Through State (Car Windshield Desktop Glass)
  const [desktopStream, setDesktopStream] = useState(null);

  // Active playlist tracks
  const activePlaylist = playlists.find((p) => p.id === activePlaylistId) || playlists[0];
  const activeTracks = activePlaylist.id === 'all'
    ? allTracks
    : allTracks.filter((t) => activePlaylist.trackIds?.includes(t.id));

  const currentTrack = activeTracks[currentTrackIndex] || activeTracks[0] || allTracks[0];

  // Save Playlists to LocalStorage
  const savePlaylistsToStorage = (newPlaylists) => {
    setPlaylists(newPlaylists);
    try {
      localStorage.setItem('antigravity_custom_playlists', JSON.stringify(newPlaylists));
    } catch (e) {
      console.error('Error saving playlists:', e);
    }
  };

  // Initialize track audio
  useEffect(() => {
    if (currentTrack) {
      audioEngine.loadTrack(currentTrack.url);
      if (isPlaying) {
        audioEngine.play().catch(() => setIsPlaying(false));
      }
    }
  }, [currentTrackIndex, activePlaylistId, currentTrack?.id]);

  // Audio HTML Element Listeners
  useEffect(() => {
    const audioEl = audioEngine.audioElement;
    if (!audioEl) return;

    const onTimeUpdate = () => setCurrentTime(audioEl.currentTime);
    const onDurationChange = () => setDuration(audioEl.duration);
    const onEnded = () => handleNextTrack();

    audioEl.addEventListener('timeupdate', onTimeUpdate);
    audioEl.addEventListener('durationchange', onDurationChange);
    audioEl.addEventListener('ended', onEnded);

    return () => {
      audioEl.removeEventListener('timeupdate', onTimeUpdate);
      audioEl.removeEventListener('durationchange', onDurationChange);
      audioEl.removeEventListener('ended', onEnded);
    };
  }, [currentTrackIndex, activeTracks, isRepeat, isShuffle]);

  const handlePlayPause = async () => {
    if (isPlaying) {
      audioEngine.pause();
      setIsPlaying(false);
    } else {
      try {
        await audioEngine.play();
        setIsPlaying(true);
      } catch (err) {
        console.error('Audio play error:', err);
      }
    }
  };

  const handleNextTrack = () => {
    if (isRepeat) {
      audioEngine.seek(0);
      audioEngine.play();
      return;
    }
    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * activeTracks.length);
      setCurrentTrackIndex(randomIndex);
    } else {
      setCurrentTrackIndex((prev) => (prev + 1) % activeTracks.length);
    }
  };

  const handlePrevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + activeTracks.length) % activeTracks.length);
  };

  const handleSeek = (seconds) => {
    setCurrentTime(seconds);
    audioEngine.seek(seconds);
  };

  const handleVolumeChange = (vol) => {
    setVolume(vol);
    setIsMuted(false);
    audioEngine.setVolume(vol);
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioEngine.setVolume(nextMute ? 0 : volume);
  };

  const handleSpeedChange = (spd) => {
    setSpeed(spd);
    audioEngine.setPlaybackRate(spd);
  };

  const handleToggle8D = () => {
    const next = !is8DActive;
    setIs8DActive(next);
    audioEngine.set8DEnabled(next);
  };

  // --- Real Desktop Pass-Through Car Windshield Glass Handler ---
  const handleToggleDesktopGlass = async () => {
    if (desktopStream) {
      desktopStream.getTracks().forEach((track) => track.stop());
      setDesktopStream(null);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { displaySurface: 'monitor' },
          audio: false
        });
        setDesktopStream(stream);
      } catch (err) {
        console.error('Desktop screen pass-through error:', err);
      }
    }
  };

  // --- Playlist Actions ---
  const handleCreatePlaylist = (name) => {
    const newPl = {
      id: `pl-${Date.now()}`,
      name: name,
      icon: '🎶',
      description: 'User created 8D spatial music playlist',
      trackIds: []
    };
    savePlaylistsToStorage([...playlists, newPl]);
    setActivePlaylistId(newPl.id);
  };

  const handleDeletePlaylist = (playlistId) => {
    const next = playlists.filter((p) => p.id !== playlistId);
    savePlaylistsToStorage(next);
    if (activePlaylistId === playlistId) {
      setActivePlaylistId('all');
    }
  };

  const handleAddTrackToPlaylist = (trackId, playlistId) => {
    const next = playlists.map((p) => {
      if (p.id === playlistId) {
        const currentIds = p.trackIds || [];
        if (!currentIds.includes(trackId)) {
          return { ...p, trackIds: [...currentIds, trackId] };
        }
      }
      return p;
    });
    savePlaylistsToStorage(next);
  };

  const handleRemoveTrackFromPlaylist = (trackId, playlistId) => {
    const next = playlists.map((p) => {
      if (p.id === playlistId) {
        return { ...p, trackIds: (p.trackIds || []).filter((id) => id !== trackId) };
      }
      return p;
    });
    savePlaylistsToStorage(next);
  };

  const handleUploadTrack = (newTrack, targetPlaylistId = 'all') => {
    const updatedAll = [newTrack, ...allTracks];
    setAllTracks(updatedAll);

    const customOnly = updatedAll.filter((t) => t.id.startsWith('custom-'));
    try {
      localStorage.setItem('antigravity_custom_tracks', JSON.stringify(customOnly));
    } catch (e) {
      console.error('Error saving custom tracks:', e);
    }

    if (targetPlaylistId !== 'all') {
      handleAddTrackToPlaylist(newTrack.id, targetPlaylistId);
    }
    setCurrentTrackIndex(0);
    audioEngine.loadTrack(newTrack.url);
    audioEngine.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  };

  const handleDeleteTrack = (trackId) => {
    const updatedAll = allTracks.filter((t) => t.id !== trackId);
    setAllTracks(updatedAll);

    const customOnly = updatedAll.filter((t) => t.id.startsWith('custom-'));
    try {
      localStorage.setItem('antigravity_custom_tracks', JSON.stringify(customOnly));
    } catch (e) {
      console.error('Error deleting custom track:', e);
    }

    if (currentTrack?.id === trackId) {
      setCurrentTrackIndex(0);
    }
  };

  // Render Theme Visualizer Component
  const renderVisualizerView = () => {
    switch (uiTheme) {
      case 'neon':
        return (
          <NeonRingVisualizer
            coverUrl={currentTrack.cover}
            isPlaying={isPlaying}
            trackTitle={currentTrack.title}
            artistName={currentTrack.artist}
          />
        );
      case 'vinyl':
        return (
          <VinylPlayerView
            coverUrl={currentTrack.cover}
            isPlaying={isPlaying}
            trackTitle={currentTrack.title}
            artistName={currentTrack.artist}
          />
        );
      case 'wave':
        return (
          <WaveformVisualizer
            coverUrl={currentTrack.cover}
            isPlaying={isPlaying}
            trackTitle={currentTrack.title}
            artistName={currentTrack.artist}
          />
        );
      default:
        return (
          <div className="flex flex-col items-center justify-center py-6">
            <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden glass-card border border-white/20 shadow-2xl p-2 group">
              <img
                src={currentTrack.cover}
                alt={currentTrack.title}
                className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
              {is8DActive && (
                <div className="absolute top-4 right-4 bg-cyan-500/30 backdrop-blur-md border border-cyan-400/50 rounded-full px-3 py-1 text-[10px] font-bold text-cyan-300 flex items-center gap-1.5 shadow-lg">
                  <Compass className="w-3.5 h-3.5 animate-spin-slow" /> 8D ORBIT
                </div>
              )}
            </div>
            <div className="text-center mt-5">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">
                {currentTrack.title}
              </h2>
              <p className="text-sm font-semibold text-cyan-400 mt-1">
                {currentTrack.artist} — <span className="text-slate-400">{currentTrack.album}</span>
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen text-white relative flex flex-col justify-between overflow-x-hidden cyber-grid-bg">
      
      {/* BMW Cockpit High-Definition Driving Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/bmw_cockpit.webp"
          alt="BMW M Cockpit Background"
          className="w-full h-full object-cover filter brightness-90 saturate-110"
        />
        {/* Subtle Dark Glass Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 via-slate-950/30 to-slate-950/70" />
      </div>

      {/* Real Live Desktop Screen Capture Pass-Through (Car Windshield Glass Effect) */}
      {desktopStream && (
        <div className="fixed inset-0 z-10 overflow-hidden pointer-events-none">
          <video
            ref={(el) => {
              if (el && desktopStream) el.srcObject = desktopStream;
            }}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover opacity-85 filter brightness-110 saturate-120 scale-105"
          />
          {/* Car Windshield Reflection Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950/60 pointer-events-none" />
        </div>
      )}

      {/* Main App Navigation Header */}
      <Header
        currentTheme={uiTheme}
        onSelectTheme={setUiTheme}
        is8DActive={is8DActive}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        isDesktopGlassActive={Boolean(desktopStream)}
        onToggleDesktopGlass={handleToggleDesktopGlass}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 mb-28 relative z-10">
        
        {/* Tab 1: Main Player View */}
        {activeTab === 'player' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Visualizer Theme Card (7 Cols) */}
            <div className="lg:col-span-7 glass-panel rounded-3xl p-6 border border-cyan-500/20 shadow-2xl flex flex-col items-center justify-center min-h-[440px]">
              {renderVisualizerView()}
            </div>

            {/* Quick 8D Radar & Track Queue (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <Radar3DVisualizer
                is8DEnabled={is8DActive}
                onToggle8D={handleToggle8D}
              />

              {/* Next Track Preview */}
              <div className="glass-card p-4 rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Up Next ({activePlaylist.name})</span>
                  <h4 className="text-xs font-bold text-white truncate">
                    {activeTracks[(currentTrackIndex + 1) % activeTracks.length]?.title}
                  </h4>
                </div>
                <button
                  onClick={handleNextTrack}
                  className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-bold transition"
                >
                  Skip Next →
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: 8D Spatial Audio Controls */}
        {activeTab === '8d' && <Spatial8DPanel />}

        {/* Tab 3: Pro 10 & 15 Band Equalizer Controls */}
        {activeTab === 'eq' && <EqualizerPanel />}

        {/* Tab 4: Custom Playlist & Local Track Management */}
        {activeTab === 'playlist' && (
          <PlaylistPanel
            allTracks={allTracks}
            playlists={playlists}
            activePlaylistId={activePlaylistId}
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onSelectTrack={(track) => {
              const idx = activeTracks.findIndex((t) => t.id === track.id);
              if (idx !== -1) setCurrentTrackIndex(idx);
              setIsPlaying(true);
            }}
            onUploadTrack={handleUploadTrack}
            onCreatePlaylist={handleCreatePlaylist}
            onDeletePlaylist={handleDeletePlaylist}
            onSelectPlaylist={(plId) => {
              setActivePlaylistId(plId);
              setCurrentTrackIndex(0);
            }}
            onAddTrackToPlaylist={handleAddTrackToPlaylist}
            onRemoveTrackFromPlaylist={handleRemoveTrackFromPlaylist}
            onDeleteTrack={handleDeleteTrack}
          />
        )}

        {/* Tab 5: Synced Lyrics */}
        {activeTab === 'lyrics' && (
          <LyricsPanel lyrics={currentTrack.lyrics} currentTime={currentTime} />
        )}

      </main>

      {/* Bottom Sticky Player Controls Bar */}
      <PlayerControls
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        playbackSpeed={speed}
        isRepeat={isRepeat}
        isShuffle={isShuffle}
        is8DActive={is8DActive}
        onPlayPause={handlePlayPause}
        onPrev={handlePrevTrack}
        onNext={handleNextTrack}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
        onSpeedChange={handleSpeedChange}
        onToggleRepeat={() => setIsRepeat(!isRepeat)}
        onToggleShuffle={() => setIsShuffle(!isShuffle)}
        onToggle8D={handleToggle8D}
        onOpenEq={() => setActiveTab('eq')}
      />

    </div>
  );
}

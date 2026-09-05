import React, { useState } from 'react';
import { Music, Upload, Search, Radio, Trash2, Plus, FolderPlus, Sparkles, Heart, MoreVertical, Edit2 } from 'lucide-react';

export const PlaylistPanel = ({
  allTracks,
  playlists,
  activePlaylistId,
  currentTrack,
  isPlaying,
  onSelectTrack,
  onUploadTrack,
  onCreatePlaylist,
  onDeletePlaylist,
  onSelectPlaylist,
  onAddTrackToPlaylist,
  onRemoveTrackFromPlaylist,
  onDeleteTrack
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [addingTrackToPlaylistId, setAddingTrackToPlaylistId] = useState(null);

  const activePlaylist = playlists.find((p) => p.id === activePlaylistId) || playlists[0];

  // Get tracks belonging to current active playlist
  const currentPlaylistTracks = activePlaylist.id === 'all'
    ? allTracks
    : allTracks.filter((t) => activePlaylist.trackIds?.includes(t.id));

  const filteredTracks = currentPlaylistTracks.filter((track) =>
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|flac|aac|ogg|m4a)$/i)) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target.result;
          const newTrack = {
            id: `custom-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            title: file.name.replace(/\.[^/.]+$/, ''),
            artist: 'Local Computer Audio',
            album: 'Uploaded Tracks',
            duration: 'Local File',
            url: dataUrl,
            cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
            lyrics: [
              { time: 0, text: `🎵 Playing local file: ${file.name}` },
              { time: 5, text: "✦ 8D Spatial Panner & 15-Band EQ Engaged! ✦" }
            ]
          };
          onUploadTrack(newTrack, activePlaylistId);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleCreateSubmit = () => {
    if (!newPlaylistName.trim()) return;
    onCreatePlaylist(newPlaylistName.trim());
    setNewPlaylistName('');
    setIsCreateModalOpen(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left Sidebar: Playlists Manager (4 Cols) */}
      <div className="lg:col-span-4 glass-panel rounded-3xl p-5 border border-purple-500/30 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              MY PLAYLISTS
            </h3>
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition"
          >
            <Plus className="w-3.5 h-3.5" /> New Playlist
          </button>
        </div>

        {/* Playlists List */}
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          {playlists.map((pl) => {
            const isActive = pl.id === activePlaylistId;
            const trackCount = pl.id === 'all' ? allTracks.length : pl.trackIds?.length || 0;

            return (
              <div
                key={pl.id}
                onClick={() => onSelectPlaylist(pl.id)}
                className={`group flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-900/80 via-slate-900 to-slate-950 border-purple-500 text-white shadow-lg shadow-purple-500/20'
                    : 'glass-card border-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-lg">{pl.icon || '🎵'}</span>
                  <div className="min-w-0">
                    <h4 className={`text-xs font-bold truncate ${isActive ? 'text-purple-300' : 'text-white'}`}>
                      {pl.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {trackCount} {trackCount === 1 ? 'song' : 'songs'}
                    </p>
                  </div>
                </div>

                {/* Delete Custom Playlist (Cannot delete default 'all') */}
                {pl.id !== 'all' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePlaylist(pl.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition"
                    title="Delete playlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Active Playlist Track Queue & Uploader (8 Cols) */}
      <div className="lg:col-span-8 glass-panel rounded-3xl p-6 border border-cyan-500/30 shadow-2xl space-y-5">
        
        {/* Playlist Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{activePlaylist.icon || '🎶'}</span>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {activePlaylist.name}
                <span className="text-[10px] font-mono bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/40">
                  {currentPlaylistTracks.length} TRACKS
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {activePlaylist.description || 'Custom 8D spatial audio playlist'}
              </p>
            </div>
          </div>

          {/* Add Local Audio Button */}
          <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/30 transition">
            <Upload className="w-4 h-4" />
            <span>Add Local Audio</span>
            <input
              type="file"
              accept="audio/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tracks by title or artist..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/80 border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
          />
        </div>

        {/* Tracks List */}
        <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
          {filteredTracks.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No tracks in "{activePlaylist.name}"
            </div>
          ) : (
            filteredTracks.map((track, idx) => {
              const isCurrent = currentTrack?.id === track.id;

              return (
                <div
                  key={track.id}
                  onClick={() => onSelectTrack(track)}
                  className={`group flex items-center justify-between p-3 rounded-2xl border cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-gradient-to-r from-cyan-950/80 via-slate-900 to-slate-950 border-cyan-500/60 shadow-lg shadow-cyan-500/10'
                      : 'glass-card border-white/5 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-6 text-center font-mono text-xs font-bold text-slate-400 shrink-0">
                      {isCurrent ? (
                        <Radio className="w-4 h-4 text-cyan-400 animate-pulse mx-auto" />
                      ) : (
                        idx + 1
                      )}
                    </div>

                    <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-white/10">
                      <img src={track.cover} alt={track.title} className="w-full h-full object-cover" />
                      {isCurrent && isPlaying && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className={`text-xs font-bold truncate ${isCurrent ? 'text-cyan-300' : 'text-white'}`}>
                        {track.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {track.artist}
                      </p>
                    </div>
                  </div>

                  {/* Add to Playlist Selector & Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Add to specific Playlist dropdown */}
                    <div className="relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setAddingTrackToPlaylistId(addingTrackToPlaylistId === track.id ? null : track.id)}
                        className="px-2.5 py-1 rounded-xl glass-pill text-[10px] font-bold text-purple-300 hover:bg-purple-500/20 transition flex items-center gap-1"
                        title="Add to Playlist"
                      >
                        <Plus className="w-3 h-3" /> Add to Playlist
                      </button>

                      {/* Dropdown Menu */}
                      {addingTrackToPlaylistId === track.id && (
                        <div className="absolute right-0 top-8 z-30 w-48 glass-panel rounded-2xl p-2 border border-purple-500/40 shadow-2xl space-y-1">
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                            Select Playlist:
                          </div>
                          {playlists.filter((p) => p.id !== 'all').map((pl) => (
                            <button
                              key={pl.id}
                              onClick={() => {
                                onAddTrackToPlaylist(track.id, pl.id);
                                setAddingTrackToPlaylistId(null);
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-200 hover:bg-purple-600 hover:text-white transition flex items-center justify-between"
                            >
                              <span>{pl.icon} {pl.name}</span>
                              {pl.trackIds?.includes(track.id) && <span className="text-[10px] text-cyan-300 font-bold">✓ Added</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Remove from active playlist */}
                    {activePlaylist.id !== 'all' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveTrackFromPlaylist(track.id, activePlaylist.id);
                        }}
                        className="p-1.5 text-slate-500 hover:text-red-400 transition"
                        title="Remove from playlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Delete custom track */}
                    {track.id.startsWith('custom-') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTrack(track.id);
                        }}
                        className="p-1.5 text-slate-500 hover:text-red-400 transition"
                        title="Delete track"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create New Playlist Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="glass-panel p-6 rounded-3xl border border-purple-500/40 shadow-2xl max-w-md w-full space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FolderPlus className="w-5 h-5 text-purple-400" /> Create Custom Playlist
            </h3>
            <p className="text-xs text-slate-400">
              Enter a name for your custom 8D spatial music playlist.
            </p>
            <input
              type="text"
              placeholder="e.g. My 8D Cyberpunk Favorites"
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="w-full bg-slate-900 border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-400"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSubmit}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg"
              >
                Create Playlist
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

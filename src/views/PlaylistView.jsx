import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/utils/supabase';
import { apiFetch } from '@/utils/api';
import { usePlaylist } from '@/hooks/usePlaylist';
import SongTable from '@/components/SongTable';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

/**
 * Dynamic hero for the Playlist view.
 * Background: mosaic of artist images from songs in the active playlist
 * (falls back to a dark grid when the playlist is empty or none is selected).
 * Foreground: playlist title + scrolling marquee of song titles.
 *
 * @param {object} props
 * @param {object|null} props.currentPlaylist - Active playlist { name, songs[] }
 * @param {number} props.total - Total number of playlists for the subtitle
 * @param {Object.<number,string>} props.artistImageMap - artist id → image URL lookup
 */
function PlaylistHero({ currentPlaylist, total, artistImageMap }) {
  const songs = currentPlaylist?.songs ?? [];

  // Collect unique artist image URLs using the artistImageMap
  const seenIds = new Set();
  const images = songs.reduce((acc, s) => {
    const aid = s.artist?.artist_id ?? s.artist_id;
    if (aid && !seenIds.has(aid)) {
      seenIds.add(aid);
      const url = s.artist?.artist_image_url ?? artistImageMap[aid];
      if (url) acc.push(url);
    }
    return acc;
  }, []);

  // Shuffle unique images every time the selected playlist changes,
  // then pad to 12 tiles — remaining slots stay black.
  const tiles = useMemo(() => {
    const shuffled = [...images];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return Array.from({ length: 12 }, (_, i) => shuffled[i] ?? null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlaylist?.id]); // re-run only when the selected playlist changes

  // Marquee text: one copy (the flex container doubles it for seamless looping)
  const marqueeText = songs.length > 0
    ? songs.map((s) => s.title).join('   ·   ')
    : 'Select a playlist to begin   ·   Add songs from the browse view   ·   Build your collection';

  // Scale duration to text length so scroll speed stays consistent (~5px/s)
  const marqueeDuration = Math.max(8, Math.round(marqueeText.length * 0.18));

  return (
    <div className="relative h-48 -mx-6 overflow-hidden mb-8">
      {/* Mosaic background */}
      <div
        className="absolute inset-0 grid gap-0.5"
        style={{ gridTemplateColumns: 'repeat(12, 1fr)' }}
        aria-hidden="true"
      >
        {tiles.map((src, i) => (
          <div key={i} className="overflow-hidden bg-zinc-800 h-full">
            {src && (
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover transition-opacity duration-500"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />

      {/* Title — sits in the upper portion */}
      <div className="relative z-10 h-full flex flex-col justify-center px-6">
        <p className="text-xs font-semibold text-red-500 uppercase tracking-widest mb-2">
          {total} playlist{total !== 1 ? 's' : ''}
        </p>
        <h1 className="text-5xl font-black text-white tracking-tight leading-none">
          {currentPlaylist ? currentPlaylist.name : 'Playlists'}
        </h1>
      </div>

      {/* Scrolling marquee — pinned to bottom */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden border-t border-white/10 bg-black/50 py-1.5">
        <div
          className="flex w-max"
          style={{ animation: `playlist-marquee ${marqueeDuration}s linear infinite` }}
        >
          <span className="whitespace-nowrap text-xs text-white/40 tracking-widest uppercase pr-16">
            {marqueeText}
          </span>
          <span className="whitespace-nowrap text-xs text-white/40 tracking-widest uppercase pr-16">
            {marqueeText}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes playlist-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}

/**
 * Playlist management view (requires login).
 * Lists the user's playlists as clickable cards; the active playlist's
 * songs are shown in a full table below with remove buttons.
 *
 * @param {object} props
 * @param {object|null} props.currentPlaylist - Active playlist { id, name, songs[] }
 * @param {function} props.setCurrentPlaylist - Setter for playlist state in App
 */
function PlaylistView({ currentPlaylist, setCurrentPlaylist }) {
  const [playlists, setPlaylists] = useState([]);
  const [artistMap, setArtistMap] = useState({});
  const [artistImageMap, setArtistImageMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newName, setNewName] = useState('');

  const { removeSong } = usePlaylist(currentPlaylist, setCurrentPlaylist);
  const navigate = useNavigate();

  useEffect(() => {
    /**
     * Loads the user's playlists from Supabase and all artists from the Node API.
     * For each playlist, fetches song_ids then full song details from the Node API.
     */
    async function fetchData() {
      setLoading(true);
      try {
        const [{ data: playlistData, error: plErr }, allArtists] = await Promise.all([
          supabase.from('playlists').select('id, name, created_at').order('name'),
          apiFetch('/api/artists'),
        ]);

        if (plErr) throw new Error(plErr.message);

        setArtistMap(Object.fromEntries(allArtists.map((a) => [a.artist_id, a.artist_name])));
        setArtistImageMap(Object.fromEntries(allArtists.map((a) => [a.artist_id, a.artist_image_url]).filter(([, v]) => v)));

        const normalized = await Promise.all(
          playlistData.map(async (pl) => {
            const { data: pSongs } = await supabase
              .from('playlist_songs')
              .select('song_id')
              .eq('playlist_id', pl.id);

            const songIds = pSongs?.map((r) => r.song_id) ?? [];
            const songs = await Promise.all(songIds.map((sid) => apiFetch(`/api/songs/${sid}`)));
            return { ...pl, songs };
          })
        );

        setPlaylists(normalized);

        if (currentPlaylist) {
          const refreshed = normalized.find((p) => p.id === currentPlaylist.id);
          if (refreshed) setCurrentPlaylist(refreshed);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Creates a new playlist in Supabase for the authenticated user.
   */
  async function createPlaylist() {
    if (!newName.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error('You must be logged in to create a playlist.'); return; }

    const { data, error: err } = await supabase
      .from('playlists')
      .insert({ name: newName.trim(), user_id: user.id })
      .select()
      .single();

    if (err) { toast.error('Error creating playlist.'); return; }

    const newPlaylist = { ...data, songs: [] };
    setPlaylists((prev) => [...prev, newPlaylist].sort((a, b) => a.name.localeCompare(b.name)));
    setNewName('');
    toast.success(`Created "${newPlaylist.name}".`);
  }

  /**
   * Deletes a playlist from Supabase after a confirm guard.
   *
   * @param {object} playlist - Playlist to delete
   * @param {React.MouseEvent} e - Stopped so the row click doesn't fire
   */
  async function deletePlaylist(playlist, e) {
    e.stopPropagation();
    if (!window.confirm(`Delete "${playlist.name}"? This cannot be undone.`)) return;

    const { error: err } = await supabase.from('playlists').delete().eq('id', playlist.id);
    if (err) { toast.error('Error deleting playlist.'); return; }

    setPlaylists((prev) => prev.filter((p) => p.id !== playlist.id));
    if (currentPlaylist?.id === playlist.id) setCurrentPlaylist(null);
    toast.success(`Deleted "${playlist.name}".`);
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-red-700 p-4">Error: {error}</p>;

  return (
    <div>
      <Toaster position="bottom-right" />

      <PlaylistHero
        currentPlaylist={currentPlaylist}
        total={playlists.length}
        artistImageMap={artistImageMap}
      />

      {/* Two-column layout: playlist cards left, songs right */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 items-start mt-8">

        {/* ── Left: Playlist cards + create ── */}
        <div className="space-y-3">

          {playlists.length === 0 ? (
            <div className="border border-dashed border-zinc-300 p-8 text-center">
              <p className="text-zinc-400 text-sm">No playlists yet.</p>
              <p className="text-zinc-300 text-xs mt-1">Create one below to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {playlists.map((p, i) => {
                const isActive = currentPlaylist?.id === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setCurrentPlaylist(p)}
                    className={`group relative overflow-hidden cursor-pointer transition-colors border ${
                      isActive
                        ? 'border-zinc-900 bg-zinc-900'
                        : 'border-zinc-200 hover:border-zinc-400 bg-white'
                    }`}
                  >
                    {/* Large background number */}
                    <span
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-6xl font-black leading-none select-none pointer-events-none"
                      style={{ color: isActive ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <div className="relative flex items-center justify-between px-4 py-4">
                      <div className="min-w-0">
                        <p className={`font-bold text-sm truncate ${isActive ? 'text-white' : 'text-zinc-900'}`}>
                          {p.name}
                        </p>
                        <p className={`text-xs mt-0.5 ${isActive ? 'text-zinc-400' : 'text-zinc-400'}`}>
                          {p.songs.length} song{p.songs.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <button
                        onClick={(e) => deletePlaylist(p, e)}
                        className={`ml-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-xs px-2 py-1 ${
                          isActive ? 'text-zinc-500 hover:text-red-400' : 'text-zinc-300 hover:text-red-700'
                        }`}
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Create new */}
          <div className="pt-2 space-y-2">
            <Input
              placeholder="New playlist name…"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createPlaylist()}
              className="bg-white border-zinc-200 text-zinc-900 text-sm rounded-none h-9"
            />
            <button
              onClick={createPlaylist}
              className="w-full bg-zinc-900 hover:bg-red-700 text-white text-sm font-semibold py-2 transition-colors"
            >
              + Create Playlist
            </button>
          </div>
        </div>

        {/* ── Right: Active playlist songs ── */}
        <div className="min-h-96">
          {!currentPlaylist ? (
            <div className="border border-dashed border-zinc-300 p-12 text-center">
              <p className="text-zinc-400 text-sm">Select a playlist to view its songs.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border-b border-zinc-200 pb-3 flex items-center justify-between">
                <p className="text-xs text-zinc-400 uppercase tracking-widest">
                  {currentPlaylist.songs.length} song{currentPlaylist.songs.length !== 1 ? 's' : ''}
                </p>
                <button
                  onClick={() => navigate('/songs')}
                  className="text-xs font-semibold bg-zinc-900 hover:bg-red-700 text-white px-3 py-1.5 transition-colors"
                >
                  + Add Songs
                </button>
              </div>

              {currentPlaylist.songs.length === 0 ? (
                <div className="border border-dashed border-zinc-300 p-10 text-center space-y-3">
                  <p className="text-zinc-400 text-sm">No songs yet.</p>
                  <button
                    onClick={() => navigate('/songs')}
                    className="text-xs font-semibold bg-zinc-900 hover:bg-red-700 text-white px-4 py-2 transition-colors"
                  >
                    Browse Songs →
                  </button>
                </div>
              ) : (
                <SongTable
                  songs={currentPlaylist.songs}
                  artistMap={artistMap}
                  onRemove={removeSong}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlaylistView;

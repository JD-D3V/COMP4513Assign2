import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import { apiFetch } from '@/utils/api';
import { usePlaylist } from '@/hooks/usePlaylist';
import SongTable from '@/components/SongTable';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

/**
 * Playlist management view (requires login).
 * Lists the user's playlists with song counts; supports creating, selecting,
 * and deleting playlists. The active playlist's songs are shown below with
 * an option to remove individual songs.
 *
 * @param {object} props
 * @param {object|null} props.currentPlaylist - Active playlist { id, name, songs[] }
 * @param {function} props.setCurrentPlaylist - Setter for playlist state in App
 */
function PlaylistView({ currentPlaylist, setCurrentPlaylist }) {
  const [playlists, setPlaylists] = useState([]);
  const [artistMap, setArtistMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newName, setNewName] = useState('');

  const { removeSong } = usePlaylist(currentPlaylist, setCurrentPlaylist);

  useEffect(() => {
    /**
     * Loads the user's playlists from Supabase and all artists from the Node API.
     * For each playlist, fetches the song_ids from playlist_songs, then loads
     * full song details from the Node API.
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

        // For each playlist, fetch its song_ids, then fetch song details
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

        // Re-sync the active playlist if it exists in the refreshed data
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
   * Appends it to the local list on success.
   */
  async function createPlaylist() {
    if (!newName.trim()) return;
    const { data, error: err } = await supabase
      .from('playlists')
      .insert({ name: newName.trim() })
      .select()
      .single();

    if (err) { toast.error('Error creating playlist.'); return; }

    const newPlaylist = { ...data, songs: [] };
    setPlaylists((prev) => [...prev, newPlaylist].sort((a, b) => a.name.localeCompare(b.name)));
    setNewName('');
    toast.success(`Created "${newPlaylist.name}".`);
  }

  /**
   * Deletes a playlist from Supabase after a window.confirm() guard.
   * Clears the active playlist if it was the one deleted.
   *
   * @param {object} playlist - Playlist to delete
   * @param {React.MouseEvent} e - Click event (stopped to prevent row selection)
   */
  async function deletePlaylist(playlist, e) {
    e.stopPropagation();
    if (!window.confirm(`Delete playlist "${playlist.name}"? This cannot be undone.`)) return;

    const { error: err } = await supabase.from('playlists').delete().eq('id', playlist.id);
    if (err) { toast.error('Error deleting playlist.'); return; }

    setPlaylists((prev) => prev.filter((p) => p.id !== playlist.id));
    if (currentPlaylist?.id === playlist.id) setCurrentPlaylist(null);
    toast.success(`Deleted "${playlist.name}".`);
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-red-400 p-4">Error: {error}</p>;

  return (
    <div className="space-y-10">
      <Toaster richColors position="bottom-right" />

      <div className="border-b border-zinc-200 pb-4">
        <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Playlists</h1>
      </div>

      {/* ── Playlist list ── */}
      <section className="space-y-4">
        {playlists.length === 0 ? (
          <p className="text-slate-500 text-sm">No playlists yet. Create one below.</p>
        ) : (
          <div className="border border-zinc-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-200 hover:bg-transparent bg-zinc-50">
                  <TableHead className="text-zinc-500 font-semibold text-xs uppercase tracking-wider">Name</TableHead>
                  <TableHead className="text-zinc-500 font-semibold text-xs uppercase tracking-wider w-24 text-center">Songs</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {playlists.map((p) => (
                  <TableRow
                    key={p.id}
                    onClick={() => setCurrentPlaylist(p)}
                    className={`border-zinc-100 cursor-pointer ${
                      currentPlaylist?.id === p.id
                        ? 'bg-red-50'
                        : 'hover:bg-zinc-50'
                    }`}
                  >
                    <TableCell className={`font-medium ${currentPlaylist?.id === p.id ? 'text-red-700' : 'text-zinc-900'}`}>{p.name}</TableCell>
                    <TableCell className="text-center text-zinc-400">{p.songs.length}</TableCell>
                    <TableCell>
                      <button
                        className="text-zinc-300 hover:text-red-700 transition-colors text-lg leading-none"
                        onClick={(e) => deletePlaylist(p, e)}
                        title="Delete playlist"
                      >
                        −
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* ── Create new playlist ── */}
        <div className="flex gap-2 items-center max-w-sm">
          <Input
            placeholder="New playlist name…"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createPlaylist()}
            className="bg-white border-zinc-200 text-zinc-900 text-sm h-9 rounded-none"
          />
          <Button
            onClick={createPlaylist}
            className="bg-zinc-900 hover:bg-red-700 text-white h-9 px-4 flex-shrink-0 rounded-none transition-colors"
          >
            + Create
          </Button>
        </div>
      </section>

      {/* ── Active playlist songs ── */}
      {currentPlaylist && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-200">
            {currentPlaylist.name}
            <span className="ml-2 text-sm text-slate-500 font-normal">
              {currentPlaylist.songs.length} song{currentPlaylist.songs.length !== 1 ? 's' : ''}
            </span>
          </h2>

          {currentPlaylist.songs.length === 0 ? (
            <p className="text-slate-500 text-sm">
              No songs yet. Browse and hit + to add.
            </p>
          ) : (
            <SongTable
              songs={currentPlaylist.songs}
              artistMap={artistMap}
              onRemove={removeSong}
            />
          )}
        </section>
      )}
    </div>
  );
}

export default PlaylistView;

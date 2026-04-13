import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import SongTable from '../components/SongTable';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * Playlist management view (requires login).
 * Allows creating, selecting, viewing, and deleting playlists.
 * Songs can be removed from the active playlist.
 * Playlist data is persisted in Supabase.
 *
 * Props:
 *   currentPlaylist    - active playlist object { id, name, songs[] }
 *   setCurrentPlaylist - setter for playlist state
 */
function PlaylistView({ currentPlaylist, setCurrentPlaylist }) {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newName, setNewName] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchPlaylists();
  }, []);

  async function fetchPlaylists() {
    setLoading(true);
    const { data, error } = await supabase
      .from('playlists')
      .select('*, playlist_songs(song_id, songs(song_id, title, year, artist_id, artists(artist_name)))')
      .order('name');

    if (error) setError(error.message);
    else {
      const normalized = data.map(p => ({
        ...p,
        songs: p.playlist_songs?.map(ps => ps.songs) ?? [],
      }));
      setPlaylists(normalized);
    }
    setLoading(false);
  }

  async function createPlaylist() {
    if (!newName.trim()) return;
    const { data, error } = await supabase
      .from('playlists')
      .insert({ name: newName.trim() })
      .select()
      .single();

    if (error) { showToast('Error creating playlist.'); return; }
    const newPlaylist = { ...data, songs: [] };
    setPlaylists(prev => [...prev, newPlaylist]);
    setNewName('');
    showToast(`Created playlist "${newPlaylist.name}".`);
  }

  async function deletePlaylist(playlist) {
    const { error } = await supabase.from('playlists').delete().eq('id', playlist.id);
    if (error) { showToast('Error deleting playlist.'); return; }
    setPlaylists(prev => prev.filter(p => p.id !== playlist.id));
    if (currentPlaylist?.id === playlist.id) setCurrentPlaylist(null);
    showToast(`Deleted playlist "${playlist.name}".`);
  }

  async function removeSongFromPlaylist(song) {
    if (!currentPlaylist) return;
    const { error } = await supabase
      .from('playlist_songs')
      .delete()
      .eq('playlist_id', currentPlaylist.id)
      .eq('song_id', song.song_id);

    if (error) { showToast('Error removing song.'); return; }
    const updated = { ...currentPlaylist, songs: currentPlaylist.songs.filter(s => s.song_id !== song.song_id) };
    setCurrentPlaylist(updated);
    setPlaylists(prev => prev.map(p => p.id === updated.id ? updated : p));
    showToast(`Removed "${song.title}" from ${currentPlaylist.name}.`);
  }

  function selectPlaylist(playlist) {
    setCurrentPlaylist(playlist);
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div className="playlist-view">
      {toast && <div className="toast">{toast}</div>}

      <h1>Playlists</h1>

      <section className="playlist-list">
        <table className="song-table">
          <thead>
            <tr>
              <th>Name</th>
              <th># Songs</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {playlists.map(p => (
              <tr
                key={p.id}
                className={currentPlaylist?.id === p.id ? 'active-row' : ''}
                onClick={() => selectPlaylist(p)}
                style={{ cursor: 'pointer' }}
              >
                <td>{p.name}</td>
                <td>{p.songs.length}</td>
                <td>
                  <button
                    onClick={(e) => { e.stopPropagation(); deletePlaylist(p); }}
                    title="Delete playlist"
                  >
                    &#8722;
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="create-playlist">
        <label htmlFor="new-playlist-name"><strong>New Playlist Name</strong></label>
        <input
          id="new-playlist-name"
          type="text"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && createPlaylist()}
          placeholder="Playlist name..."
        />
        <button onClick={createPlaylist}>+</button>
      </section>

      {currentPlaylist && (
        <section className="current-playlist-songs">
          <h2>{currentPlaylist.name}</h2>
          <SongTable songs={currentPlaylist.songs} onRemove={removeSongFromPlaylist} />
        </section>
      )}
    </div>
  );
}

export default PlaylistView;

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import SongTable from '../components/SongTable';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * Single Genre detail view.
 * Shows genre name and all songs in that genre.
 *
 * Props:
 *   currentPlaylist    - active playlist object
 *   setCurrentPlaylist - setter for playlist state
 */
function SingleGenreView({ currentPlaylist, setCurrentPlaylist }) {
  const { id } = useParams();
  const [genre, setGenre] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    async function fetchGenre() {
      setLoading(true);
      const [genreRes, songsRes] = await Promise.all([
        supabase.from('genres').select('*').eq('genre_id', id).single(),
        supabase.from('songs').select('*, artists(artist_name)').eq('genre_id', id).order('title'),
      ]);

      if (genreRes.error) { setError(genreRes.error.message); setLoading(false); return; }
      setGenre(genreRes.data);
      setSongs(songsRes.data ?? []);
      setLoading(false);
    }
    fetchGenre();
  }, [id]);

  function handleAddToPlaylist(song) {
    if (!currentPlaylist) { showToast('No active playlist selected.'); return; }
    const already = currentPlaylist.songs?.some(s => s.song_id === song.song_id);
    if (already) { showToast(`"${song.title}" is already in the playlist.`); return; }
    setCurrentPlaylist(prev => ({ ...prev, songs: [...(prev.songs ?? []), song] }));
    showToast(`Added "${song.title}" to ${currentPlaylist.name}.`);
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="error">Error: {error}</p>;
  if (!genre) return null;

  return (
    <div className="single-genre-view">
      {toast && <div className="toast">{toast}</div>}

      <h1>{genre.genre_name}</h1>

      <section className="genre-songs">
        <h2>Songs in this genre</h2>
        <SongTable songs={songs} onAddToPlaylist={handleAddToPlaylist} />
      </section>
    </div>
  );
}

export default SingleGenreView;

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import SongTable from '../components/SongTable';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * Single Artist detail view.
 * Shows artist info, image, and a table of their songs.
 *
 * Props:
 *   currentPlaylist    - active playlist object
 *   setCurrentPlaylist - setter for playlist state
 */
function SingleArtistView({ currentPlaylist, setCurrentPlaylist }) {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    async function fetchArtist() {
      setLoading(true);
      const [artistRes, songsRes] = await Promise.all([
        supabase.from('artists').select('*').eq('artist_id', id).single(),
        supabase.from('songs').select('*, artists(artist_name)').eq('artist_id', id).order('year'),
      ]);

      if (artistRes.error) { setError(artistRes.error.message); setLoading(false); return; }
      setArtist(artistRes.data);
      setSongs(songsRes.data ?? []);
      setLoading(false);
    }
    fetchArtist();
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
  if (!artist) return null;

  return (
    <div className="single-artist-view">
      {toast && <div className="toast">{toast}</div>}

      <div className="artist-detail-header">
        {artist.image_url && (
          <img src={artist.image_url} alt={artist.artist_name} className="artist-detail-image" />
        )}
        <div className="artist-detail-info">
          <h1>{artist.artist_name}</h1>
          {artist.artist_type && <p><strong>Type:</strong> {artist.artist_type}</p>}
          {artist.description && <p>{artist.description}</p>}
          {artist.url && (
            <a href={artist.url} target="_blank" rel="noreferrer">{artist.url}</a>
          )}
        </div>
      </div>

      <section className="artist-songs">
        <h2>Songs</h2>
        <SongTable songs={songs} onAddToPlaylist={handleAddToPlaylist} />
      </section>
    </div>
  );
}

export default SingleArtistView;

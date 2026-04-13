import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';
import { supabase } from '../utils/supabase';
import SongTable from '../components/SongTable';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * Single Song detail view.
 * Shows song metadata, a radar chart of analytic values,
 * an Add to Playlist button, and a list of related songs.
 *
 * Props:
 *   currentPlaylist    - active playlist object
 *   setCurrentPlaylist - setter for playlist state
 */
function SingleSongView({ currentPlaylist, setCurrentPlaylist }) {
  const { id } = useParams();
  const [song, setSong] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    async function fetchSong() {
      setLoading(true);
      const { data, error } = await supabase
        .from('songs')
        .select('*, artists(artist_id, artist_name, image_url), genres(genre_name)')
        .eq('song_id', id)
        .single();

      if (error) { setError(error.message); setLoading(false); return; }
      setSong(data);

      // Fetch related songs: similar top-3 analytic attributes
      const top3 = getTop3(data);
      const { data: relatedData } = await supabase
        .from('songs')
        .select('*, artists(artist_name)')
        .neq('song_id', id)
        .limit(8);

      if (relatedData) {
        const scored = relatedData
          .map(s => ({ ...s, score: top3.reduce((acc, key) => acc + Math.abs((s[key] ?? 0) - (data[key] ?? 0)), 0) }))
          .sort((a, b) => a.score - b.score)
          .slice(0, 5);
        setRelated(scored);
      }
      setLoading(false);
    }
    fetchSong();
  }, [id]);

  function getTop3(song) {
    const attrs = ['danceability', 'energy', 'valence', 'acousticness', 'liveness', 'speechiness'];
    return attrs.sort((a, b) => (song[b] ?? 0) - (song[a] ?? 0)).slice(0, 3);
  }

  function handleAddToPlaylist() {
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
  if (!song) return null;

  const radarData = [
    { subject: 'Danceability', value: Math.round((song.danceability ?? 0) * 100) },
    { subject: 'Energy', value: Math.round((song.energy ?? 0) * 100) },
    { subject: 'Valence', value: Math.round((song.valence ?? 0) * 100) },
    { subject: 'Acousticness', value: Math.round((song.acousticness ?? 0) * 100) },
    { subject: 'Liveness', value: Math.round((song.liveness ?? 0) * 100) },
    { subject: 'Speechiness', value: Math.round((song.speechiness ?? 0) * 100) },
  ];

  return (
    <div className="single-song-view">
      {toast && <div className="toast">{toast}</div>}

      <h1>{song.title}</h1>

      <div className="song-detail-layout">
        <div className="song-meta">
          <p><strong>Artist:</strong> <Link to={`/artists/${song.artists?.artist_id}`}>{song.artists?.artist_name}</Link></p>
          <p><strong>Year:</strong> {song.year}</p>
          <p><strong>Genre:</strong> {song.genres?.genre_name}</p>
          <p><strong>BPM:</strong> {song.bpm}</p>
          <p><strong>Popularity:</strong> {song.popularity}</p>
          <p><strong>Loudness:</strong> {song.loudness} dB</p>

          <button onClick={handleAddToPlaylist} className="add-playlist-btn">+ Add to Playlist</button>
        </div>

        <div className="song-artist-image">
          {song.artists?.image_url && (
            <img src={song.artists.image_url} alt={song.artists.artist_name} />
          )}
        </div>

        <div className="song-radar">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" />
              <Radar dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {related.length > 0 && (
        <section className="related-songs">
          <h2>Related Songs</h2>
          <SongTable songs={related} onAddToPlaylist={(s) => {
            if (!currentPlaylist) { showToast('No active playlist selected.'); return; }
            setCurrentPlaylist(prev => ({ ...prev, songs: [...(prev.songs ?? []), s] }));
            showToast(`Added "${s.title}" to ${currentPlaylist.name}.`);
          }} />
        </section>
      )}
    </div>
  );
}

export default SingleSongView;

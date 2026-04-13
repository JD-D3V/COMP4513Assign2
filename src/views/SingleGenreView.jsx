import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '@/utils/api';
import SongTable from '@/components/SongTable';
import LoadingSpinner from '@/components/LoadingSpinner';
import { usePlaylist } from '@/hooks/usePlaylist';
import { Toaster } from '@/components/ui/sonner';

/**
 * Single Genre detail view.
 * Displays the genre name and a table of all songs in that genre.
 * Songs can be added to the active playlist.
 *
 * @param {object} props
 * @param {object|null} props.currentPlaylist - The currently selected playlist
 * @param {function} props.setCurrentPlaylist - Setter to update the active playlist
 */
function SingleGenreView({ currentPlaylist, setCurrentPlaylist }) {
  const { id } = useParams();
  const [genre, setGenre] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { addSong } = usePlaylist(currentPlaylist, setCurrentPlaylist);

  useEffect(() => {
    /**
     * Fetches all genres (to find the matching one) and songs for this genre in parallel.
     * Uses /api/genres and /api/songs/genre/:id endpoints.
     */
    async function fetchGenre() {
      setLoading(true);
      try {
        const [genres, songsData] = await Promise.all([
          apiFetch('/api/genres'),
          apiFetch(`/api/songs/genre/${id}`),
        ]);
        const found = genres.find((g) => String(g.genre_id) === String(id));
        setGenre(found ?? null);
        setSongs(Array.isArray(songsData) ? songsData : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchGenre();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-red-700 p-4">Error: {error}</p>;
  if (!genre) return <p className="text-zinc-400 p-4">Genre not found.</p>;

  return (
    <div className="space-y-10">
      <Toaster position="bottom-right" />

      <div className="border-b border-zinc-200 pb-6">
        <p className="text-xs font-semibold text-red-700 uppercase tracking-widest mb-2">Genre</p>
        <h1 className="text-5xl font-black text-zinc-900 tracking-tight">{genre.genre_name}</h1>
        <p className="text-zinc-400 text-sm mt-2">{songs.length} songs</p>
      </div>

      <section className="space-y-4">
        <SongTable songs={songs} onAddToPlaylist={addSong} />
      </section>
    </div>
  );
}

export default SingleGenreView;

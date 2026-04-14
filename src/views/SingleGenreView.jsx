import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '@/utils/api';
import SongTable from '@/components/SongTable';
import LoadingSpinner from '@/components/LoadingSpinner';
import HeroStrip from '@/components/HeroStrip';
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
  const [heroImages, setHeroImages] = useState([]);
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
        const [genres, songsData, artistData] = await Promise.all([
          apiFetch('/api/genres'),
          apiFetch(`/api/songs/genre/${id}`),
          apiFetch('/api/artists'),
        ]);
        const found = genres.find((g) => String(g.genre_id) === String(id));
        setGenre(found ?? null);
        const songList = Array.isArray(songsData) ? songsData : [];
        setSongs(songList);

        // Build hero images from artists whose songs appear in this genre
        const imageMap = Object.fromEntries(artistData.map((a) => [a.artist_id, a.artist_image_url]).filter(([, v]) => v));
        const uniqueIds = [...new Set(songList.map((s) => s.artist?.artist_id ?? s.artist_id).filter(Boolean))];
        setHeroImages(uniqueIds.map((aid) => imageMap[aid]).filter(Boolean));
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
    <div>
      <Toaster position="bottom-right" />

      <HeroStrip
        title={genre.genre_name}
        subtitle={`${songs.length} songs`}
        images={heroImages}
      />

      <section className="space-y-4">
        <SongTable songs={songs} onAddToPlaylist={addSong} />
      </section>
    </div>
  );
}

export default SingleGenreView;

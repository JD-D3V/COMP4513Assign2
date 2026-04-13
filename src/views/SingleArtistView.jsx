import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '@/utils/api';
import SongTable from '@/components/SongTable';
import LoadingSpinner from '@/components/LoadingSpinner';
import { usePlaylist } from '@/hooks/usePlaylist';
import { Toaster } from '@/components/ui/sonner';

/**
 * Single Artist detail view.
 * Displays artist metadata (image, name, type, description, URL) and a table
 * of all songs by that artist. Songs can be added to the active playlist.
 *
 * @param {object} props
 * @param {object|null} props.currentPlaylist - The currently selected playlist
 * @param {function} props.setCurrentPlaylist - Setter to update the active playlist
 */
function SingleArtistView({ currentPlaylist, setCurrentPlaylist }) {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { addSong } = usePlaylist(currentPlaylist, setCurrentPlaylist);

  useEffect(() => {
    /**
     * Fetches artist details and their songs in parallel.
     * Uses /api/artists/:id and /api/songs/artist/:id endpoints.
     */
    async function fetchArtist() {
      setLoading(true);
      try {
        const [artistData, songsData] = await Promise.all([
          apiFetch(`/api/artists/${id}`),
          apiFetch(`/api/songs/artist/${id}`),
        ]);
        setArtist(artistData);
        setSongs(Array.isArray(songsData) ? songsData : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchArtist();
  }, [id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-red-700 p-4">Error: {error}</p>;
  if (!artist) return null;

  return (
    <div className="space-y-10">
      <Toaster position="bottom-right" />

      {/* Artist header */}
      <div className="flex flex-col sm:flex-row gap-8 items-start border-b border-zinc-200 pb-10">
        <div className="w-48 h-48 flex-shrink-0 overflow-hidden bg-zinc-100">
          <img
            src={artist.artist_image_url || '/placeholder.svg'}
            alt={artist.artist_name}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.src = '/placeholder.svg'; }}
          />
        </div>
        <div className="space-y-2 pt-2">
          {artist.types?.type_name && (
            <p className="text-xs font-semibold text-red-700 uppercase tracking-widest">{artist.types.type_name}</p>
          )}
          <h1 className="text-5xl font-black text-zinc-900 leading-tight tracking-tight">{artist.artist_name}</h1>
          {artist.spotify_desc && (
            <p className="text-zinc-500 max-w-prose pt-2">{artist.spotify_desc}</p>
          )}
          {artist.spotify_url && (
            <a
              href={artist.spotify_url}
              target="_blank"
              rel="noreferrer"
              className="text-red-700 hover:underline text-sm inline-block pt-1"
            >
              {artist.spotify_url}
            </a>
          )}
        </div>
      </div>

      {/* Songs */}
      <section className="space-y-4">
        <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
          Songs — {songs.length} tracks
        </h2>
        <SongTable songs={songs} onAddToPlaylist={addSong} />
      </section>
    </div>
  );
}

export default SingleArtistView;

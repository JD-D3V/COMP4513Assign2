import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '@/utils/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import HeroStrip from '@/components/HeroStrip';

/**
 * Artists entry view.
 * Fetches all artists from the API and displays them in a responsive grid.
 * Each card links to the Single Artist view.
 */
function ArtistsView() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    /**
     * Fetches the full artist list from /api/artists and stores it in state.
     */
    async function fetchArtists() {
      try {
        const data = await apiFetch('/api/artists');
        setArtists(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchArtists();
  }, []);

  if (loading) return <LoadingSpinner variant="grid" />;
  if (error) return <p className="text-red-700 p-4">Error: {error}</p>;

  const heroImages = artists.map(a => a.artist_image_url).filter(Boolean);

  return (
    <div>
      <HeroStrip
        title="Artists"
        subtitle={`${artists.length} artists`}
        images={heroImages}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 space-y-0">
        {artists.map((artist) => (
          <Link
            key={artist.artist_id}
            to={`/artists/${artist.artist_id}`}
            className="group text-inherit visited:text-inherit no-underline"
          >
            <div className="aspect-square overflow-hidden bg-zinc-100 mb-2">
              <img
                src={artist.artist_image_url || '/placeholder.svg'}
                alt={artist.artist_name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { e.target.src = '/placeholder.svg'; }}
              />
            </div>
            <p className="text-sm font-medium text-zinc-800 group-hover:text-red-700 transition-colors line-clamp-2">
              {artist.artist_name}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ArtistsView;

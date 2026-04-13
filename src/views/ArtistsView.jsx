import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * Artists entry view.
 * Displays a grid of all artists with images and names.
 */
function ArtistsView() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchArtists() {
      const { data, error } = await supabase
        .from('artists')
        .select('artist_id, artist_name, image_url')
        .order('artist_name');

      if (error) setError(error.message);
      else setArtists(data);
      setLoading(false);
    }
    fetchArtists();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div className="artists-view">
      <h1>Artists</h1>
      <div className="card-grid">
        {artists.map((artist) => (
          <Link key={artist.artist_id} to={`/artists/${artist.artist_id}`} className="artist-card">
            <img
              src={artist.image_url || '/placeholder.png'}
              alt={artist.artist_name}
              className="artist-thumb"
              onError={(e) => { e.target.src = '/placeholder.png'; }}
            />
            <p>{artist.artist_name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default ArtistsView;

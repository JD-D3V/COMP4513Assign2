import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * Genres entry view.
 * Displays all genres as a navigable grid.
 */
function GenresView() {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchGenres() {
      const { data, error } = await supabase
        .from('genres')
        .select('genre_id, genre_name')
        .order('genre_name');

      if (error) setError(error.message);
      else setGenres(data);
      setLoading(false);
    }
    fetchGenres();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div className="genres-view">
      <h1>Genres</h1>
      <div className="card-grid">
        {genres.map((genre) => (
          <Link key={genre.genre_id} to={`/genres/${genre.genre_id}`} className="genre-card">
            <div className="genre-placeholder" />
            <p>{genre.genre_name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default GenresView;

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '@/utils/api';
import LoadingSpinner from '@/components/LoadingSpinner';

/**
 * Genres entry view.
 * Fetches all genres from the API and displays them as a navigable grid.
 * Each card links to the Single Genre view.
 */
function GenresView() {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    /**
     * Fetches the full genre list from /api/genres and stores it in state.
     */
    async function fetchGenres() {
      try {
        const data = await apiFetch('/api/genres');
        setGenres(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchGenres();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-red-700 p-4">Error: {error}</p>;

  return (
    <div className="space-y-8">
      <div className="border-b border-zinc-200 pb-4">
        <h1 className="text-4xl font-black text-zinc-900 tracking-tight">Genres</h1>
        <p className="text-zinc-400 text-sm mt-1">{genres.length} genres</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-px bg-zinc-200">
        {genres.map((genre) => (
          <Link
            key={genre.genre_id}
            to={`/genres/${genre.genre_id}`}
            className="bg-stone-50 hover:bg-white p-6 group transition-colors text-inherit visited:text-inherit no-underline"
          >
            <p className="text-3xl font-black text-zinc-200 group-hover:text-red-100 transition-colors mb-3 select-none uppercase">
              {genre.genre_name?.[0] ?? '?'}
            </p>
            <p className="text-sm font-medium text-zinc-800 group-hover:text-red-700 transition-colors capitalize">
              {genre.genre_name}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default GenresView;

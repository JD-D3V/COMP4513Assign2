import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '@/utils/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import HeroStrip from '@/components/HeroStrip';

/**
 * Genres entry view.
 * Fetches all genres from the API and displays them as a navigable grid.
 * Each card links to the Single Genre view.
 */
function GenresView() {
  const [genres, setGenres] = useState([]);
  const [heroImages, setHeroImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shuffleKey, setShuffleKey] = useState(0);

  useEffect(() => {
    function handle() { setShuffleKey((k) => k + 1); }
    window.addEventListener('genres-reshuffle', handle);
    return () => window.removeEventListener('genres-reshuffle', handle);
  }, []);

  useEffect(() => {
    /**
     * Fetches genres and a sample of artist images for the hero strip in parallel.
     * Genres have no images so artist images are used for the mosaic background.
     */
    async function fetchGenres() {
      try {
        const [genreData, artistData] = await Promise.all([
          apiFetch('/api/genres'),
          apiFetch('/api/artists'),
        ]);
        setGenres(genreData);
        setHeroImages(artistData.map(a => a.artist_image_url).filter(Boolean));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchGenres();
  }, []);

  if (loading) return <LoadingSpinner variant="grid" />;
  if (error) return <p className="text-red-700 p-4">Error: {error}</p>;

  return (
    <div>
      <HeroStrip
        title="Genres"
        subtitle={`${genres.length} genres`}
        images={heroImages}
        shuffleKey={shuffleKey}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {genres.map((genre, i) => {
          const palettes = [
            'from-red-800 to-red-600',
            'from-zinc-800 to-zinc-600',
            'from-rose-700 to-pink-500',
            'from-orange-700 to-amber-500',
            'from-stone-700 to-stone-500',
            'from-red-900 to-rose-700',
            'from-zinc-700 to-zinc-500',
            'from-neutral-800 to-neutral-600',
            'from-red-700 to-orange-500',
            'from-slate-700 to-slate-500',
          ];
          const palette = palettes[i % palettes.length];
          return (
            <Link
              key={genre.genre_id}
              to={`/genres/${genre.genre_id}`}
              className={`relative overflow-hidden aspect-square bg-gradient-to-br ${palette} group flex flex-col justify-between p-5 no-underline`}
            >
              {/* Giant letter watermark */}
              <p className="text-8xl font-black select-none leading-none opacity-20 uppercase" style={{ color: '#ffffff' }}>
                {genre.genre_name?.[0] ?? '?'}
              </p>
              {/* Genre name at bottom */}
              <p className="text-sm font-bold uppercase tracking-wider group-hover:opacity-80 transition-opacity" style={{ color: '#ffffff' }}>
                {genre.genre_name}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default GenresView;

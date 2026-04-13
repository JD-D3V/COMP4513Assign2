import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '@/utils/api';

/**
 * Landing page / Home view.
 * Editorial-style layout: large typography hero, live stat counters,
 * and a featured artists row.
 */
function HomeView() {
  const [stats, setStats] = useState({ artists: 0, genres: 0, songs: 0 });
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    /**
     * Fetches artists, genres, and songs in parallel.
     * Computes stat totals and randomly selects 6 featured artists.
     */
    async function fetchData() {
      try {
        const [artists, genres, songs] = await Promise.all([
          apiFetch('/api/artists'),
          apiFetch('/api/genres'),
          apiFetch('/api/songs'),
        ]);

        setStats({ artists: artists.length, genres: genres.length, songs: songs.length });

        const shuffled = [...artists];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setFeatured(shuffled.slice(0, 6));
      } catch {
        // Non-critical — page still renders without data
      }
    }
    fetchData();
  }, []);

  return (
    <div className="space-y-16">

      {/* ── Hero ── */}
      <section className="border-b border-zinc-200 pb-12">
        <p className="text-xs font-semibold text-red-700 uppercase tracking-widest mb-4">
          COMP 4513 — Music Browser
        </p>
        <h1 className="text-6xl md:text-8xl font-black text-zinc-900 leading-none tracking-tight mb-6">
          Discover<br />Music.
        </h1>
        <p className="text-zinc-500 text-lg max-w-lg mb-8">
          Browse artists, genres, and songs. Explore audio profiles. Build playlists.
        </p>
        <Link
          to="/songs"
          className="inline-block bg-zinc-900 hover:bg-zinc-700 text-white text-sm font-semibold px-6 py-3 transition-colors"
        >
          Browse Songs →
        </Link>
      </section>

      {/* ── Stat counters ── */}
      <section className="grid grid-cols-3 gap-0 border border-zinc-200 divide-x divide-zinc-200">
        {[
          { label: 'Artists', value: stats.artists, to: '/artists' },
          { label: 'Genres', value: stats.genres, to: '/genres' },
          { label: 'Songs', value: stats.songs, to: '/songs' },
        ].map(({ label, value, to }) => (
          <Link
            key={label}
            to={to}
            className="p-8 text-center hover:bg-zinc-50 transition-colors group"
          >
            <p className="text-5xl font-black text-zinc-900 group-hover:text-red-700 transition-colors">
              {value > 0 ? value.toLocaleString() : '—'}
            </p>
            <p className="text-zinc-400 text-sm uppercase tracking-wider mt-2">{label}</p>
          </Link>
        ))}
      </section>

      {/* ── Featured Artists ── */}
      {featured.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-baseline justify-between border-b border-zinc-200 pb-3">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Featured Artists</h2>
            <Link to="/artists" className="text-xs text-red-700 hover:underline">View all →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {featured.map((artist) => (
              <Link
                key={artist.artist_id}
                to={`/artists/${artist.artist_id}`}
                className="group"
              >
                <div className="aspect-square overflow-hidden bg-zinc-100 mb-2">
                  {artist.artist_image_url ? (
                    <img
                      src={artist.artist_image_url}
                      alt={artist.artist_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.src = '/placeholder.svg'; }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300 text-xs">
                      No image
                    </div>
                  )}
                </div>
                <p className="text-xs text-zinc-700 truncate group-hover:text-red-700 transition-colors">
                  {artist.artist_name}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Browse cards ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-px bg-zinc-200">
        {[
          { to: '/artists', title: 'Artists', desc: 'Explore artists and their discographies.' },
          { to: '/genres', title: 'Genres', desc: 'Browse music by genre.' },
          { to: '/songs', title: 'Songs', desc: 'Search and filter the full catalogue.' },
        ].map(({ to, title, desc }) => (
          <Link
            key={title}
            to={to}
            className="bg-stone-50 hover:bg-white p-8 transition-colors group"
          >
            <h3 className="text-lg font-bold text-zinc-900 group-hover:text-red-700 transition-colors mb-1">
              {title}
            </h3>
            <p className="text-zinc-400 text-sm">{desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}

export default HomeView;

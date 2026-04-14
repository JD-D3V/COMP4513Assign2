import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '@/utils/api';

/**
 * Landing page — full-viewport mosaic of artist images as background.
 * A dark gradient overlay sits on top, with hero text, live stats, and nav buttons.
 * Uses negative margins to break out of the parent max-w-7xl container.
 */
function HomeView() {
  const [stats, setStats] = useState({ artists: 0, genres: 0, songs: 0 });
  const [artists, setArtists] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const [artistData, genres, songs] = await Promise.all([
          apiFetch('/api/artists'),
          apiFetch('/api/genres'),
          apiFetch('/api/songs'),
        ]);
        setStats({ artists: artistData.length, genres: genres.length, songs: songs.length });
        // Shuffle so mosaic is different each visit
        const shuffled = [...artistData];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        setArtists(shuffled);
      } catch {
        // Page still renders without data
      }
    }
    fetchData();
  }, []);

  return (
    // Break out of parent px-6 py-10 and max-w-7xl to go full viewport
    <div className="relative -mx-6 -my-10 h-[calc(100vh-3.5rem)] overflow-hidden">

      {/* ── Mosaic background ── */}
      <div
        className="absolute inset-0 grid gap-0.5"
        style={{ gridTemplateColumns: 'repeat(10, 1fr)', gridTemplateRows: 'repeat(5, 1fr)' }}
        aria-hidden="true"
      >
        {Array.from({ length: 50 }).map((_, i) => {
          const artist = artists[i % artists.length];
          return (
            <div key={i} className="overflow-hidden bg-zinc-800">
              {artist?.artist_image_url && (
                <img
                  src={artist.artist_image_url}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Dark gradient overlay ── */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/50" />

      {/* ── Foreground content ── */}
      <div className="relative z-10 h-full flex flex-col justify-end pb-16 px-10 max-w-7xl mx-auto">

        {/* Hero text */}
        <p className="text-xs font-semibold text-red-500 uppercase tracking-widest mb-3">
          COMP 4513 · Music Browser
        </p>
        <h1 className="text-7xl md:text-9xl font-black leading-none tracking-tight mb-4"
          style={{ color: '#ffffff' }}>
          Discover<br />Music.
        </h1>
        <p className="text-lg mb-10 max-w-lg" style={{ color: 'rgba(255,255,255,0.6)' }}>
          Browse artists, genres, and songs. Explore audio profiles. Build playlists.
        </p>

        {/* Stats + nav row */}
        <div className="flex flex-wrap items-end gap-6">

          {/* Stat blocks */}
          {[
            { label: 'Artists', value: stats.artists, to: '/artists' },
            { label: 'Genres',  value: stats.genres,  to: '/genres'  },
            { label: 'Songs',   value: stats.songs,   to: '/songs'   },
          ].map(({ label, value, to }) => (
            <Link
              key={label}
              to={to}
              className="group text-center px-6 py-4 border border-white/20 hover:border-red-500 hover:bg-red-500/10 transition-all"
            >
              <p className="text-4xl font-black" style={{ color: '#ffffff' }}>
                {value > 0 ? value.toLocaleString() : '—'}
              </p>
              <p className="text-xs uppercase tracking-widest mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                {label}
              </p>
            </Link>
          ))}

          {/* Divider */}
          <div className="hidden md:block w-px h-16 bg-white/20 mx-2" />

          {/* Browse buttons */}
          <div className="flex gap-3">
            <Link
              to="/songs"
              className="px-6 py-3 text-sm font-semibold transition-colors"
              style={{ backgroundColor: '#ffffff', color: '#09090b' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#b91c1c'; e.currentTarget.style.color = '#ffffff'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#ffffff'; e.currentTarget.style.color = '#09090b'; }}
            >
              Browse Songs →
            </Link>
            <Link
              to="/artists"
              className="px-6 py-3 text-sm font-semibold border border-white/40 hover:border-white transition-colors"
              style={{ color: '#ffffff' }}
            >
              Artists
            </Link>
            <Link
              to="/playlists"
              className="px-6 py-3 text-sm font-semibold border border-white/40 hover:border-white transition-colors"
              style={{ color: '#ffffff' }}
            >
              Playlists
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeView;

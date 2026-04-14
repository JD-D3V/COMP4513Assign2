import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '@/utils/api';

// Module-level cache — raw artist list fetched once, never re-fetched
let _rawArtists = [];
let _cachedStats = { artists: 0, genres: 0, songs: 0 };
let _nextShuffle = []; // pre-computed shuffle ready for the next Home visit
let _statsAnimated = false; // ensures the count-up only ever runs once per session

/**
 * Animates stat counters from 0 to their target values using requestAnimationFrame.
 * Uses an ease-out cubic curve so numbers accelerate then settle.
 * Sets _statsAnimated = true when done so re-visits skip the animation.
 *
 * @param {object} target - { artists, genres, songs } final values
 * @param {function} setter - React state setter for display stats
 */
function animateStats(target, setter) {
  const DURATION = 1400;
  const start = performance.now();
  function step(now) {
    const t = Math.min((now - start) / DURATION, 1);
    const ease = 1 - Math.pow(1 - t, 3); // ease-out cubic
    setter({
      artists: Math.round(target.artists * ease),
      genres:  Math.round(target.genres  * ease),
      songs:   Math.round(target.songs   * ease),
    });
    if (t < 1) requestAnimationFrame(step);
    else _statsAnimated = true;
  }
  requestAnimationFrame(step);
}

/** Fisher-Yates shuffle — returns a new array */
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Landing page — full-viewport mosaic of artist images as background.
 * A dark gradient overlay sits on top, with hero text, live stats, and nav buttons.
 * Uses negative margins to break out of the parent max-w-7xl container.
 * Back-buffers the next shuffle so every Home visit is instant with a fresh mosaic.
 */
function HomeView() {
  // On return visits skip the animation entirely — show real values immediately
  const navigate = useNavigate();
  const [displayStats, setDisplayStats] = useState(() =>
    _statsAnimated ? _cachedStats : { artists: 0, genres: 0, songs: 0 }
  );
  // Use the pre-buffered shuffle immediately if available — zero flicker on return visits
  const [artists, setArtists] = useState(() => _nextShuffle.length > 0 ? _nextShuffle : _rawArtists);

  /** Navigates to a random artist from the cached list. */
  function surpriseMe() {
    if (_rawArtists.length === 0) return;
    const pick = _rawArtists[Math.floor(Math.random() * _rawArtists.length)];
    navigate(`/artists/${pick.artist_id}`);
  }

  useEffect(() => {
    if (_rawArtists.length > 0) {
      // Data already loaded — swap in the pre-buffered shuffle, then pre-compute the next one
      const current = _nextShuffle.length > 0 ? _nextShuffle : shuffleArray(_rawArtists);
      setArtists(current);
      _nextShuffle = shuffleArray(_rawArtists); // ready for the visit after this one
      return;
    }

    async function fetchData() {
      try {
        const [artistData, genres, songs] = await Promise.all([
          apiFetch('/api/artists'),
          apiFetch('/api/genres'),
          apiFetch('/api/songs'),
        ]);
        _cachedStats = { artists: artistData.length, genres: genres.length, songs: songs.length };
        _rawArtists = artistData;
        const first = shuffleArray(_rawArtists);
        _nextShuffle = shuffleArray(_rawArtists); // pre-compute for next visit
        setArtists(first);
        animateStats(_cachedStats, setDisplayStats); // count up from 0 — first visit only
      } catch {
        // Page still renders without data
      }
    }
    fetchData();
  }, []);

  // Listen for Home nav clicks while already on the home page — swap in the pre-buffered shuffle
  useEffect(() => {
    function handleReshuffle() {
      if (_rawArtists.length === 0) return;
      const next = _nextShuffle.length > 0 ? _nextShuffle : shuffleArray(_rawArtists);
      setArtists(next);
      _nextShuffle = shuffleArray(_rawArtists);
    }
    window.addEventListener('home-reshuffle', handleReshuffle);
    return () => window.removeEventListener('home-reshuffle', handleReshuffle);
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
            { label: 'Artists', value: displayStats.artists, to: '/artists' },
            { label: 'Genres',  value: displayStats.genres,  to: '/genres'  },
            { label: 'Songs',   value: displayStats.songs,   to: '/songs'   },
          ].map(({ label, value, to }) => (
            <Link
              key={label}
              to={to}
              className="group text-center px-6 py-4 border border-white/20 hover:border-red-500 hover:bg-red-500/10 transition-all w-28"
            >
              <p className="text-4xl font-black tabular-nums" style={{ color: '#ffffff' }}>
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
            <button
              onClick={surpriseMe}
              className="px-6 py-3 text-sm font-semibold border border-red-500/60 hover:border-red-500 hover:bg-red-500/10 transition-colors"
              style={{ color: '#f87171' }}
            >
              Surprise Me →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeView;

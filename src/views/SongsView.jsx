import { useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import SongTable from '../components/SongTable';
import LoadingSpinner from '../components/LoadingSpinner';

/**
 * Browse / Songs view.
 * Supports filtering by title (text), year (multi-select), artist, and genre.
 * Filters are additive (AND). Active filters shown as removable chips.
 * Supports sorting by title, year, or artist name.
 *
 * Props:
 *   currentPlaylist    - active playlist object
 *   setCurrentPlaylist - setter for playlist state
 */
function SongsView({ currentPlaylist, setCurrentPlaylist }) {
  const [allSongs, setAllSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [titleFilter, setTitleFilter] = useState('');
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [sortBy, setSortBy] = useState('title');

  // Derived option lists
  const [years, setYears] = useState([]);
  const [artists, setArtists] = useState([]);
  const [genres, setGenres] = useState([]);

  const [toast, setToast] = useState('');

  useEffect(() => {
    async function fetchData() {
      const [songsRes, artistsRes, genresRes] = await Promise.all([
        supabase.from('songs').select('*, artists(artist_name), genres(genre_name)'),
        supabase.from('artists').select('artist_id, artist_name').order('artist_name'),
        supabase.from('genres').select('genre_id, genre_name').order('genre_name'),
      ]);

      if (songsRes.error) { setError(songsRes.error.message); setLoading(false); return; }

      setAllSongs(songsRes.data);
      setYears([...new Set(songsRes.data.map(s => s.year))].sort());
      setArtists(artistsRes.data ?? []);
      setGenres(genresRes.data ?? []);
      setLoading(false);
    }
    fetchData();
  }, []);

  // --- Filtering ---
  const filteredSongs = allSongs
    .filter(s => !titleFilter || s.title.toLowerCase().includes(titleFilter.toLowerCase()))
    .filter(s => selectedYears.length === 0 || selectedYears.includes(s.year))
    .filter(s => selectedArtists.length === 0 || selectedArtists.includes(s.artist_id))
    .filter(s => selectedGenres.length === 0 || selectedGenres.includes(s.genre_id))
    .sort((a, b) => {
      if (sortBy === 'year') return a.year - b.year;
      if (sortBy === 'artist') return (a.artists?.artist_name ?? '').localeCompare(b.artists?.artist_name ?? '');
      return a.title.localeCompare(b.title);
    });

  function toggleYear(year) {
    setSelectedYears(prev => prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]);
  }
  function toggleArtist(id) {
    setSelectedArtists(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  }
  function toggleGenre(id) {
    setSelectedGenres(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  }
  function clearAll() {
    setTitleFilter('');
    setSelectedYears([]);
    setSelectedArtists([]);
    setSelectedGenres([]);
  }

  function handleAddToPlaylist(song) {
    if (!currentPlaylist) {
      showToast('No active playlist selected.');
      return;
    }
    const already = currentPlaylist.songs?.some(s => s.song_id === song.song_id);
    if (already) { showToast(`"${song.title}" is already in the playlist.`); return; }
    setCurrentPlaylist(prev => ({ ...prev, songs: [...(prev.songs ?? []), song] }));
    showToast(`Added "${song.title}" to ${currentPlaylist.name}.`);
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="error">Error: {error}</p>;

  const activeChips = [
    ...selectedYears.map(y => ({ label: String(y), remove: () => toggleYear(y) })),
    ...selectedArtists.map(id => {
      const a = artists.find(a => a.artist_id === id);
      return { label: a?.artist_name ?? id, remove: () => toggleArtist(id) };
    }),
    ...selectedGenres.map(id => {
      const g = genres.find(g => g.genre_id === id);
      return { label: g?.genre_name ?? id, remove: () => toggleGenre(id) };
    }),
  ];

  return (
    <div className="songs-view">
      {toast && <div className="toast">{toast}</div>}

      <div className="songs-layout">
        {/* Filters sidebar */}
        <aside className="filters-panel">
          <h2>Filters</h2>

          <details open>
            <summary>Title</summary>
            <input
              type="text"
              placeholder="Search title..."
              value={titleFilter}
              onChange={e => setTitleFilter(e.target.value)}
            />
          </details>

          <details open>
            <summary>Years</summary>
            {years.map(y => (
              <label key={y} className="filter-checkbox">
                <input type="checkbox" checked={selectedYears.includes(y)} onChange={() => toggleYear(y)} />
                {y}
              </label>
            ))}
          </details>

          <details>
            <summary>Artists</summary>
            {artists.map(a => (
              <label key={a.artist_id} className="filter-checkbox">
                <input type="checkbox" checked={selectedArtists.includes(a.artist_id)} onChange={() => toggleArtist(a.artist_id)} />
                {a.artist_name}
              </label>
            ))}
          </details>

          <details>
            <summary>Genres</summary>
            {genres.map(g => (
              <label key={g.genre_id} className="filter-checkbox">
                <input type="checkbox" checked={selectedGenres.includes(g.genre_id)} onChange={() => toggleGenre(g.genre_id)} />
                {g.genre_name}
              </label>
            ))}
          </details>
        </aside>

        {/* Results area */}
        <section className="songs-results">
          <div className="results-toolbar">
            <div className="active-chips">
              {activeChips.map((chip, i) => (
                <span key={i} className="chip">
                  {chip.label}
                  <button onClick={chip.remove} aria-label={`Remove ${chip.label} filter`}>&#x2715;</button>
                </span>
              ))}
              {activeChips.length > 0 && (
                <button onClick={clearAll} className="clear-all">&#x2715; Clear All</button>
              )}
            </div>
            <div className="sort-control">
              <label htmlFor="sort-select">Sort</label>
              <select id="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="title">Title</option>
                <option value="year">Year</option>
                <option value="artist">Artist</option>
              </select>
            </div>
          </div>

          <p className="result-count">{filteredSongs.length} result{filteredSongs.length !== 1 ? 's' : ''}</p>

          <SongTable songs={filteredSongs} onAddToPlaylist={handleAddToPlaylist} />
        </section>
      </div>
    </div>
  );
}

export default SongsView;

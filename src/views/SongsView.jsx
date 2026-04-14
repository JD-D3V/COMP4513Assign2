import { useEffect, useState, useMemo } from 'react';
import { apiFetch } from '@/utils/api';
import SongTable from '@/components/SongTable';
import LoadingSpinner from '@/components/LoadingSpinner';
import HeroStrip from '@/components/HeroStrip';
import { usePlaylist } from '@/hooks/usePlaylist';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';

/**
 * Browse / Songs view — the heart of the assignment.
 * Supports additive AND filtering by title, year, artist, and genre.
 * Active filters are shown as removable chips. Results can be sorted
 * by title (default), year, or artist name.
 *
 * @param {object} props
 * @param {object|null} props.currentPlaylist - The currently selected playlist
 * @param {function} props.setCurrentPlaylist - Setter to update the active playlist
 */
function SongsView({ currentPlaylist, setCurrentPlaylist }) {
  const [allSongs, setAllSongs] = useState([]);
  const [artists, setArtists] = useState([]);
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter state
  const [titleFilter, setTitleFilter] = useState('');
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedArtists, setSelectedArtists] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [sortBy, setSortBy] = useState('title');

  const { addSong } = usePlaylist(currentPlaylist, setCurrentPlaylist);

  useEffect(() => {
    /**
     * Fetches songs, artists, and genres in parallel on mount.
     * Builds lookup maps so artist/genre names can be resolved from IDs.
     */
    async function fetchData() {
      try {
        const [songs, artistList, genreList] = await Promise.all([
          apiFetch('/api/songs'),
          apiFetch('/api/artists'),
          apiFetch('/api/genres'),
        ]);
        setAllSongs(songs);
        setArtists(artistList);
        setGenres(genreList);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  /** Lookup map: artist id → artist name. Built once when artists are fetched. */
  const artistMap = useMemo(
    () => Object.fromEntries(artists.map((a) => [a.artist_id, a.artist_name])),
    [artists]
  );

  /** Unique sorted years derived from the full song list. */
  const years = useMemo(
    () => [...new Set(allSongs.map((s) => Number(s.year)))].sort((a, b) => a - b),
    [allSongs]
  );

  /**
   * Applies all active filters (additive AND) and the current sort order
   * to produce the displayed song list.
   */
  const filteredSongs = useMemo(() => {
    return allSongs
      .filter((s) => !titleFilter || s.title.toLowerCase().includes(titleFilter.toLowerCase()))
      .filter((s) => selectedYears.length === 0 || selectedYears.includes(Number(s.year)))
      .filter((s) => selectedArtists.length === 0 || selectedArtists.includes(s.artist?.artist_id ?? s.artist_id))
      .filter((s) => selectedGenres.length === 0 || selectedGenres.includes(s.genre?.genre_id ?? s.genre_id))
      .sort((a, b) => {
        if (sortBy === 'year') return Number(a.year) - Number(b.year);
        if (sortBy === 'artist') return (a.artist?.artist_name ?? artistMap[a.artist_id] ?? '').localeCompare(b.artist?.artist_name ?? artistMap[b.artist_id] ?? '');
        return a.title.localeCompare(b.title);
      });
  }, [allSongs, titleFilter, selectedYears, selectedArtists, selectedGenres, sortBy, artistMap]);

  /** Toggles a year in/out of the selected years filter. */
  function toggleYear(year) {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  }

  /** Toggles an artist id in/out of the selected artists filter. */
  function toggleArtist(id) {
    setSelectedArtists((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  }

  /** Toggles a genre id in/out of the selected genres filter. */
  function toggleGenre(id) {
    setSelectedGenres((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  }

  /** Clears all active filters and resets the title search input. */
  function clearAll() {
    setTitleFilter('');
    setSelectedYears([]);
    setSelectedArtists([]);
    setSelectedGenres([]);
  }

  /** Active filter chips derived from current filter state. */
  const activeChips = [
    ...(titleFilter ? [{ label: `"${titleFilter}"`, remove: () => setTitleFilter('') }] : []),
    ...selectedYears.map((y) => ({ label: String(y), remove: () => toggleYear(y) })),
    ...selectedArtists.map((id) => ({
      label: artistMap[id] ?? String(id),
      remove: () => toggleArtist(id),
    })),
    ...selectedGenres.map((id) => {
      const g = genres.find((g) => g.genre_id === id);
      return { label: g?.genre_name ?? String(id), remove: () => toggleGenre(id) };
    }),
  ];

  const heroImages = useMemo(
    () => artists.map((a) => a.artist_image_url).filter(Boolean),
    [artists]
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-red-700 p-4">Error: {error}</p>;

  return (
    <div>
      <Toaster position="bottom-right" />

      <HeroStrip
        title="Songs"
        subtitle={`${allSongs.length} tracks · filter, sort, add to playlist`}
        images={heroImages}
      />

      <div className="flex gap-0">
        {/* ── Filter sidebar — dark inverted panel ── */}
        <aside className="w-56 flex-shrink-0 self-start sticky top-14 bg-zinc-900 text-white p-5 space-y-6 -ml-6 min-h-[calc(100vh-3.5rem)]">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Filters</p>

          {/* Title */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Title</p>
            <Input
              placeholder="Search…"
              value={titleFilter}
              onChange={(e) => setTitleFilter(e.target.value)}
              className="bg-zinc-800 border-zinc-700 text-white text-sm h-8 placeholder:text-zinc-500 rounded-none"
            />
          </div>

          {/* Years */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Year</p>
            <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
              {years.map((y) => (
                <label key={y} className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer hover:text-white py-0.5">
                  <input type="checkbox" className="accent-red-500" checked={selectedYears.includes(y)} onChange={() => toggleYear(y)} />
                  {y}
                </label>
              ))}
            </div>
          </div>

          {/* Artists */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Artist</p>
            <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
              {artists.map((a) => (
                <label key={a.artist_id} className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer hover:text-white py-0.5">
                  <input type="checkbox" className="accent-red-500" checked={selectedArtists.includes(a.artist_id)} onChange={() => toggleArtist(a.artist_id)} />
                  {a.artist_name}
                </label>
              ))}
            </div>
          </div>

          {/* Genres */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Genre</p>
            <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
              {genres.map((g) => (
                <label key={g.genre_id} className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer hover:text-white py-0.5">
                  <input type="checkbox" className="accent-red-500" checked={selectedGenres.includes(g.genre_id)} onChange={() => toggleGenre(g.genre_id)} />
                  {g.genre_name}
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* ── Results area ── */}
        <section className="flex-1 min-w-0 space-y-4 pl-8 pt-2">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5 items-center">
              {activeChips.map((chip, i) => (
                <Badge
                  key={i}
                  variant="secondary"
                  className="bg-zinc-900 text-white hover:bg-red-700 cursor-pointer gap-1 rounded-none text-xs"
                  onClick={chip.remove}
                >
                  {chip.label} ✕
                </Badge>
              ))}
              {activeChips.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-zinc-400 hover:text-zinc-900 h-6 px-2 text-xs"
                  onClick={clearAll}
                >
                  Clear All
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <span className="text-xs text-zinc-400">{filteredSongs.length} result{filteredSongs.length !== 1 ? 's' : ''}</span>
              <span className="text-zinc-200">·</span>
              <span>Sort</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-zinc-200 text-zinc-700 px-2 py-1 text-sm"
              >
                <option value="title">Title</option>
                <option value="year">Year</option>
                <option value="artist">Artist</option>
              </select>
            </div>
          </div>

          <SongTable songs={filteredSongs} artistMap={artistMap} onAddToPlaylist={addSong} />
        </section>
      </div>
    </div>
  );
}

export default SongsView;

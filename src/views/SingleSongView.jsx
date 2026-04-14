import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Radar, ResponsiveContainer,
} from 'recharts';
import { apiFetch } from '@/utils/api';
import SongTable from '@/components/SongTable';
import LoadingSpinner from '@/components/LoadingSpinner';
import { usePlaylist } from '@/hooks/usePlaylist';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';

/** Analytics attributes used for the radar chart and related-song scoring. */
const ANALYTIC_ATTRS = [
  'danceability', 'energy', 'valence',
  'acousticness', 'liveness', 'speechiness',
];

/**
 * Single Song detail view.
 * Displays song metadata, a radar chart of six audio analytics,
 * an "Add to Playlist" button, and a related songs section.
 *
 * Related songs are determined by finding the song's top-3 highest analytic
 * attributes, then ranking all other songs by the sum of absolute differences
 * across those attributes. The 5 closest songs are shown.
 *
 * @param {object} props
 * @param {object|null} props.currentPlaylist - The currently selected playlist
 * @param {function} props.setCurrentPlaylist - Setter to update the active playlist
 */
function SingleSongView({ currentPlaylist, setCurrentPlaylist }) {
  const { id } = useParams();
  const [song, setSong] = useState(null);
  const [artist, setArtist] = useState(null);
  const [genre, setGenre] = useState(null);
  const [related, setRelated] = useState([]);
  const [artistMap, setArtistMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { addSong } = usePlaylist(currentPlaylist, setCurrentPlaylist);

  useEffect(() => {
    /**
     * Fetches song details, then in parallel fetches artist info and all songs
     * (for related-song scoring). Builds an artistMap for SongTable display.
     */
    async function fetchSong() {
      setLoading(true);
      try {
        const songData = await apiFetch(`/api/songs/${id}`);
        setSong(songData);

        const [artistData, allSongs, allArtists] = await Promise.all([
          apiFetch(`/api/artists/${songData.artist?.artist_id}`),
          apiFetch('/api/songs'),
          apiFetch('/api/artists'),
        ]);

        setArtist(artistData);
        setGenre(songData.genre ?? null);
        setArtistMap(Object.fromEntries(allArtists.map((a) => [a.artist_id, a.artist_name])));

        // Compute related songs
        setRelated(computeRelated(songData, allSongs));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSong();
  }, [id]);

  /**
   * Computes the top 5 related songs based on similarity of the three analytic
   * attributes that have the highest values in the reference song.
   * Lower total absolute difference = more similar.
   *
   * @param {object} ref - The reference song object
   * @param {object[]} allSongs - All songs from the API
   * @returns {object[]} Up to 5 most similar songs (excluding the reference)
   */
  function computeRelated(ref, allSongs) {
    const top3 = [...ANALYTIC_ATTRS]
      .sort((a, b) => (ref[b] ?? 0) - (ref[a] ?? 0))
      .slice(0, 3);

    return allSongs
      .filter((s) => String(s.song_id) !== String(ref.song_id))
      .map((s) => ({
        ...s,
        _score: top3.reduce((acc, key) => acc + Math.abs((s[key] ?? 0) - (ref[key] ?? 0)), 0),
      }))
      .sort((a, b) => a._score - b._score)
      .slice(0, 5);
  }

  if (loading) return <LoadingSpinner variant="song" />;
  if (error) return <p className="text-red-700 p-4">Error: {error}</p>;
  if (!song) return null;

  /** Radar chart data scaled 0–100 from raw 0–1 float values. */
  const radarData = ANALYTIC_ATTRS.map((key) => ({
    subject: key.charAt(0).toUpperCase() + key.slice(1),
    value: Math.round((song[key] ?? 0) * 100),
  }));

  return (
    <div className="space-y-10">
      <Toaster position="bottom-right" />

      <div className="border-b border-zinc-200 pb-6">
        <p className="text-xs font-semibold text-red-700 uppercase tracking-widest mb-2">Song</p>
        <h1 className="text-5xl font-black text-zinc-900 tracking-tight leading-tight">{song.title}</h1>
      </div>

      {/* Three-column detail grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">

        {/* Column 1: Metadata + CTA */}
        <div className="space-y-4">
          {[
            { label: 'Artist', value: <Link to={`/artists/${song.artist?.artist_id}`} className="text-red-700 hover:underline font-medium">{song.artist?.artist_name ?? '—'}</Link> },
            { label: 'Year', value: song.year },
            { label: 'Genre', value: song.genre?.genre_name ?? '—' },
            { label: 'BPM', value: song.bpm ?? '—' },
            { label: 'Popularity', value: song.popularity ?? '—' },
            { label: 'Loudness', value: song.loudness != null ? `${song.loudness} dB` : '—' },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">{label}</p>
              <p className="text-zinc-800">{value}</p>
            </div>
          ))}

          <Button
            onClick={() => addSong(song)}
            className="mt-2 bg-zinc-900 hover:bg-red-700 text-white w-full rounded-none transition-colors"
          >
            + Add to Playlist
          </Button>
        </div>

        {/* Column 2: Artist image */}
        <div>
          {artist?.artist_image_url ? (
            <img
              src={artist.artist_image_url}
              alt={artist.artist_name}
              className="object-cover w-full max-h-64"
              onError={(e) => { e.target.src = '/placeholder.svg'; }}
            />
          ) : (
            <div className="w-full h-48 bg-zinc-100 flex items-center justify-center text-zinc-300 text-sm">
              No image
            </div>
          )}
        </div>

        {/* Column 3: Radar chart */}
        <div className="border border-zinc-200 p-4">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider text-center mb-2">Audio Profile</p>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e4e4e7" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#71717a', fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                dataKey="value"
                stroke="#b91c1c"
                fill="#b91c1c"
                fillOpacity={0.25}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Related songs */}
      {related.length > 0 && (
        <section className="space-y-4">
          <div className="border-b border-zinc-200 pb-3">
            <h2 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Related Songs</h2>
            <p className="text-xs text-zinc-400 mt-1">
              Closest audio profile match (top-3 analytic attributes).
            </p>
          </div>
          <SongTable songs={related} artistMap={artistMap} onAddToPlaylist={addSong} />
        </section>
      )}
    </div>
  );
}

export default SingleSongView;

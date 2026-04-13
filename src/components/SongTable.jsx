import { Link } from 'react-router-dom';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';

/**
 * Reusable song list table used across Browse, Single Artist, Single Genre,
 * and Playlist views.
 *
 * @param {object} props
 * @param {object[]} props.songs - Array of song objects from the API
 * @param {Object.<number,string>} [props.artistMap] - Optional id→name lookup;
 *   if omitted the artist cell shows a dash
 * @param {function} [props.onAddToPlaylist] - Called with the song when + clicked;
 *   omit to hide the Add column
 * @param {function} [props.onRemove] - Called with the song when − clicked;
 *   omit to hide the Remove column
 */
function SongTable({ songs, artistMap = {}, onAddToPlaylist, onRemove }) {
  if (!songs || songs.length === 0) {
    return <p className="text-zinc-400 text-sm py-4">No songs found.</p>;
  }

  return (
    <div className="border border-zinc-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-zinc-200 hover:bg-transparent bg-zinc-50">
            <TableHead className="text-zinc-500 font-semibold text-xs uppercase tracking-wider">Title</TableHead>
            <TableHead className="text-zinc-500 font-semibold text-xs uppercase tracking-wider">Artist</TableHead>
            <TableHead className="text-zinc-500 font-semibold text-xs uppercase tracking-wider">Year</TableHead>
            {(onAddToPlaylist || onRemove) && <TableHead className="w-12" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {songs.map((song) => {
            const songId = song.song_id ?? song.id;
            const artistId = song.artist?.artist_id ?? song.artist_id;
            const artistName = song.artist?.artist_name ?? artistMap[artistId] ?? '—';
            return (
            <TableRow key={songId} className="border-zinc-100 hover:bg-zinc-50">
              <TableCell>
                <Link
                  to={`/songs/${songId}`}
                  className="font-medium text-zinc-900 hover:text-red-700 transition-colors"
                >
                  {song.title}
                </Link>
              </TableCell>
              <TableCell>
                <Link
                  to={`/artists/${artistId}`}
                  className="text-zinc-500 hover:text-red-700 transition-colors"
                >
                  {artistName}
                </Link>
              </TableCell>
              <TableCell className="text-zinc-400">{song.year}</TableCell>
              {onAddToPlaylist && (
                <TableCell>
                  <button
                    className="text-zinc-400 hover:text-red-700 transition-colors text-lg leading-none font-light"
                    onClick={() => onAddToPlaylist(song)}
                    title="Add to playlist"
                  >
                    +
                  </button>
                </TableCell>
              )}
              {onRemove && (
                <TableCell>
                  <button
                    className="text-zinc-400 hover:text-red-700 transition-colors text-lg leading-none"
                    onClick={() => onRemove(song)}
                    title="Remove from playlist"
                  >
                    −
                  </button>
                </TableCell>
              )}
            </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

export default SongTable;

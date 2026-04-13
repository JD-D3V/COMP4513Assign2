import { Link } from 'react-router-dom';

/**
 * Reusable song list table used across Browse, Single Artist, Single Genre,
 * and Playlist views.
 *
 * Props:
 *   songs            - array of song objects
 *   onAddToPlaylist  - (song) => void, called when + button clicked; omit to hide button
 *   onRemove         - (song) => void, called when - button clicked; omit to hide button
 */
function SongTable({ songs, onAddToPlaylist, onRemove }) {
  if (!songs || songs.length === 0) {
    return <p className="no-results">No songs found.</p>;
  }

  return (
    <table className="song-table">
      <thead>
        <tr>
          <th>Title</th>
          <th>Artist</th>
          <th>Year</th>
          {(onAddToPlaylist || onRemove) && <th></th>}
        </tr>
      </thead>
      <tbody>
        {songs.map((song) => (
          <tr key={song.song_id}>
            <td>
              <Link to={`/songs/${song.song_id}`}>{song.title}</Link>
            </td>
            <td>
              <Link to={`/artists/${song.artist_id}`}>{song.artists?.artist_name ?? song.artist_name}</Link>
            </td>
            <td>{song.year}</td>
            {onAddToPlaylist && (
              <td>
                <button onClick={() => onAddToPlaylist(song)} title="Add to playlist">+</button>
              </td>
            )}
            {onRemove && (
              <td>
                <button onClick={() => onRemove(song)} title="Remove from playlist">&#8722;</button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default SongTable;

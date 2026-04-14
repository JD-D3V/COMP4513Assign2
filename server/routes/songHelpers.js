const SONGS_BASE = `
  SELECT s.song_id, s.title, s.year, s.bpm, s.energy, s.danceability, s.loudness,
         s.liveness, s.valence, s.duration, s.acousticness, s.speechiness, s.popularity,
         a.artist_id, a.artist_name,
         g.genre_id, g.genre_name
  FROM songs s
  INNER JOIN artists a ON s.artist_id = a.artist_id
  INNER JOIN genres g ON s.genre_id = g.genre_id
`;

const formatSong = (row) => ({
  song_id: row.song_id,
  title: row.title,
  year: row.year,
  bpm: row.bpm,
  energy: row.energy,
  danceability: row.danceability,
  loudness: row.loudness,
  liveness: row.liveness,
  valence: row.valence,
  duration: row.duration,
  acousticness: row.acousticness,
  speechiness: row.speechiness,
  popularity: row.popularity,
  artist: { artist_id: row.artist_id, artist_name: row.artist_name },
  genre: { genre_id: row.genre_id, genre_name: row.genre_name },
});

module.exports = { SONGS_BASE, formatSong };

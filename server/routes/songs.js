const express = require('express');
const router = express.Router();
const db = require('../db');
const { SONGS_BASE, formatSong } = require('./songHelpers');

router.get('/', (req, res) => {
  const rows = db.prepare(SONGS_BASE + ' ORDER BY s.title').all();
  res.json(rows.map(formatSong));
});

router.get('/artist/:ref', (req, res) => {
  const ref = parseInt(req.params.ref);
  if (isNaN(ref)) {
    return res.status(404).json({ error: `No songs found for artist id: ${req.params.ref}` });
  }
  const rows = db.prepare(SONGS_BASE + ' WHERE s.artist_id = ? ORDER BY s.title').all(ref);
  res.json(rows.map(formatSong));
});

router.get('/genre/:ref', (req, res) => {
  const ref = parseInt(req.params.ref);
  if (isNaN(ref)) {
    return res.status(404).json({ error: `No songs found for genre id: ${req.params.ref}` });
  }
  const rows = db.prepare(SONGS_BASE + ' WHERE s.genre_id = ? ORDER BY s.title').all(ref);
  res.json(rows.map(formatSong));
});

router.get('/:ref', (req, res) => {
  const ref = parseInt(req.params.ref);
  if (isNaN(ref)) {
    return res.status(404).json({ error: `No song found with id: ${req.params.ref}` });
  }
  const row = db.prepare(SONGS_BASE + ' WHERE s.song_id = ?').get(ref);
  if (!row) {
    return res.status(404).json({ error: `No song found with id: ${ref}` });
  }
  res.json(formatSong(row));
});

module.exports = router;

const express = require('express');
const cors = require('cors');
const path = require('path');

const artistRoutes = require('./routes/artists');
const songRoutes = require('./routes/songs');
const genreRoutes = require('./routes/genres');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/artists', artistRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/genres', genreRoutes);

// Serve the built React app (production only)
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// All non-API routes go to React (handles client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

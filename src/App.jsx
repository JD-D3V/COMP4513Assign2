import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';

import Header from './components/Header';
import Footer from './components/Footer';
import AboutDialog from './components/AboutDialog';

import HomeView from './views/HomeView';
import ArtistsView from './views/ArtistsView';
import GenresView from './views/GenresView';
import SongsView from './views/SongsView';
import SingleSongView from './views/SingleSongView';
import SingleArtistView from './views/SingleArtistView';
import SingleGenreView from './views/SingleGenreView';
import PlaylistView from './views/PlaylistView';
import LoginView from './views/LoginView';

import './App.css';

/**
 * Root application component.
 * Manages global state: auth, current playlist, about dialog visibility.
 */
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [showAbout, setShowAbout] = useState(false);

  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <Header
          isLoggedIn={isLoggedIn}
          onLogout={() => setIsLoggedIn(false)}
          currentPlaylist={currentPlaylist}
          onAbout={() => setShowAbout(true)}
        />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/artists" element={<ArtistsView />} />
            <Route path="/artists/:id" element={<SingleArtistView currentPlaylist={currentPlaylist} setCurrentPlaylist={setCurrentPlaylist} />} />
            <Route path="/genres" element={<GenresView />} />
            <Route path="/genres/:id" element={<SingleGenreView currentPlaylist={currentPlaylist} setCurrentPlaylist={setCurrentPlaylist} />} />
            <Route path="/songs" element={<SongsView currentPlaylist={currentPlaylist} setCurrentPlaylist={setCurrentPlaylist} />} />
            <Route path="/songs/:id" element={<SingleSongView currentPlaylist={currentPlaylist} setCurrentPlaylist={setCurrentPlaylist} />} />
            <Route
              path="/playlists"
              element={
                isLoggedIn
                  ? <PlaylistView currentPlaylist={currentPlaylist} setCurrentPlaylist={setCurrentPlaylist} />
                  : <Navigate to="/login" replace />
              }
            />
            <Route path="/login" element={<LoginView onLogin={() => setIsLoggedIn(true)} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />

        {showAbout && <AboutDialog onClose={() => setShowAbout(false)} />}
      </div>
    </BrowserRouter>
  );
}

export default App;

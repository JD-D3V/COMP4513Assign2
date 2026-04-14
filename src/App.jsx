import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useKeyboardNav } from './hooks/useKeyboardNav';

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
 * Manages global state: Supabase auth session, current playlist, about dialog.
 * Subscribes to auth state changes so login/logout updates the UI reactively.
 */
/** Mounts keyboard navigation inside the router context so useNavigate works. */
function KeyboardNav() {
  useKeyboardNav();
  return null;
}


function App() {
  const [user, setUser] = useState(null);
  const [currentPlaylist, setCurrentPlaylist] = useState(null);
  const [showAbout, setShowAbout] = useState(false);

  const isLoggedIn = !!user;

  useEffect(() => {
    /**
     * On mount, load the existing session (handles page refresh).
     * Then subscribe to auth state changes (login, logout, token refresh).
     * Unsubscribes on unmount to avoid memory leaks.
     */
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) setCurrentPlaylist(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <BrowserRouter basename="/COMP4513Assign2">
      <KeyboardNav />
      <div className="min-h-screen flex flex-col bg-stone-50 text-zinc-900">
        <Header
          isLoggedIn={isLoggedIn}
          currentPlaylist={currentPlaylist}
          onAbout={() => setShowAbout(true)}
        />

        <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
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
            <Route path="/login" element={<LoginView />} />
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

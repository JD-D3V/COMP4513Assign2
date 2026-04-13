import { Link, useNavigate } from 'react-router-dom';

/**
 * Persistent site header.
 * Shows nav links, login/logout, and current playlist count when logged in.
 *
 * Props:
 *   isLoggedIn      - boolean
 *   onLogout        - callback to clear auth state
 *   currentPlaylist - playlist object { name, songs[] } or null
 *   onAbout         - callback to open the About dialog
 */
function Header({ isLoggedIn, onLogout, currentPlaylist, onAbout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <header className="site-header">
      <Link to="/" className="logo">MusicApp</Link>

      <nav className="main-nav">
        <Link to="/">Home</Link>
        <Link to="/artists">Artists</Link>
        <Link to="/genres">Genres</Link>
        <Link to="/songs">Songs</Link>
        {isLoggedIn && <Link to="/playlists">Playlists</Link>}
        <button onClick={onAbout} className="nav-link-btn">About</button>
      </nav>

      <div className="header-right">
        {isLoggedIn ? (
          <>
            {currentPlaylist && (
              <span className="playlist-badge">
                {currentPlaylist.name} ({currentPlaylist.songs?.length ?? 0})
              </span>
            )}
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </header>
  );
}

export default Header;

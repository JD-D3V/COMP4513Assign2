import { Link } from 'react-router-dom';

/**
 * Landing page / Home view.
 * Shows a hero section and quick navigation cards.
 */
function HomeView() {
  return (
    <div className="home-view">
      <section className="hero-section">
        <h1>Discover Music</h1>
        <p>Browse artists, genres, and songs from our collection.</p>
      </section>

      <section className="home-cards">
        <Link to="/artists" className="home-card">
          <h2>Artists</h2>
          <p>Explore artists and their discographies.</p>
        </Link>
        <Link to="/genres" className="home-card">
          <h2>Genres</h2>
          <p>Browse music by genre.</p>
        </Link>
        <Link to="/songs" className="home-card">
          <h2>Songs</h2>
          <p>Search and filter our song catalogue.</p>
        </Link>
      </section>
    </div>
  );
}

export default HomeView;

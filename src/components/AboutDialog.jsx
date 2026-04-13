/**
 * Modal dialog showing assignment info, technologies, and author details.
 *
 * Props:
 *   onClose - callback to close the dialog
 */
function AboutDialog({ onClose }) {
  return (
    <dialog open className="about-dialog" aria-modal="true" aria-label="About">
      <div className="about-content">
        <button className="dialog-close" onClick={onClose} aria-label="Close">&#x2715;</button>
        <h2>About This App</h2>
        <p>
          <strong>COMP 4513 Assignment 2</strong> &mdash; A music browser SPA built with React + Vite.
        </p>
        <h3>Technologies</h3>
        <ul>
          <li>React 19 + Vite</li>
          <li>React Router DOM v7</li>
          <li>Supabase (data &amp; auth)</li>
          <li>Recharts (radar chart)</li>
        </ul>
        <h3>Author</h3>
        <p>Your Name &mdash; <a href="https://github.com/YOUR_USERNAME" target="_blank" rel="noreferrer">GitHub</a></p>
        <h3>Source</h3>
        <a href="https://github.com/YOUR_USERNAME/COMP4513Assign2" target="_blank" rel="noreferrer">
          github.com/YOUR_USERNAME/COMP4513Assign2
        </a>
      </div>
      <button onClick={onClose}>Close</button>
    </dialog>
  );
}

export default AboutDialog;

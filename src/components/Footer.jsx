/**
 * Persistent site footer shown on all views.
 */
function Footer() {
  return (
    <footer className="border-t border-zinc-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 h-12 flex items-center justify-center text-xs text-zinc-400">
        COMP 4513 Assignment 2 &mdash;{' '}
        <a
          href="https://github.com/JD-D3V/COMP4513Assign2"
          target="_blank"
          rel="noreferrer"
          className="text-red-700 hover:underline ml-1"
        >
          GitHub Repo
        </a>
      </div>
    </footer>
  );
}

export default Footer;

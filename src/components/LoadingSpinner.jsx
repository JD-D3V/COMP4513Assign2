/**
 * Loading indicator displayed while async data is being fetched.
 */
function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center gap-3 py-16" role="status" aria-label="Loading">
      <div className="w-8 h-8 border-2 border-zinc-200 border-t-zinc-900 rounded-full animate-spin" />
      <p className="text-zinc-400 text-sm">Loading…</p>
    </div>
  );
}

export default LoadingSpinner;

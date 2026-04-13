/**
 * Loading indicator displayed while async data is being fetched.
 */
function LoadingSpinner() {
  return (
    <div className="loading-spinner" role="status" aria-label="Loading">
      <div className="spinner" />
      <p>Loading...</p>
    </div>
  );
}

export default LoadingSpinner;

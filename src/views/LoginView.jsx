import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Login view.
 * Currently simulated — any credentials are accepted.
 * Note: this is a "pretend" authentication system as permitted by the assignment spec.
 *
 * Props:
 *   onLogin - callback called when login succeeds
 */
function LoginView({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  function handleLogin(e) {
    e.preventDefault();
    // Simulated login — accepts any non-empty credentials
    if (email && password) {
      onLogin();
      navigate('/');
    }
  }

  return (
    <div className="login-view">
      <form className="login-form" onSubmit={handleLogin}>
        <h1>Login</h1>

        <p className="login-notice">
          <em>Note: This is a simulated login — any credentials will work.</em>
        </p>

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        <div className="login-buttons">
          <button type="submit">Login</button>
          <button type="button" disabled title="Register will be implemented in a future version">
            Register
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoginView;

import { useState } from 'react';
import { DEMO_ACCOUNTS } from '../constants.js';

export default function AccountBar({ user, onLogin, onLogout }) {
  const [email, setEmail] = useState(DEMO_ACCOUNTS[1].email);
  const [error, setError] = useState('');

  if (user) {
    return (
      <div className="account">
        <span>
          Signed in as <strong>{user.name}</strong>
          {user.role === 'admin' && <span className="tag">admin</span>}
        </span>
        <button type="button" className="button ghost" onClick={onLogout}>
          Sign out
        </button>
      </div>
    );
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    try {
      await onLogin(email);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form className="account" onSubmit={handleSubmit}>
      <select value={email} onChange={(event) => setEmail(event.target.value)} aria-label="Demo account">
        {DEMO_ACCOUNTS.map((account) => (
          <option key={account.email} value={account.email}>
            {account.label}
          </option>
        ))}
      </select>
      <button type="submit" className="button primary">
        Sign in
      </button>
      {error && <span className="error-text">{error}</span>}
    </form>
  );
}

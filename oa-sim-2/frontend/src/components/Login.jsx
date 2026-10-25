import { useState } from 'react';
import { api } from '../api.js';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('alice@example.com');
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      const { user } = await api.login(email);
      onLogin(user);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form className="card login" onSubmit={handleSubmit}>
      <h1>Car Marketplace</h1>
      <label>
        Email
        <input value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <button type="submit">Log in</button>
      {error && <p className="error">{error}</p>}
    </form>
  );
}

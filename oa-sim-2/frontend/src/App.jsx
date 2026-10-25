import { useState } from 'react';
import CarDetails from './components/CarDetails.jsx';
import CarList from './components/CarList.jsx';
import Login from './components/Login.jsx';
import Wishlist from './components/Wishlist.jsx';

export default function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState({ name: 'cars' });

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  return (
    <div className="app">
      <header>
        <h1>Car Marketplace</h1>
        <nav>
          <button onClick={() => setView({ name: 'cars' })}>Browse cars</button>
          <button onClick={() => setView({ name: 'wishlist' })}>My wishlist</button>
          <span className="user">{user.name}</span>
          <button onClick={() => setUser(null)}>Log out</button>
        </nav>
      </header>

      <main>
        {view.name === 'cars' && <CarList onSelect={(id) => setView({ name: 'car', id })} />}
        {view.name === 'car' && (
          <CarDetails id={view.id} user={user} onBack={() => setView({ name: 'cars' })} />
        )}
        {view.name === 'wishlist' && (
          <Wishlist user={user} onSelect={(id) => setView({ name: 'car', id })} />
        )}
      </main>
    </div>
  );
}

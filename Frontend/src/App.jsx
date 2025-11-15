import { useState } from 'react';
import HomePage from './pages/HomePage';
import WardrobePage from './pages/WardrobePage';
import ClosetPage from './pages/ClosetPage';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [selectedCloset, setSelectedCloset] = useState(null);
  const [userPlan] = useState('free'); // 'free' or 'premium'

  const handleNavigate = (view, data = null) => {
    if (view === 'closet' && data) {
      setSelectedCloset(data);
    }
    setCurrentView(view);
  };

  return (
    <div className="app">
      {currentView === 'home' && (
        <HomePage 
          onNavigate={handleNavigate}
        />
      )}

      {currentView === 'wardrobe' && (
        <WardrobePage 
          onNavigate={handleNavigate}
          userPlan={userPlan}
        />
      )}

      {currentView === 'closet' && selectedCloset && (
        <ClosetPage 
          closet={selectedCloset}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}

export default App;
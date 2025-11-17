import { useState } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom'; // Import routing hooks/components
import HomePage from './pages/HomePage';
import WardrobePage from './pages/WardrobePage';
import ClosetPage from './pages/ClosetPage';
import './App.css';

function App() {
  const [userPlan] = useState('free');

  const navigate = useNavigate();

  const handleNavigate = (view, closetData = null) => {
    if (view === 'wardrobe') {
      navigate('/wardrobe');
    } else if (view === 'closet' && closetData) {

      const slug = encodeURIComponent(closetData.name.replace(/\s/g, '-'));
      navigate(`/closet/${closetData.id}/${slug}`, { state: { closet: closetData } });
    } else {
      navigate('/');
    }
  };

  return (
    <div className="app">
      <Routes>
        {/* Home Page Route */}
        <Route path="/" element={<HomePage onNavigate={handleNavigate} />} />

        {/* Wardrobe Page Route */}
        <Route path="/wardrobe" element={<WardrobePage onNavigate={handleNavigate} userPlan={userPlan} />} />

        {/* Closet Page Route - Uses dynamic parameters for ID and Name */}
        <Route path="/closet/:closetId/:closetName" element={<ClosetPageWrapper onNavigate={handleNavigate} />} />

        {/* Optional: Add a 404/Catch-all route */}
        <Route path="*" element={<h1>404: Page Not Found</h1>} />
      </Routes>
    </div>
  );
}

function ClosetPageWrapper({ onNavigate }) {
  const location = useLocation();
  const { closetId, closetName } = useParams();

  // Use the state passed from navigation if available, otherwise fallback to URL params
  const closetData = location.state?.closet || {
      id: parseInt(closetId),
      name: decodeURIComponent(closetName).replace(/-/g, ' '),
      type: 'General',
      itemCount: 0
  };


  return <ClosetPage closetData={closetData} onNavigate={onNavigate} />;
}

export default App;
import { useState } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom'; // Import routing hooks/components
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
 
  
  const { closetId, closetName } = useParams();
  const closet = { 
      id: parseInt(closetId), 
      name: decodeURIComponent(closetName).replace(/-/g, ' '), 
      itemCount: 0, 
      color: '#1e91d6' 
  };
  

  return <ClosetPage closet={closet} onNavigate={onNavigate} />;
}

export default App;
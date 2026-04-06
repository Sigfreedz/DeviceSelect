import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import TopDevices from './pages/TopDevices';
import Recommend from './pages/Recommend';
import Compare from './pages/Compare';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      if (path === '/top-devices') {
        setCurrentPage('top-devices');
      } else if (path === '/recommend') {
        setCurrentPage('recommend');
      } else if (path === '/compare') {
        setCurrentPage('compare');
      } else {
        setCurrentPage('home');
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  if (currentPage === 'top-devices') {
    return <TopDevices />;
  }

  if (currentPage === 'recommend') {
    return <Recommend />;
  }

  if (currentPage === 'compare') {
    return <Compare />;
  }

  return (
    <div className="app-container">
      <Navbar />
      <main>
        <Hero />
        <Features />
      </main>
      <footer>
        <div className="footer-content">
          <p>&copy; 2026 Web-Based Device Selection Platform for IT Students. All rights reserved.</p>
          <p>Designed for BSIT Academic Excellence.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

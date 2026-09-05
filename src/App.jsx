import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Stats from './components/Stats';
import ImageUpload from './components/ImageUpload';
import HospitalList from './components/HospitalList';
import Footer from './components/Footer';
import AuthModal from './components/AuthModal';
import './App.css';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('medicompare_user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (err) {
        console.error(err);
      }
    }
    return null;
  });

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setIsAuthOpen(false);
    localStorage.setItem('medicompare_user', JSON.stringify(userData));
  };

  return (
    <div className="app-container">
      <Navbar onAuthSuccess={handleAuthSuccess} />
      <Hero onSearchQuery={handleSearch} />
      <Features />
      <Stats />
      <ImageUpload 
        onFindHospital={handleSearch} 
        isLoggedIn={!!user}
        onOpenAuthModal={() => setIsAuthOpen(true)}
      />
      <HospitalList searchQuery={searchQuery} />
      <Footer />
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}

export default App;

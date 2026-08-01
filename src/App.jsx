import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Stats from './components/Stats';
import ImageUpload from './components/ImageUpload';
import HospitalList from './components/HospitalList';
import Footer from './components/Footer';
import './App.css';

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return (
    <div className="app-container">
      <Navbar />
      <Hero onSearchQuery={handleSearch} />
      <Features />
      <Stats />
      <ImageUpload onFindHospital={handleSearch} />
      <HospitalList searchQuery={searchQuery} />
      <Footer />
    </div>
  );
}

export default App;

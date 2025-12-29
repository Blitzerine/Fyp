import React, { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Simulate from './pages/Simulate';
import Compare from './pages/Compare';
import SimulateResults from './pages/SimulateResults';
import CompareResults from './pages/CompareResults';

function AppContent() {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('enter');
  const [direction, setDirection] = useState('forward');

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      // Define route order for main navigation flow: Home -> Simulate -> Compare
      const routeOrder = ['/', '/simulate', '/compare'];
      const currentIndex = routeOrder.indexOf(location.pathname);
      const prevIndex = routeOrder.indexOf(displayLocation.pathname);
      
      // Determine direction based on route order
      if (currentIndex > prevIndex || (prevIndex === -1 && currentIndex !== -1)) {
        setDirection('forward'); // Moving forward: new page from right
      } else if (currentIndex < prevIndex && currentIndex !== -1) {
        setDirection('backward'); // Moving backward: new page from left
      } else {
        // For routes not in the order (login, signup, results), default to forward
        setDirection('forward');
      }
      
      setTransitionStage('exit');
    }
  }, [location, displayLocation]);

  useEffect(() => {
    if (transitionStage === 'exit') {
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setTransitionStage('enter');
      }, 150); // Match animation duration (doubled speed = halved time)
      return () => clearTimeout(timer);
    }
  }, [transitionStage, location]);

  return (
    <div className={`page-transition page-transition-${transitionStage}-${direction}`}>
      <Routes location={displayLocation}>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/simulate" element={<Simulate />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/simulate/results" element={<SimulateResults />} />
        <Route path="/compare/results" element={<CompareResults />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <Navbar />
      <AppContent />
    </div>
  );
}

export default App;

import React, { useState, useEffect } from "react";
import ChartList from "./components/ChartList";
import "./App.css";

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [showNotice, setShowNotice] = useState(false);

  // Initialize theme based on system preference or previous choice
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const preferenceAccepted = localStorage.getItem('themePreferenceAccepted');
    
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (savedTheme === 'light') {
      setDarkMode(false);
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setDarkMode(prefersDark);
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      
      // Show notice if preference not yet accepted
      if (!preferenceAccepted) {
        setShowNotice(true);
      }
    }
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (!localStorage.getItem('theme')) {
        setDarkMode(e.matches);
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    document.documentElement.setAttribute('data-theme', newDarkMode ? 'dark' : 'light');
    localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
  };
  
  const acceptPreference = () => {
    localStorage.setItem('themePreferenceAccepted', 'true');
    setShowNotice(false);
  };
  
  const resetToSystem = () => {
    localStorage.removeItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    acceptPreference();
  };

  return (
    <div className="App">
      <ChartList darkMode={darkMode} />
      
      <button 
        className="theme-toggle" 
        onClick={toggleTheme}
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        <i className={`bi ${darkMode ? 'bi-sun-fill' : 'bi-moon-fill'}`}></i>
      </button>
      
      {showNotice && (
        <div className="theme-preference-notice">
          <p>We've set your theme based on your system preference. Would you like to keep this setting?</p>
          <div className="notice-actions">
            <button className="notice-btn notice-btn-primary" onClick={acceptPreference}>Yes, keep it</button>
            <button className="notice-btn notice-btn-secondary" onClick={resetToSystem}>Reset to system</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

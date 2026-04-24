/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import LandingPage from './components/LandingPage';
import MapPage from './components/MapPage';
import { motion, AnimatePresence } from 'motion/react';
import { GreenSpace } from './types';
import { fetchGreenSpaces } from './services/dataService';

type Path = 'landing' | 'map';
type Theme = 'light' | 'dark';

export default function App() {
  const [currentPath, setCurrentPath] = useState<Path>('landing');
  const [allSpaces, setAllSpaces] = useState<GreenSpace[]>([]);
  const [initialSelectedSpace, setInitialSelectedSpace] = useState<GreenSpace | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'light';
  });

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchGreenSpaces();
        setAllSpaces(data);
      } catch (err) {
        console.error('Error fetching green spaces:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleSelectFromLanding = (space: GreenSpace) => {
    setInitialSelectedSpace(space);
    setCurrentPath('map');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-dark-green-950 transition-colors duration-300">
      <Navigation 
        currentPath={currentPath} 
        onNavigate={(path) => {
          setCurrentPath(path);
          if (path === 'landing') setInitialSelectedSpace(null);
        }} 
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      
      <main>
        <AnimatePresence mode="wait">
          {currentPath === 'landing' ? (
            <motion.div
              key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              <LandingPage 
                onStart={() => setCurrentPath('map')} 
                allSpaces={allSpaces}
                onSelectSpace={handleSelectFromLanding}
                loading={loading}
              />
            </motion.div>
          ) : (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            >
              <MapPage 
                theme={theme} 
                allSpacesExternal={allSpaces}
                initialSelectedSpace={initialSelectedSpace}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}


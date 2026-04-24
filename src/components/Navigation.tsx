/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Trees, Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';

interface NavigationProps {
  currentPath: 'landing' | 'map';
  onNavigate: (path: 'landing' | 'map') => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function Navigation({ currentPath, onNavigate, theme, onToggleTheme }: NavigationProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-dark-green-950/90 backdrop-blur-md border-b border-gray-100 dark:border-dark-green-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => onNavigate('landing')}
        >
          <div className="p-2 bg-green-100 dark:bg-dark-green-800 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-dark-green-700 transition-colors">
            <Trees className="w-6 h-6 text-green-700 dark:text-primary transition-colors" />
          </div>
          <span className="font-display text-xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors">
            İstanbul Yeşil Rehber
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-1 bg-gray-100 dark:bg-dark-green-900 p-1 rounded-full transition-colors">
            <button
              onClick={() => onNavigate('landing')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                currentPath === 'landing' 
                  ? 'bg-white dark:bg-dark-green-800 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Başlangıç
            </button>
            <button
              onClick={() => onNavigate('map')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                currentPath === 'map' 
                  ? 'bg-white dark:bg-dark-green-800 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Harita
            </button>
          </div>

          <button
            onClick={onToggleTheme}
            className="p-2 rounded-full bg-gray-100 dark:bg-dark-green-900 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-green-800 transition-all border border-transparent dark:border-dark-green-800"
            aria-label="Temayı Değiştir"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </nav>
  );
}

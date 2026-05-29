/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import KentErisimLogo from './KentErisimLogo';

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
          <div className="p-2 bg-blue-50 dark:bg-slate-800 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-slate-700 transition-colors">
            <KentErisimLogo size={24} className="text-blue-600 dark:text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl font-bold text-gray-900 dark:text-white tracking-tight transition-colors leading-tight">
              KentErişim
            </span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 transition-colors">
              Erişilebilir kent rehberi platformu
            </span>
          </div>
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

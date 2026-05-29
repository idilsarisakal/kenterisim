/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Accessibility, 
  X, 
  Type, 
  Contrast, 
  Palette, 
  Play, 
  Pause, 
  EyeOff, 
  Link as LinkIcon, 
  MousePointer, 
  AlignJustify, 
  RotateCcw,
  Check,
  Volume2,
  VolumeX
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AccessibilitySettings {
  textSize: 'normal' | 'large' | 'xlarge';
  highContrast: boolean;
  reduceSaturation: boolean;
  pauseAnimations: boolean;
  hideImages: boolean;
  highlightLinks: boolean;
  largeCursor: boolean;
  increaseLineHeight: boolean;
}

const DEFAULT_SETTINGS: AccessibilitySettings = {
  textSize: 'normal',
  highContrast: false,
  reduceSaturation: false,
  pauseAnimations: false,
  hideImages: false,
  highlightLinks: false,
  largeCursor: false,
  increaseLineHeight: false,
};

export default function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    const saved = localStorage.getItem('as_settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setIsSpeechSupported(true);
      
      const handleVoicesChanged = () => {
        // Triggers voices loaded in background
      };
      
      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
      };
    }
  }, []);

  // Cancel any speech on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Stop speech if panel is closed
  useEffect(() => {
    if (!isOpen && typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isOpen]);

  const handleSpeak = () => {
    if (!isSpeechSupported) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Find content
    let textToRead = "";

    // 1. Check Leaflet popup card
    const popupEl = document.querySelector('.leaflet-popup-content');
    if (popupEl) {
      const title = popupEl.querySelector('h3')?.textContent || "";
      const sections = Array.from(popupEl.querySelectorAll('.space-y-3 p, .flex p, h3, .inline-block, li'))
        .map(el => el.textContent?.trim())
        .filter(text => text && !text.includes("Yol Tarifi Al") && !text.includes("ADRES") && !text.includes("ÇALIŞMA SAATLERİ"));
      
      if (sections.length > 0) {
        // Unique parts only
        const uniqueSections = Array.from(new Set(sections));
        textToRead = uniqueSections.join('. ');
      } else {
        textToRead = popupEl.textContent || "";
      }
    }

    // 2. Check highlighted (selected) text
    if (!textToRead) {
      const selectedText = window.getSelection()?.toString().trim();
      if (selectedText) {
        textToRead = `Seçilen metin: ${selectedText}`;
      }
    }

    // 3. Fallback to active display context
    if (!textToRead) {
      const activeHeading = document.getElementById('accessibility-panel-title')?.textContent || document.querySelector('h1')?.textContent || document.querySelector('h2')?.textContent || "";
      textToRead = `Seslendirilecek etkin bir yer kartı bulunamadı. Lütfen haritadan bir konum seçin ya da ekrandan bir metin seçerek tekrar deneyin.`;
    }

    if (textToRead) {
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.lang = 'tr-TR';
      
      // Try to find a Turkish voice
      const voices = window.speechSynthesis.getVoices();
      const trVoice = voices.find(voice => voice.lang.includes('tr') || voice.lang.includes('TR'));
      if (trVoice) {
        utterance.voice = trVoice;
      }

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
      };

      try {
        window.speechSynthesis.cancel();
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        setIsSpeaking(false);
      }
    }
  };

  // Apply classes to body based on current settings
  useEffect(() => {
    const body = document.body;

    // Save to local storage
    localStorage.setItem('as_settings', JSON.stringify(settings));

    // Handle Text Size
    body.classList.remove('as-text-lg', 'as-text-xl');
    if (settings.textSize === 'large') {
      body.classList.add('as-text-lg');
    } else if (settings.textSize === 'xlarge') {
      body.classList.add('as-text-xl');
    }

    // Handle High Contrast
    if (settings.highContrast) {
      body.classList.add('as-high-contrast');
    } else {
      body.classList.remove('as-high-contrast');
    }

    // Handle Reduce Saturation
    if (settings.reduceSaturation) {
      body.classList.add('as-reduce-saturation');
    } else {
      body.classList.remove('as-reduce-saturation');
    }

    // Handle Pause Animations
    if (settings.pauseAnimations) {
      body.classList.add('as-pause-animations');
    } else {
      body.classList.remove('as-pause-animations');
    }

    // Handle Hide Images
    if (settings.hideImages) {
      body.classList.add('as-hide-images');
    } else {
      body.classList.remove('as-hide-images');
    }

    // Handle Highlight Links
    if (settings.highlightLinks) {
      body.classList.add('as-highlight-links');
    } else {
      body.classList.remove('as-highlight-links');
    }

    // Handle Large Cursor
    if (settings.largeCursor) {
      body.classList.add('as-large-cursor');
    } else {
      body.classList.remove('as-large-cursor');
    }

    // Handle Increase Line Height
    if (settings.increaseLineHeight) {
      body.classList.add('as-increase-line-height');
    } else {
      body.classList.remove('as-increase-line-height');
    }
  }, [settings]);

  const toggleSetting = (key: keyof Omit<AccessibilitySettings, 'textSize'>) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleTextSizeCycle = () => {
    setSettings(prev => {
      let nextSize: 'normal' | 'large' | 'xlarge' = 'normal';
      if (prev.textSize === 'normal') nextSize = 'large';
      else if (prev.textSize === 'large') nextSize = 'xlarge';
      return { ...prev, textSize: nextSize };
    });
  };

  const handleReset = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        id="accessibility-trigger-btn"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[9999] p-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center border-2 border-white dark:border-slate-800"
        aria-label="Erişilebilirlik Paneli Aç"
      >
        <Accessibility className="w-6 h-6" />
      </button>

      {/* Slide-out/Toggle Panel Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Interactive Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-950 z-[10000]"
            />

            {/* Panel Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 shadow-2xl z-[10001] flex flex-col focus:outline-none"
              role="dialog"
              aria-modal="true"
              aria-labelledby="accessibility-panel-title"
            >
              {/* Sticky Title Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                  <Accessibility className="w-5 h-5 as-panel-icon" />
                  <h2 
                    id="accessibility-panel-title" 
                    className="font-display font-bold text-lg text-slate-900 dark:text-white"
                  >
                    Erişilebilirlik Tercihleri
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  aria-label="Paneli Kapat"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Main Content List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                
                {/* 0. TEXT-TO-SPEECH (TTS) SYSTEM */}
                {isSpeechSupported && (
                  <div className="flex flex-col gap-3 p-4 bg-blue-50/50 dark:bg-slate-800/60 rounded-2xl border-2 border-blue-100 dark:border-blue-900/60 shadow-sm-inset">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isSpeaking ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 animate-pulse' : 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'}`}>
                          <Volume2 className="w-5 h-5 flex-shrink-0" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-900 dark:text-white">Sesli Okuyucu (TTS)</p>
                          <p className="text-xs text-slate-500 dark:text-gray-400">Kartları veya seçilen metni oku</p>
                        </div>
                      </div>

                      <button
                        onClick={handleSpeak}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 ${isSpeaking ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                      >
                        {isSpeaking ? (
                          <>
                            <X className="w-3.5 h-3.5" />
                            Durdur
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            Seslendir
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-[11px] text-blue-600/80 dark:text-blue-400/80 leading-relaxed bg-blue-50/20 dark:bg-blue-950/10 p-2 rounded-lg italic font-medium">
                      💡 İpucu: Haritadan bir konum kartı açıp bu butona basarak detayları sesli dinleyebilir; ya da sayfada istediğiniz bir cümleyi seçip butona basarak o kısmı okutabilirsiniz.
                    </p>
                  </div>
                )}

                {/* 1. TEXT SIZE SETTING */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-lg text-blue-600 dark:text-blue-400">
                      <Type className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">Metin Boyutu</p>
                      <p className="text-xs text-slate-500 dark:text-gray-400">Okunabilirliği artırın</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleTextSizeCycle}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                  >
                    {settings.textSize === 'normal' && 'Varsayılan'}
                    {settings.textSize === 'large' && 'Büyük (L)'}
                    {settings.textSize === 'xlarge' && 'Çok Büyük (XL)'}
                  </button>
                </div>

                {/* 2. HIGH CONTRAST */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-lg text-blue-600 dark:text-blue-400">
                      <Contrast className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">Kontrast Modu</p>
                      <p className="text-xs text-slate-500 dark:text-gray-400">Renk karşıtlığını artırın</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleSetting('highContrast')}
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${settings.highContrast ? 'bg-blue-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'}`}
                    aria-label="Kontrast Modunu Değiştir"
                  >
                    <motion.div layout className="w-4 h-4 rounded-full bg-white shadow" />
                  </button>
                </div>

                {/* 3. REDUCE SATURATION */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-lg text-blue-600 dark:text-blue-400">
                      <Palette className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">Doygunluğu Azalt</p>
                      <p className="text-xs text-slate-500 dark:text-gray-400">Renkleri gri tonlamalı yapın</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleSetting('reduceSaturation')}
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${settings.reduceSaturation ? 'bg-blue-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'}`}
                    aria-label="Doygunluğu Azalt"
                  >
                    <motion.div layout className="w-4 h-4 rounded-full bg-white shadow" />
                  </button>
                </div>

                {/* 4. PAUSE ANIMATIONS */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-lg text-blue-600 dark:text-blue-400">
                      {settings.pauseAnimations ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">Animasyonları Durdur</p>
                      <p className="text-xs text-slate-500 dark:text-gray-400">Hareketleri ve geçişleri kapatın</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleSetting('pauseAnimations')}
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${settings.pauseAnimations ? 'bg-blue-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'}`}
                    aria-label="Animasyonları Durdur"
                  >
                    <motion.div layout className="w-4 h-4 rounded-full bg-white shadow" />
                  </button>
                </div>

                {/* 5. HIDE IMAGES */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-lg text-blue-600 dark:text-blue-400">
                      <EyeOff className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">Resimleri Gizle</p>
                      <p className="text-xs text-slate-500 dark:text-gray-400">Görsel kalabalığı azaltın</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleSetting('hideImages')}
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${settings.hideImages ? 'bg-blue-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'}`}
                    aria-label="Resimleri Gizle"
                  >
                    <motion.div layout className="w-4 h-4 rounded-full bg-white shadow" />
                  </button>
                </div>

                {/* 6. HIGHLIGHT LINKS */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-lg text-blue-600 dark:text-blue-400">
                      <LinkIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">Bağlantıları Vurgula</p>
                      <p className="text-xs text-slate-500 dark:text-gray-400">Linkleri belirgin hale getirin</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleSetting('highlightLinks')}
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${settings.highlightLinks ? 'bg-blue-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'}`}
                    aria-label="Bağlantıları Vurgula"
                  >
                    <motion.div layout className="w-4 h-4 rounded-full bg-white shadow" />
                  </button>
                </div>

                {/* 7. LARGE CURSOR */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-lg text-blue-600 dark:text-blue-400">
                      <MousePointer className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">İmleci Büyüt</p>
                      <p className="text-xs text-slate-500 dark:text-gray-400">Daha büyük fare imleci kullanın</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleSetting('largeCursor')}
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${settings.largeCursor ? 'bg-blue-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'}`}
                    aria-label="İmleci Büyüt"
                  >
                    <motion.div layout className="w-4 h-4 rounded-full bg-white shadow" />
                  </button>
                </div>

                {/* 8. INCREASE LINE HEIGHT */}
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/40 rounded-lg text-blue-600 dark:text-blue-400">
                      <AlignJustify className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900 dark:text-white">Satır Yüksekliği</p>
                      <p className="text-xs text-slate-500 dark:text-gray-400">Satır aralıklarını artırın</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toggleSetting('increaseLineHeight')}
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${settings.increaseLineHeight ? 'bg-blue-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'}`}
                    aria-label="Satır Yüksekliğini Artır"
                  >
                    <motion.div layout className="w-4 h-4 rounded-full bg-white shadow" />
                  </button>
                </div>

              </div>

              {/* Reset Preferences Bottom Bar */}
              <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                <button
                  onClick={handleReset}
                  className="w-full py-3 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Tercihleri Sıfırla
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

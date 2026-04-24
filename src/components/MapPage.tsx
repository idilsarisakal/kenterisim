import { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';
import { Trees, Accessibility, MapPin, AlertCircle, Loader2, Search, Filter, Navigation as LucideNavigation, X, Info, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GreenSpace } from '../types';
import { fetchGreenSpaces } from '../services/dataService';

// Custom Marker Configuration
const createTreeIcon = (isHighlighted: boolean = false) => L.divIcon({
  html: renderToStaticMarkup(
    <div className={`p-1 ${isHighlighted ? 'bg-orange-500 scale-125 ring-4 ring-orange-200' : 'bg-green-600'} rounded-full border-2 border-white shadow-md text-white transition-all duration-300`}>
      <Trees className="w-5 h-5" />
    </div>
  ),
  className: 'custom-tree-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const userIcon = L.divIcon({
  html: renderToStaticMarkup(
    <div className="p-1 bg-blue-600 rounded-full border-2 border-white shadow-md text-white ring-4 ring-blue-100">
      <LucideNavigation className="w-5 h-5" />
    </div>
  ),
  className: 'custom-user-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Map Controller Component to handle programmatic movements
interface MapControllerProps {
  center?: [number, number];
  selectedSpace?: GreenSpace | null;
  userLocation?: [number, number] | null;
}

function MapController({ center, selectedSpace, userLocation }: MapControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (selectedSpace) {
      map.setView([selectedSpace.lat, selectedSpace.lng], 16, { animate: true });
    }
  }, [selectedSpace, map]);

  useEffect(() => {
    if (userLocation) {
      map.setView(userLocation, 15, { animate: true });
    }
  }, [userLocation, map]);

  return null;
}

interface MapPageProps {
  theme: 'light' | 'dark';
  allSpacesExternal?: GreenSpace[];
  initialSelectedSpace?: GreenSpace | null;
}

export default function MapPage({ theme, allSpacesExternal, initialSelectedSpace }: MapPageProps) {
  const [allSpaces, setAllSpaces] = useState<GreenSpace[]>(allSpacesExternal || []);
  const [loading, setLoading] = useState(!allSpacesExternal);
  const [error, setError] = useState<string | null>(null);
  
  // States for features
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTur, setSelectedTur] = useState<string>('Tümü');
  const [selectedAccessibility, setSelectedAccessibility] = useState<string>('Tümü');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [selectedSpace, setSelectedSpace] = useState<GreenSpace | null>(initialSelectedSpace || null);
  const [locating, setLocating] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);

  const markerRefs = useRef<{[key: string]: L.Marker | null}>({});

  useEffect(() => {
    if (allSpacesExternal) {
      setAllSpaces(allSpacesExternal);
      setLoading(false);
    } else {
      async function loadData() {
        try {
          const data = await fetchGreenSpaces();
          setAllSpaces(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Bilinmeyen bir hata oluştu.');
        } finally {
          setLoading(false);
        }
      }
      loadData();
    }
  }, [allSpacesExternal]);

  // Handle initial selection and focus
  useEffect(() => {
    if (initialSelectedSpace && allSpaces.length > 0) {
      // Small delay to ensure map is mounted and refs are ready
      const timer = setTimeout(() => {
        handleSelectSpace(initialSelectedSpace);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [initialSelectedSpace, allSpaces.length]);

  // Filter and Search Logic
  const filteredSpaces = useMemo(() => {
    return allSpaces.filter(space => {
      const matchTur = selectedTur === 'Tümü' || space["TÜR"] === selectedTur;
      const matchAccessibility = selectedAccessibility === 'Tümü' || space["TEKERLEKLİ SANDALYE UYGUNLUK DURUMU"] === 'UYGUN';
      const matchSearch = space.AD.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          space.ADRES.toLowerCase().includes(searchTerm.toLowerCase());
      return matchTur && matchAccessibility && matchSearch;
    });
  }, [allSpaces, selectedTur, selectedAccessibility, searchTerm]);

  // Unique Types for Filter
  const turOptions = useMemo(() => {
    const types = new Set(allSpaces.map(s => s["TÜR"]).filter(Boolean));
    return ['Tümü', ...Array.from(types)] as string[];
  }, [allSpaces]);

  // Suggestions for Search
  const searchSuggestions = useMemo(() => {
    if (searchTerm.length < 2) return [];
    return filteredSpaces.slice(0, 5);
  }, [filteredSpaces, searchTerm]);

  // Handle Geolocation
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      setError("Tarayıcınız konum özelliğini desteklemiyor.");
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const coords: [number, number] = [latitude, longitude];
        setUserLocation(coords);
        setLocating(false);

        // Find nearest green area
        let minDistance = Infinity;
        let nearest: GreenSpace | null = null;

        filteredSpaces.forEach(space => {
          const dist = Math.sqrt(Math.pow(space.lat - latitude, 2) + Math.pow(space.lng - longitude, 2));
          if (dist < minDistance) {
            minDistance = dist;
            nearest = space;
          }
        });

        if (nearest) {
          handleSelectSpace(nearest);
        }
      },
      (err) => {
        setLocating(false);
        setError("Konum izni reddedildi veya konum alınamadı.");
      }
    );
  };

  const handleSelectSpace = (space: GreenSpace) => {
    setSelectedSpace(space);
    setSearchTerm(space.AD);
    setShowSearchSuggestions(false);
    
    // Open popup after a short delay to allow map to move
    setTimeout(() => {
      const marker = markerRefs.current[`${space.AD}-${space.lat}-${space.lng}`];
      if (marker) {
        marker.openPopup();
      }
    }, 500);
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-dark-green-950 pt-16 transition-colors duration-300">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 font-medium transition-colors">Yeşil Alanlar Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full pt-16 flex flex-col md:flex-row overflow-hidden bg-gray-50 dark:bg-dark-green-950 transition-colors duration-300">
      {/* Sidebar - Controls */}
      <div className="w-full md:w-96 bg-white dark:bg-dark-green-900 border-r border-gray-100 dark:border-dark-green-800 p-6 flex flex-col z-10 shadow-lg transition-all duration-300">
        <div className="mb-6">
          <h2 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">Yeşil Rehber</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6 transition-colors">
            İstanbul'un yeşil alanlarını keşfedin, filtreleyin ve size en yakın parkı bulun.
          </p>
          
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Park adı veya adres ara..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setShowSearchSuggestions(true);
                  }}
                  className="w-full pl-10 pr-10 py-3 bg-gray-100 dark:bg-dark-green-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-primary transition-all text-gray-900 dark:text-white dark:placeholder-gray-500"
                />
                {searchTerm && (
                  <button 
                    onClick={() => {setSearchTerm(''); setSelectedSpace(null);}}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" />
                  </button>
                )}
              </div>
              
              {/* Search Suggestions */}
              <AnimatePresence>
                {showSearchSuggestions && searchSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-green-800 rounded-2xl shadow-xl border border-gray-100 dark:border-dark-green-700 z-50 overflow-hidden transition-all duration-300"
                  >
                    {searchSuggestions.map((space, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectSpace(space)}
                        className="w-full px-4 py-3 text-left hover:bg-green-50 dark:hover:bg-dark-green-700 transition-colors flex items-start gap-3 border-b last:border-none border-gray-100 dark:border-dark-green-700"
                      >
                        <MapPin className="w-4 h-4 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white transition-colors">{space.AD}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate w-64 transition-colors">{space.ADRES}</p>
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {searchTerm && filteredSpaces.length === 0 && (
                <div className="mt-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs rounded-xl flex items-center gap-2 transition-colors">
                  <AlertCircle className="w-4 h-4" />
                  Eşleşen yeşil alan bulunamadı.
                </div>
              )}
            </div>

            {/* Filters */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-900 dark:text-white mb-1 transition-colors">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-bold">Tür Filtrele</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {turOptions.map((tur) => (
                    <button
                      key={tur}
                      onClick={() => setSelectedTur(tur)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        selectedTur === tur
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-gray-100 dark:bg-dark-green-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-green-700'
                      }`}
                    >
                      {tur}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-900 dark:text-white mb-1 transition-colors">
                  <Accessibility className="w-4 h-4" />
                  <span className="text-sm font-bold">Erişilebilirlik</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedAccessibility('Tümü')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedAccessibility === 'Tümü'
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-gray-100 dark:bg-dark-green-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-green-700'
                    }`}
                  >
                    Tümü
                  </button>
                  <button
                    onClick={() => setSelectedAccessibility('Uygun')}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      selectedAccessibility === 'Uygun'
                        ? 'bg-primary text-white shadow-md'
                        : 'bg-gray-100 dark:bg-dark-green-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-dark-green-700'
                    }`}
                  >
                    Tekerlekli Sandalyeye Uygun
                  </button>
                </div>
              </div>
            </div>

            {/* Locate Button */}
            <button
              onClick={handleLocateUser}
              disabled={locating}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 dark:bg-primary text-white rounded-2xl text-sm font-bold hover:bg-black dark:hover:bg-primary-dark transition-all shadow-md disabled:opacity-50"
            >
              {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LucideNavigation className="w-4 h-4" />}
              {locating ? "Konum Alınıyor..." : "Etrafımdaki Parkları Bul"}
            </button>
          </div>
        </div>

        {/* Stats / Info */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          <div className="p-4 bg-green-50 dark:bg-dark-green-800/40 rounded-2xl border border-green-100 dark:border-dark-green-700 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <Trees className="w-4 h-4 text-green-700 dark:text-primary transition-colors" />
              <h4 className="text-xs font-bold text-green-800 dark:text-primary uppercase tracking-wider transition-colors">İstatistikler</h4>
            </div>
            <p className="text-sm text-green-900 dark:text-green-50/70 transition-colors">
              Şu an <b>{filteredSpaces.length}</b> yeşil alan görüntüleniyor.
            </p>
          </div>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 transition-all duration-300">
             <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-blue-700 dark:text-blue-400 transition-colors" />
              <h4 className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wider transition-colors">İpucu</h4>
            </div>
            <p className="text-sm text-blue-900 dark:text-blue-200/70 leading-relaxed transition-colors">
              Tekerlekli sandalye uyumluluğu için işaretçilere tıklayın.
            </p>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        {error && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-red-600 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3">
             <AlertCircle className="w-5 h-5" />
             <span className="text-sm font-medium">{error}</span>
             <button onClick={() => setError(null)} className="p-1 hover:bg-red-700 rounded-full transition-colors">
               <X className="w-4 h-4" />
             </button>
          </div>
        )}

        <MapContainer 
          center={[40.9926, 29.0341]} 
          zoom={13} 
          scrollWheelZoom={true}
          className={`w-full h-full ${theme === 'dark' ? 'dark-map' : ''}`}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url={theme === 'dark' 
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' 
              : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'}
          />
          
          <MapController center={[40.9926, 29.0341]} selectedSpace={selectedSpace} userLocation={userLocation} />

          {userLocation && (
            <Marker position={userLocation} icon={userIcon}>
              <Popup>Buradasınız</Popup>
            </Marker>
          )}
          
          {filteredSpaces.map((space, idx) => (
            <Marker 
              key={`${space.AD}-${idx}`} 
              position={[space.lat, space.lng]} 
              icon={createTreeIcon(selectedSpace?.AD === space.AD && selectedSpace?.lat === space.lat)}
              ref={(ref) => {
                markerRefs.current[`${space.AD}-${space.lat}-${space.lng}`] = ref;
              }}
            >
              <Tooltip direction="top" offset={[0, -20]} opacity={1}>
                <div className="p-1">
                  <p className="font-bold text-gray-900 dark:text-white">{space.AD}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold">{space.ILCE}</p>
                </div>
              </Tooltip>
              
              <Popup className="custom-popup">
                <div className="p-1 w-64">
                  <h3 className="font-display font-bold text-lg mb-2 text-gray-900 dark:text-white leading-tight">
                    {space.AD}
                  </h3>
                  
                  <div className="space-y-3">
                    {space["TÜR"] && (
                      <div className="inline-block px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 text-[10px] font-bold uppercase rounded-md mb-2">
                        {space["TÜR"]}
                      </div>
                    )}

                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">ADRES</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">{space.ADRES || 'Adres bilgisi bulunamadı.'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-dark-green-800">
                      {(() => {
                        const status = space["TEKERLEKLİ SANDALYE UYGUNLUK DURUMU"]?.toUpperCase();
                        let text = "Bilinmiyor";
                        let color = "text-gray-500";
                        let iconColorClass = "text-gray-400";

                        if (status === "UYGUN") {
                          text = "Uygun";
                          color = "text-green-600";
                          iconColorClass = "text-green-600";
                        } else if (status === "DEĞİL") {
                          text = "Uygun Değil";
                          color = "text-red-600";
                          iconColorClass = "text-red-600";
                        }

                        return (
                          <>
                            <Accessibility className={`w-4 h-4 ${iconColorClass}`} />
                            <p className={`text-sm font-semibold ${color}`}>
                              {text}
                            </p>
                          </>
                        );
                      })()}
                    </div>

                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${space.lat},${space.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-primary dark:bg-emerald-500 hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all shadow-sm no-underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Google Haritalar'da Yol Tarifi Al
                    </a>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}


"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function HeroSearch() {
  const router = useRouter();
  const typeRef = useRef<HTMLSpanElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const activityDropdownRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [cityValue, setCityValue] = useState("Dijon");
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [categories, setCategories] = useState<{value: string; label: string; count: number}[]>([]);

  const cities = [
    "Paris, France",
    "Lyon, France", 
    "Marseille, France",
    "Toulouse, France",
    "Nantes, France",
    "Strasbourg, France",
    "Montpellier, France",
    "Bordeaux, France",
    "Lille, France",
    "Rennes, France",
    "Reims, France",
    "Saint-Étienne, France",
    "Toulon, France",
    "Le Havre, France",
    "Dijon, France",
    "Angers, France",
    "Grenoble, France",
    "Villeurbanne, France",
    "Le Mans, France",
    "Aix-en-Provence, France"
  ];

  useEffect(() => {
    const texts = [
      "Bar d'ambiance",
      "Escape-game",
      "Réalité virtuelle",
      "Multi-activités",
      "Karting",
    ];
    const typingSpeed = 100;
    const erasingSpeed = 50;
    const initialDelay = 200;
    const newTextDelay = 1500;
    let textIndex = 0;
    let charIndex = 0;
    let mounted = true;

    const type = () => {
      if (!mounted || !typeRef.current || isTyping) return;
      if (charIndex < texts[textIndex].length) {
        typeRef.current.textContent = (typeRef.current.textContent || "") + texts[textIndex].charAt(charIndex);
        charIndex++;
        setTimeout(type, typingSpeed);
      } else {
        setTimeout(erase, newTextDelay);
      }
    };

    const erase = () => {
      if (!mounted || !typeRef.current || isTyping) return;
      if (charIndex > 0) {
        typeRef.current.textContent = texts[textIndex].substring(0, charIndex - 1);
        charIndex--;
        setTimeout(erase, erasingSpeed);
      } else {
        textIndex = (textIndex + 1) % texts.length;
        setTimeout(type, typingSpeed + 500);
      }
    };

    if (typeRef.current && !isTyping) {
      typeRef.current.textContent = "";
      const start = setTimeout(type, initialDelay);
      return () => { mounted = false; clearTimeout(start); };
    }
  }, [isTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setIsTyping(value.length > 0);
  };

  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCityValue(value);
    
    if (value.trim()) {
      const filtered = cities.filter(city => 
        city.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCities(filtered);
      setShowLocationModal(true);
    } else {
      setFilteredCities([]);
      setShowLocationModal(false);
    }
  };

  const handleCityInputFocus = () => {
    if (cityValue.trim()) {
      const filtered = cities.filter(city => 
        city.toLowerCase().includes(cityValue.toLowerCase())
      );
      setFilteredCities(filtered);
      setShowLocationModal(true);
    } else {
      setFilteredCities(cities);
      setShowLocationModal(true);
    }
  };

  const handleActivityFocus = async () => {
    try {
      const res = await fetch('/api/categories');
      const json = await res.json();
      setCategories(json.categories || []);
      setShowActivityModal(true);
    } catch (e) {
      setCategories([]);
      setShowActivityModal(true);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setCityValue("Autour de moi");
          setShowLocationModal(false);
          cityInputRef.current?.focus();
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
          alert("Impossible de récupérer votre position. Vérifiez que vous avez autorisé la géolocalisation.");
        }
      );
    } else {
      alert("La géolocalisation n'est pas supportée par votre navigateur.");
    }
  };

  const selectCity = (city: string) => {
    setCityValue(city);
    setShowLocationModal(false);
    cityInputRef.current?.focus();
  };

  const selectCategory = (value: string, label: string) => {
    setInputValue(label);
    setIsTyping(true);
    setShowActivityModal(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const city = (form.elements.namedItem("city") as HTMLInputElement).value;
    const activity = (form.elements.namedItem("activity") as HTMLInputElement).value;
    const params = new URLSearchParams();
    if (city && city !== "Autour de moi") params.set("q", city);
    if (userLocation) {
      params.set("lat", userLocation.lat.toString());
      params.set("lng", userLocation.lng.toString());
    }
    if (activity) params.set("category", activity);
    router.push(`/etablissements?${params.toString()}`);
  };

  // Fermer le dropdown si clic en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedInsideCity = cityInputRef.current?.contains(target);
      const clickedInsideCityDropdown = dropdownRef.current?.contains(target);
      const clickedInsideActivity = activityDropdownRef.current?.contains(target);
      if (!clickedInsideCity && !clickedInsideCityDropdown && !clickedInsideActivity) {
        setShowLocationModal(false);
        setShowActivityModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <form onSubmit={submit} className="bg-white rounded-xl shadow-lg border border-gray-200 relative overflow-visible">
        <div className="flex flex-col md:flex-row">
          {/* Left */}
          <div className="flex-1 flex items-center gap-3 px-4 py-3 relative">
            <span className="text-gray-500">📍</span>
            <div className="relative flex-1">
              <input
                ref={cityInputRef}
                name="city"
                value={cityValue}
                onChange={handleCityInputChange}
                onFocus={handleCityInputFocus}
                className="w-full outline-none text-gray-900 bg-transparent"
                placeholder="Dijon"
              />
              {showLocationModal && (
                <div ref={dropdownRef} className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-80 overflow-auto mt-2">
                  <button type="button"
                    onClick={getCurrentLocation}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
                  >
                    <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">✈️</span>
                    <span className="font-medium">Autour de moi</span>
                    <span className="ml-auto text-gray-400">→</span>
                  </button>
                  {filteredCities.map((city) => (
                    <button type="button"
                      key={city}
                      onClick={() => selectCity(city)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
                    >
                      <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-600">📍</span>
                      </span>
                      <span className="text-gray-900">{city}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="hidden md:block w-px bg-gray-200" />

          {/* Right */}
          <div className="flex-1 flex items-center gap-3 px-4 py-3 relative">
            <span className="text-gray-500">🎯</span>
            <div className="relative flex-1">
              <input
                name="activity"
                value={inputValue}
                onChange={handleInputChange}
                onFocus={handleActivityFocus}
                className="w-full outline-none text-gray-900 bg-transparent"
                aria-label="Type d'activité"
              />
              {!isTyping && (
                <span 
                  ref={typeRef} 
                  className="absolute left-0 text-gray-400 pointer-events-none typewriter-caret"
                  aria-hidden
                />
              )}

              {showActivityModal && (
                <div ref={activityDropdownRef} className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 max-h-80 overflow-auto mt-2">
                  <button type="button"
                    onClick={() => { setInputValue(""); setIsTyping(true); setShowActivityModal(false); }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
                  >
                    <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">🌐</span>
                    <span className="font-medium">Voir toutes les sorties</span>
                  </button>
                  {categories.map((c) => (
                    <button type="button" key={c.value}
                      onClick={() => selectCategory(c.value, c.value)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
                    >
                      <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">🎯</span>
                      <span className="text-gray-900 flex-1">{c.label}</span>
                      <span className="text-gray-500 text-sm">{c.count}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="md:w-auto p-2">
            <button type="submit" className="w-full h-full px-6 py-3 rounded-lg btn-gradient font-semibold">
              EXPLORER
            </button>
          </div>
        </div>
      </form>
    </>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Composant de barre de recherche principale pour l'application "Envie de sortir"
 * 
 * Fonctionnalités principales :
 * - Recherche par envie avec effet typewriter
 * - Sélection de ville avec autocomplétion
 * - Géolocalisation automatique
 * - Sélection du rayon de recherche
 * - Navigation vers la page de résultats
 * 
 * @returns {JSX.Element} Composant de barre de recherche
 */
export default function EnvieSearchBar() {
  const router = useRouter();
  
  // === RÉFÉRENCES DOM ===
  /** Référence pour l'élément d'affichage du typewriter */
  const typeRef = useRef<HTMLSpanElement>(null);
  /** Référence pour l'input de sélection de ville */
  const cityInputRef = useRef<HTMLInputElement>(null);
  /** Référence pour le dropdown de villes */
  const dropdownRef = useRef<HTMLDivElement>(null);

  // === ÉTAT LOCAL ===
  /** État indiquant si l'utilisateur est en train de taper */
  const [isTyping, setIsTyping] = useState(false);
  /** Valeur saisie dans le champ "envie" */
  const [inputValue, setInputValue] = useState("");
  /** Ville sélectionnée ou saisie */
  const [cityValue, setCityValue] = useState("");
  /** État d'affichage du dropdown de localisation */
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  /** Coordonnées GPS de l'utilisateur */
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  /** Liste des villes filtrées selon la saisie */
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  /** Rayon de recherche sélectionné (en km) */
  const [selectedRadius, setSelectedRadius] = useState(5);

  // === DONNÉES STATIQUES ===
  /** Liste des villes disponibles pour la recherche */
  const cities = [
    "Paris, France", "Lyon, France", "Marseille, France", "Toulouse, France", "Nantes, France",
    "Strasbourg, France", "Montpellier, France", "Bordeaux, France", "Lille, France", "Rennes, France",
    "Reims, France", "Saint-Étienne, France", "Toulon, France", "Le Havre, France", "Dijon, France",
    "Angers, France", "Grenoble, France", "Villeurbanne, France", "Le Mans, France", "Aix-en-Provence, France"
  ];

  /** Options disponibles pour le rayon de recherche */
  const radiusOptions = [
    { value: 1, label: "1 km" },
    { value: 3, label: "3 km" },
    { value: 5, label: "5 km" },
    { value: 10, label: "10 km" },
    { value: 20, label: "20 km" },
    { value: 50, label: "50 km" }
  ];

  // === EFFET TYPEWRITER ===
  /**
   * Effet qui gère l'animation typewriter dans le champ de recherche
   * 
   * Comportement :
   * - Tape les phrases caractère par caractère (gauche vers droite)
   * - Efface les phrases caractère par caractère (droite vers gauche)
   * - Cycle à travers toutes les phrases de suggestion
   * - Se désactive quand l'utilisateur commence à taper
   */
  useEffect(() => {
    /** Phrases utilisées pour l'effet typewriter (suggestions d'activités) */
    const typewriterPhrases = [
      "manger une crêpe au nutella",
      "boire une bière artisanale",
      "faire un laser game",
      "faire du patin à roulettes",
      "manger un tacos 3 viandes",
      "découvrir un bar d'ambiance",
      "manger une pizza au fromage",
      "faire du karting en famille",
      "boire un cocktail mojito",
      "faire un escape game",
      "manger un burger extra",
      "danser en boîte de nuit"
    ];

    // Configuration des vitesses d'animation
    const typingSpeed = 80;      // Vitesse de frappe (ms par caractère)
    const erasingSpeed = 50;     // Vitesse d'effacement (ms par caractère)
    const initialDelay = 500;    // Délai avant le début de l'animation
    const newTextDelay = 2000;   // Pause entre les phrases

    // Variables de contrôle de l'animation
    let textIndex = 0;  // Index de la phrase actuelle
    let charIndex = 0;  // Index du caractère actuel
    let mounted = true; // Flag pour éviter les fuites mémoire

    /**
     * Fonction récursive qui tape le texte caractère par caractère
     */
    const type = () => {
      if (!mounted || !typeRef.current || isTyping) return;
      
      if (charIndex < typewriterPhrases[textIndex].length) {
        // Ajoute le caractère suivant
        typeRef.current.textContent = typewriterPhrases[textIndex].substring(0, charIndex + 1);
        charIndex++;
        setTimeout(type, typingSpeed);
      } else {
        // Phrase terminée, commence l'effacement après une pause
        setTimeout(erase, newTextDelay);
      }
    };

    /**
     * Fonction récursive qui efface le texte caractère par caractère
     */
    const erase = () => {
      if (!mounted || !typeRef.current || isTyping) return;
      
      if (charIndex > 0) {
        charIndex--;
        // Retire le dernier caractère
        typeRef.current.textContent = typewriterPhrases[textIndex].substring(0, charIndex);
        setTimeout(erase, erasingSpeed);
      } else {
        // Texte effacé, passe à la phrase suivante
        textIndex = (textIndex + 1) % typewriterPhrases.length;
        setTimeout(type, typingSpeed + 500);
      }
    };

    // Démarre l'animation si les conditions sont réunies
    if (typeRef.current && !isTyping) {
      typeRef.current.textContent = "";
      const start = setTimeout(type, initialDelay);
      return () => { mounted = false; clearTimeout(start); };
    }
  }, [isTyping]);

  // === GESTIONNAIRES D'ÉVÉNEMENTS ===

  /**
   * Gère les changements dans le champ de saisie "envie"
   * Active/désactive l'effet typewriter selon la saisie
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    // Désactive le typewriter si l'utilisateur tape
    setIsTyping(value.length > 0);
  };

  /**
   * Gère les changements dans le champ de sélection de ville
   * Met à jour la liste filtrée et affiche le dropdown
   */
  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCityValue(value);
    
    if (value.trim()) {
      // Filtre les villes selon la saisie (insensible à la casse)
      const filtered = cities.filter(city => 
        city.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredCities(filtered);
      setShowLocationDropdown(true);
    } else {
      // Affiche toutes les villes si le champ est vide
      setFilteredCities(cities);
      setShowLocationDropdown(true);
    }
  };

  /**
   * Gère le focus sur le champ ville
   * Affiche le dropdown avec les suggestions appropriées
   */
  const handleCityInputFocus = () => {
    if (cityValue.trim()) {
      const filtered = cities.filter(city => 
        city.toLowerCase().includes(cityValue.toLowerCase())
      );
      setFilteredCities(filtered);
      setShowLocationDropdown(true);
    } else {
      setFilteredCities(cities);
      setShowLocationDropdown(true);
    }
  };

  /**
   * Active la géolocalisation pour localiser l'utilisateur
   * Utilise l'API navigator.geolocation du navigateur
   */
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setCityValue("Autour de moi");
          setShowLocationDropdown(false);
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

  /**
   * Sélectionne une ville dans le dropdown
   * @param {string} city - Nom de la ville sélectionnée
   */
  const selectCity = (city: string) => {
    console.log('🏙️ Sélection de la ville:', city);
    
    // Fermer immédiatement le dropdown
    setShowLocationDropdown(false);
    
    // Mettre à jour la valeur immédiatement
    setCityValue(city);
    
    // Focus sur l'input immédiatement
    cityInputRef.current?.focus();
  };

  /**
   * Track la recherche dans les analytics
   */
  const trackSearch = async (searchTerm: string, searchedCity?: string) => {
    try {
      await fetch('/api/analytics/search/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchTerm: searchTerm.trim(),
          resultCount: 0, // Sera mis à jour sur la page de résultats
          searchedCity: searchedCity,
          city: cityValue !== "Autour de moi" ? cityValue : undefined,
        }),
      });
    } catch (error) {
      console.error('Error tracking search:', error);
      // Ne pas bloquer l'utilisateur en cas d'erreur de tracking
    }
  };

  /**
   * Gère la soumission du formulaire de recherche
   * Valide les données et navigue vers la page de résultats
   */
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation : vérification que l'envie est renseignée
    if (!inputValue.trim()) {
      alert("Veuillez décrire votre envie !");
      return;
    }

    // Track la recherche (non-bloquant)
    trackSearch(inputValue, cityValue !== "Autour de moi" ? cityValue : undefined);

    // Construction des paramètres URL pour la recherche
    const params = new URLSearchParams();
    params.set("envie", inputValue.trim());
    params.set("rayon", selectedRadius.toString());
    
    // Ajout de la ville si renseignée (sauf géolocalisation)
    if (cityValue && cityValue !== "Autour de moi") {
      params.set("ville", cityValue);
    }
    
    // Ajout des coordonnées GPS si disponibles
    if (userLocation) {
      params.set("lat", userLocation.lat.toString());
      params.set("lng", userLocation.lng.toString());
    }

    // Navigation vers la page de résultats
    router.push(`/recherche/envie?${params.toString()}`);
  };

  // === GESTION DES CLICS EXTÉRIEURS ===
  // Supprimé temporairement pour éviter les conflits

  // === RENDU DU COMPOSANT ===
  return (
    <form onSubmit={submit} className="bg-white rounded-xl shadow-lg border border-gray-200 relative overflow-visible max-w-8xl mx-auto">
      <div className="flex flex-col md:flex-row gap-3 p-4">

        {/* === SECTION ENVIE === */}
        {/* Structure flex pour alignement parfait du label et input */}
        <div className="flex-[2] flex items-center gap-1">
          {/* Label "Envie de" */}
          <span className="text-orange-500 text-l font-small">Envie de</span>
          
          {/* Container pour input + typewriter avec positionnement relatif */}
          <div className="relative flex-1 flex items-center">
            {/* Champ de saisie principal avec hauteur fixe pour alignement */}
            <input
              name="envie"
              value={inputValue}
              onChange={handleInputChange}
              className="w-full px-4 py-3 h-12 outline-none text-gray-900 bg-transparent border-b-2 border-gray-200 focus:border-orange-500 transition-colors text-lg"
              aria-label="Décrivez votre envie"
            />
            
            {/* Effet typewriter (visible uniquement si pas de saisie) */}
            {/* Positionnement absolu avec centrage vertical parfait */}
            {!isTyping && (
              <span
                ref={typeRef}
                className="absolute left-0 inset-y-0 flex items-center text-gray-400 pointer-events-none text-base font-normal select-none whitespace-nowrap"
                style={{
                  borderRight: '1px solid #f97316', // Curseur orange clignotant
                  animation: 'blink 1s infinite',
                  height: '1.3em',
                  alignSelf: 'center',
                }}
                aria-hidden
              />
            )}
          </div>
        </div>

        {/* === SÉPARATEUR VISUEL === */}
        <div className="hidden md:block w-px bg-gray-200" />

        {/* === SECTION LOCALISATION === */}
        {/* Structure flex identique pour alignement parfait */}
        <div className="flex-1 flex items-center gap-3">
          {/* Icône de localisation */}
          <span className="text-gray-500">📍</span>
          
          {/* Container pour input ville avec dropdown */}
          <div className="relative flex-1 flex items-center">
            {/* Champ de saisie ville avec même hauteur que le champ envie */}
            <input
              ref={cityInputRef}
              name="city"
              value={cityValue}
              onChange={handleCityInputChange}
              onFocus={handleCityInputFocus}
              onBlur={() => {
                // Fermer le dropdown après un délai pour permettre la sélection
                setTimeout(() => {
                  setShowLocationDropdown(false);
                }, 200);
              }}
              className="w-full px-4 py-3 h-12 outline-none text-gray-900 bg-transparent border-b-2 border-gray-200 focus:border-orange-500 transition-colors text-l"
              placeholder="Dijon"
            />
            
            {/* === DROPDOWN DE GÉOLOCALISATION === */}
            {/* Menu déroulant pour sélection ville/géolocalisation */}
            {showLocationDropdown && (
              <div 
                ref={dropdownRef}
                className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-hidden w-full min-w-[300px]"
              >
                <div className="py-2 overflow-y-auto max-h-80">
                  
                  {/* Option "Autour de moi" avec géolocalisation */}
                  <button
                    type="button"
                    onClick={(e) => {
                      console.log('🖱️ Clic sur "Autour de moi"');
                      e.preventDefault();
                      e.stopPropagation();
                      getCurrentLocation();
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 cursor-pointer"
                  >
                    <span className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">✈️</span>
                    <span className="font-medium">Autour de moi</span>
                    <span className="ml-auto text-gray-400">→</span>
                  </button>

                  {/* Liste des villes filtrées selon la saisie */}
                  {filteredCities.map((city) => (
                    <button
                      type="button"
                      key={city}
                      onClick={(e) => {
                        console.log('🖱️ Clic sur la ville:', city);
                        e.preventDefault();
                        e.stopPropagation();
                        selectCity(city);
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 cursor-pointer"
                    >
                      <span className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-gray-600">📍</span>
                      </span>
                      <span className="text-gray-900">{city}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* === SÉPARATEUR VISUEL === */}
        <div className="hidden md:block w-px bg-gray-200" />

        {/* === SÉLECTEUR DE RAYON === */}
        {/* Dropdown pour choisir la distance de recherche */}
        <div className="flex flex-col items-center gap-1">
          <select
            value={selectedRadius}
            onChange={(e) => setSelectedRadius(Number(e.target.value))}
            className="px-2 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            aria-label="Sélectionner le rayon de recherche"
          >
            {radiusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* === BOUTON DE RECHERCHE === */}
        {/* Bouton principal de soumission du formulaire */}
        <div className="md:w-auto">
          <button 
            type="submit" 
            className="w-full h-full px-6 py-3 rounded-lg btn-gradient font-semibold text-white hover:shadow-lg transition-all duration-300"
          >
            Trouve-moi ça !
          </button>
        </div>
      </div>

      {/* === STYLES CSS PERSONNALISÉS === */}
      {/* Animation du curseur clignotant pour l'effet typewriter */}
      <style jsx>{`
        @keyframes blink {
          0%, 50% { border-right-color: #f97316; }
          51%, 100% { border-right-color: transparent; }
        }
      `}</style>
    </form>
  );
}

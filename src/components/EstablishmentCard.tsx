'use client';

import Link from 'next/link';
import { MapPin, Star, Heart, Share2, Flame, Calendar, Clock, Euro } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from '@/lib/fake-toast';
import styles from './EstablishmentCard.module.css';
import { isEventInProgress, isEventUpcoming } from '../lib/date-utils';

// Fonction pour déterminer la catégorie principale à partir des activités
function getMainCategory(establishment: any): string {
  if (!establishment.activities || !Array.isArray(establishment.activities)) {
    return 'établissement';
  }
  
  // Mapping des activités vers des labels courts français
  const activityLabels: Record<string, string> = {
    // VR & Jeux
    'realite_virtuelle': 'VR',
    'escape_game_horreur': 'Escape game',
    'escape_game_aventure': 'Escape game',
    'escape_game_familial': 'Escape game',
    'escape_game_immersif': 'Escape game',
    'laser_game': 'Laser game',
    'paintball_exterieur': 'Paintball',
    'paintball_interieur': 'Paintball',
    'salle_jeux_arcade': 'Arcade',
    'salle_jeux_moderne': 'Jeux',
    'casino': 'Casino',
    
    // Sport & Loisirs
    'bowling': 'Bowling',
    'billard_americain': 'Billard',
    'billard_francais': 'Billard',
    'snooker': 'Snooker',
    'ping_pong_bar': 'Ping-pong',
    'squash': 'Squash',
    'badminton': 'Badminton',
    'tennis_table': 'Tennis de table',
    'futsal': 'Futsal',
    'football_5vs5': 'Foot 5v5',
    'football_7vs7': 'Foot 7v7',
    'tennis_exterieur': 'Tennis',
    'padel': 'Padel',
    'basketball': 'Basket',
    'beach_volley': 'Beach volley',
    
    // Culture & Spectacle
    'cinema_mainstream': 'Cinéma',
    'cinema_art_essai': 'Cinéma art',
    'cinema_imax': 'Cinéma IMAX',
    'drive_in': 'Drive-in',
    'theatre_classique': 'Théâtre',
    'theatre_cafe': 'Théâtre café',
    'spectacle_humour': 'Humour',
    'concert_rock': 'Concert rock',
    'concert_jazz': 'Concert jazz',
    'concert_rap': 'Concert rap',
    'concert_electronique': 'Concert électro',
    'concert_classique': 'Concert classique',
    'concert_variete': 'Concert variété',
    
    // Musées & Expositions
    'musee_art': 'Musée art',
    'musee_histoire': 'Musée histoire',
    'musee_science': 'Musée science',
    'musee_insolite': 'Musée insolite',
    'galerie_art': 'Galerie',
    'centre_exposition': 'Exposition',
    'planetarium': 'Planétarium',
    
    // Nuit & Clubs
    'discotheque': 'Discothèque',
    'club_prive': 'Club privé',
    'boite_nuit_mainstream': 'Boîte de nuit',
    'club_techno': 'Club techno',
    'club_hip_hop': 'Club hip-hop',
    'club_latino': 'Club latino',
    'dancing_retro': 'Dancing rétro',
    'boite_estudiantine': 'Boîte étudiante',
    
    // Restauration
    'restaurant_gastronomique': 'Restaurant gastronomique',
    'restaurant_traditionnel': 'Restaurant traditionnel',
    'restaurant_familial': 'Restaurant familial',
    'bistrot': 'Bistrot',
    'brasserie_restaurant': 'Brasserie',
    'restaurant_rapide': 'Restaurant rapide',
    'restaurant_italien': 'Restaurant italien',
    'restaurant_asiatique': 'Restaurant asiatique',
    'restaurant_oriental': 'Restaurant oriental',
    'restaurant_mexicain': 'Restaurant mexicain',
    'restaurant_indien': 'Restaurant indien',
    'restaurant_veggie': 'Restaurant végétarien',
    'creperie': 'Crêperie',
    'pizzeria': 'Pizzeria',
    'kebab': 'Kebab',
    'tacos_mexicain': 'Tacos',
    'burger': 'Burger',
    'sandwich': 'Sandwich',
    'fish_and_chips': 'Fish & chips',
    'food_truck': 'Food truck',
    'friterie': 'Friterie',
    'poke_bowl': 'Poke bowl',
    
    // Bars & Boissons
    'bar_ambiance': 'Bar ambiance',
    'pub_traditionnel': 'Pub traditionnel',
    'brasserie_artisanale': 'Brasserie artisanale',
    'bar_cocktails': 'Bar cocktails',
    'bar_vins': 'Bar à vins',
    'bar_sports': 'Bar sportif',
    'rooftop_bar': 'Bar rooftop',
    'bar_karaoké': 'Bar karaoké',
    'bar_jeux': 'Bar jeux',
    'bar_bières': 'Bar bières',
    
    // Bien-être & Spa
    'spa_detente': 'Spa détente',
    'hammam_traditionnel': 'Hammam',
    'sauna_finlandais': 'Sauna',
    'spa_nordique': 'Spa nordique',
    'centre_massage': 'Massage',
    'institut_beaute': 'Institut beauté',
    'salon_coiffure_premium': 'Salon coiffure',
    'onglerie': 'Onglerie',
    
    // Aquatique
    'piscine_couverte': 'Piscine',
    'piscine_exterieure': 'Piscine extérieure',
    'centre_aquatique': 'Centre aquatique',
    'aqua_fitness': 'Aqua fitness',
    
    // Ateliers & Cours
    'atelier_cuisine': 'Atelier cuisine',
    'atelier_patisserie': 'Atelier pâtisserie',
    'atelier_poterie': 'Atelier poterie',
    'atelier_peinture': 'Atelier peinture',
    'cours_danse': 'Cours danse',
    'salle_musique': 'Salle musique',
    
    // Événements & Marchés
    'marche_nocturne': 'Marché nocturne',
    'marche_artisanal': 'Marché artisanal',
    'marche_vintage': 'Marché vintage',
    'festival_plein_air': 'Festival',
    'foire_commerciale': 'Foire',
    'salon_professionnel': 'Salon',
    'parc_attraction': 'Parc attraction'
  };
  
  // Prioriser certaines activités pour l'affichage
  const priorityActivities = [
    'realite_virtuelle',
    'escape_game_horreur', 'escape_game_aventure', 'escape_game_familial', 'escape_game_immersif',
    'laser_game',
    'paintball_exterieur', 'paintball_interieur',
    'bowling',
    'billard_americain', 'billard_francais',
    'cinema_mainstream', 'cinema_art_essai', 'cinema_imax',
    'theatre_classique', 'theatre_cafe',
    'discotheque', 'club_prive', 'boite_nuit_mainstream',
    'restaurant_gastronomique', 'restaurant_traditionnel',
    'bar_ambiance', 'pub_traditionnel', 'bar_cocktails'
  ];
  
  // Chercher la première activité prioritaire
  for (const activity of establishment.activities) {
    if (priorityActivities.includes(activity)) {
      return activityLabels[activity] || activity.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  }
  
  // Sinon, prendre la première activité avec son label
  if (establishment.activities.length > 0) {
    const firstActivity = establishment.activities[0];
    return activityLabels[firstActivity] || firstActivity.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  
  return 'Établissement';
}

interface EstablishmentCardProps {
  establishment: {
    id: string;
    name: string;
    slug: string;
    address: string;
    city?: string;
    category?: string;
    status: 'approved' | 'pending' | 'rejected';
    latitude?: number;
    longitude?: number;
    images?: Array<{
      id: string;
      url: string;
      altText?: string;
      isPrimary?: boolean;
    }>;
    events?: Array<{
      id: string;
      title: string;
      description?: string;
      startDate: string;
      endDate?: string;
      price?: number;
      maxCapacity?: number;
    }>;
    subscription?: 'FREE' | 'PREMIUM';
    // Pour la recherche par envie
    distance?: number;
    matchedTags?: string[];
    // Pour les notes (à implémenter plus tard)
    rating?: number;
    reviewCount?: number;
    // Nouvelles propriétés
    isHot?: boolean;
    description?: string;
    imageUrl?: string;
    priceMin?: number;
    priceMax?: number;
  };
  searchCenter?: { lat: number; lng: number };
  from?: string;
}

export default function EstablishmentCard({ 
  establishment, 
  searchCenter, 
  from = 'recherche' 
}: EstablishmentCardProps) {
  const { data: session } = useSession();
  const [isLiked, setIsLiked] = useState(false);
  const [isShared, setIsShared] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [upcomingEvent, setUpcomingEvent] = useState<any>(null);
  const [isEventCurrentlyInProgress, setIsEventCurrentlyInProgress] = useState(false);

  // Utiliser l'image principale du modèle
  const primaryImage = establishment.imageUrl || 
    (establishment.images?.find(img => img.isPrimary) || establishment.images?.[0])?.url;

  // Vérifier si l'établissement est en favori
  useEffect(() => {
    if (session?.user?.role === 'user') {
      checkFavoriteStatus();
    }
  }, [session, establishment.id]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await fetch('/api/user/favorites');
      if (response.ok) {
        const data = await response.json();
        const isFavorite = data.favorites.some((fav: any) => fav.establishment.id === establishment.id);
        setIsLiked(isFavorite);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des favoris:', error);
    }
  };

  // Récupérer le prochain événement
  useEffect(() => {
    const fetchUpcomingEvent = async () => {
      if (!establishment.slug) return;
      
      try {
        const response = await fetch(`/api/etablissements/${establishment.slug}/events`);
        if (response.ok) {
          const data = await response.json();
          const now = new Date();
          
          // Trouver les événements en cours et futurs avec gestion du fuseau horaire
          const upcomingEvents = data.events?.filter((event: any) => {
            return isEventInProgress(event.startDate, event.endDate) || isEventUpcoming(event.startDate);
          }) || [];
          
          if (upcomingEvents.length > 0) {
            // Trier par date de début et prendre le premier
            const nextEvent = upcomingEvents.sort((a: any, b: any) => 
              new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
            )[0];
            
            // Vérifier si l'événement est en cours avec gestion du fuseau horaire
            const inProgress = isEventInProgress(nextEvent.startDate, nextEvent.endDate);
            
            setUpcomingEvent(nextEvent);
            setIsEventCurrentlyInProgress(inProgress);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des événements:', error);
      }
    };

    fetchUpcomingEvent();
  }, [establishment.slug]);
  
  // Calculer la distance si on a les coordonnées
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const distance = searchCenter && establishment.latitude && establishment.longitude 
    ? calculateDistance(searchCenter.lat, searchCenter.lng, establishment.latitude, establishment.longitude)
    : establishment.distance;

  // Déterminer le statut d'ouverture (déterministe basé sur l'ID)
  const isOpen = establishment.id.charCodeAt(establishment.id.length - 1) % 10 < 7; // 70% de chance d'être ouvert

  // Déterminer si l'établissement est "hot" (déterministe basé sur l'ID)
  const isHot = establishment.isHot || establishment.id.charCodeAt(establishment.id.length - 2) % 10 < 2; // 20% de chance d'être hot

  // Formater l'adresse pour n'afficher que la ville
  const formatAddress = (address: string) => {
    const parts = address.split(',');
    return parts[parts.length - 3]?.trim() || address;
  };

  // Tronquer la description
  const truncateText = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  // Formater la date de l'événement
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
    
    if (isToday) {
      return `Aujourd'hui • ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (isTomorrow) {
      return `Demain • ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
      const dayNumber = date.getDate();
      const monthName = date.toLocaleDateString('fr-FR', { month: 'short' });
      const time = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      return `${dayName} ${dayNumber} ${monthName} • ${time}`;
    }
  };

  // Déterminer si l'établissement est en période de mise en avant (Premium + événement)
  const isPremiumHighlighted = establishment.subscription === 'PREMIUM' && upcomingEvent;

  // Gestion des interactions
  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Vérifier que l'utilisateur est un utilisateur simple (pas professionnel)
    if (!session || (session.user.userType !== 'user' && session.user.role !== 'user')) {
      toast.error('Vous devez être connecté pour ajouter aux favoris');
      return;
    }

    setIsLoading(true);
    try {
      if (isLiked) {
        // Retirer des favoris
        const response = await fetch(`/api/user/favorites`);
        
        if (response.ok) {
          const data = await response.json();
          const favorite = data.favorites.find((fav: any) => fav.establishment.id === establishment.id);
          
          if (favorite) {
            const deleteResponse = await fetch(`/api/user/favorites/${favorite.id}`, {
              method: 'DELETE'
            });
            
            if (deleteResponse.ok) {
              setIsLiked(false);
              toast.success('Retiré des favoris');
            }
          }
        }
      } else {
        // Ajouter aux favoris
        const response = await fetch('/api/user/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ establishmentId: establishment.id })
        });

        if (response.ok) {
          setIsLiked(true);
          toast.success('Ajouté aux favoris');
        } else {
          const error = await response.json();
          toast.error(error.error || 'Erreur lors de l\'ajout aux favoris');
        }
      }
    } catch (error) {
      console.error('Erreur lors de la gestion des favoris:', error);
      toast.error('Erreur lors de la gestion des favoris');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsShared(true);
    setTimeout(() => setIsShared(false), 1000);
  };

  return (
    <Link 
      href={`/etablissements/${establishment.slug}?from=${from}`}
      className="group block"
    >
      <div className={`relative bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden establishment-card mb-6 flex flex-col min-h-110 ${
        isHot ? 'ring-2 ring-orange-200 ring-opacity-50' : ''
      } ${
        isPremiumHighlighted ? `ring-2 ring-orange-400 ring-opacity-80 ${styles.premiumBorder}` : ''
      }`}>
        
        {/* Image bandeau (hauteur agrandie) */}
        <div className="relative h-48 md:h-52 bg-gradient-to-br from-gray-100 to-gray-200">
          {primaryImage ? (
            <img 
              src={primaryImage} 
              alt={establishment.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-3xl mb-1">🏢</div>
                <div className="text-xs">Aucune image</div>
              </div>
            </div>
          )}
          
          {/* Boutons d'interaction - VERTICAUX EN HAUT À DROITE, 100% TRANSPARENTS */}
          <div className="absolute top-10 right-2 flex flex-col gap-2">
            {/* Bouton Like */}
            <button
              onClick={handleLike}
              disabled={isLoading}
              className={`p-1 transition-all duration-200 hover:scale-130 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={isLiked ? "Retirer des favoris" : "Ajouter aux favoris"}
            >
              <Heart 
                className={`w-4 h-4 ${isLiked ? 'text-red-500 fill-current' : 'text-white'}`} 
              />
            </button>
            
            {/* Bouton Share */}
            <button
              onClick={handleShare}
              className="p-1 transition-all duration-200 hover:scale-130"
              title="Partager"
            >
              <Share2 
                className={`w-4 h-4 ${isShared ? 'text-blue-400' : 'text-white'}`} 
              />
            </button>
          </div>

          {/* Statut d'ouverture (coin supérieur gauche) - seulement si pas d'événement */}
          {!upcomingEvent && (
            <div className="absolute top-2 left-2">
              <div className={`w-2.5 h-2.5 rounded-full ${isOpen ? 'bg-green-600' : 'bg-red-600'}`}></div>
            </div>
          )}

          {/* Flamme "Hot" (coin inférieur droit) - seulement si pas d'événement */}
          {isHot && !upcomingEvent && (
            <div className="absolute bottom-2 right-2" title="Ce lieu a le feu cette semaine 🔥">
              <div className={`flex items-center gap-1 px-2 py-1 bg-purple-600 rounded-full ${styles.tendanceBadge}`}>
                <Flame className="w-3 h-3 text-white" />
                <span className="text-white text-xs font-medium">tendance</span>
              </div>
            </div>
          )}

          {/* Badge catégorie (coin supérieur droit) - FOND PINK */}
          <div className="absolute top-2 right-2">
            <div className="px-2 py-1 bg-pink-600 bg-opacity-50 text-white text-xs rounded-full font-regular">
              {getMainCategory(establishment)}
            </div>
          </div>

          {/* Overlay événement à venir/en cours - EN BAS, HAUTEUR GÉNÉREUSE */}
          {upcomingEvent && (
            <div className={`absolute bottom-0 left-0 right-0 ${styles.overlayEvent} ${styles.overlayEventMobile}`}>
              <div className="space-y-1">
                {/* Première ligne : Badge + Titre */}
                <div className="flex items-start gap-3">
                  <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${styles.eventBadge} ${
                    isEventCurrentlyInProgress 
                      ? 'bg-green-500 text-white' 
                      : 'bg-yellow-400 text-black'
                  }`}>
                    <Calendar className="w-3 h-3" />
                    {isEventCurrentlyInProgress ? 'En cours' : 'À venir'}
                  </div>
                  
                  <h4 className={`font-bold text-lg leading-tight flex-1 ${styles.eventTitle} ${
                    isEventCurrentlyInProgress ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {upcomingEvent.title}
                  </h4>
                </div>

                {/* Deuxième ligne : Date/heure et prix */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white text-sm">
                    <Clock className="w-4 h-4" />
                    <span className={styles.eventDate}>{formatEventDate(upcomingEvent.startDate)}</span>
                  </div>

                  {upcomingEvent.price && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-black-100 bg-opacity-50 rounded-full text-white text-sm font-medium">
                      <Euro className="w-4 h-4" />
                      <span>{upcomingEvent.price}€</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Corps de la card */}
        <div className="p-4 flex flex-col flex-grow">
          
          {/* Contenu principal */}
          <div className="flex-grow space-y-3">
            {/* 1ère ligne : Nom + Distance */}
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900 text-base line-clamp-1 flex-1">
                {establishment.name}
              </h3>
              {distance && (
                <span className="ml-2 px-2 py-1 bg-white text-red-500 text-xs rounded-full border border-red-500 whitespace-nowrap">
                  {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`}
                </span>
              )}
            </div>

            {/* 2ème ligne : Note + Avis */}
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="font-semibold text-gray-900 text-sm">4.2</span>
              <span className="text-gray-500 text-xs">(24 avis)</span>
            </div>

            {/* 3ème ligne : Description courte */}
            {establishment.description && (
              <p className="text-gray-600 text-sm leading-relaxed">
                {truncateText(establishment.description, 65)}
              </p>
            )}

            {/* 4ème ligne : Tags (max 2) - MASQUÉS VISUELLEMENT mais logique conservée */}
            {/* {establishment.matchedTags && establishment.matchedTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {establishment.matchedTags.slice(0, 2).map((tag, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-orange-40 text-purple-700 text-xs rounded-full border border-orange-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )} */}
          </div>

          {/* Contenu en bas (adresse et prix) */}
          <div className="mt-auto pt-3 space-y-3">
            {/* Adresse */}
            <div className="flex items-center gap-1 text-gray-400 text-xs">
              <MapPin className="w-3 h-3" />
              <span>{formatAddress(establishment.address)}</span>
            </div>

            {/* Prix (si disponible) */}
            {(establishment.priceMin || establishment.priceMax) && (
              <div className="flex justify-end">
                <span className="px-2 py-1 bg-white-50 text-purple-500 text-xs rounded-full border border-orange-200">
                  {establishment.priceMin && establishment.priceMax 
                    ? `${establishment.priceMin}-${establishment.priceMax}€`
                    : establishment.priceMin 
                      ? `À partir de ${establishment.priceMin}€`
                      : `Jusqu'à ${establishment.priceMax}€`
                  }
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

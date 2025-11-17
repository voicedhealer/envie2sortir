'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, TrendingUp, Maximize2, X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from './Toast';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface EventCardNewProps {
  event: {
    id: string;
    title: string;
    description: string | null;
    startDate: string;
    endDate?: string | null;
    price?: number | null;
    priceUnit?: string | null;
    maxCapacity?: number | null;
    imageUrl?: string | null;
    location?: string;
    modality?: string;
    establishmentId?: string;
    status?: 'ongoing' | 'upcoming';
  };
  establishment?: {
    name?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    userId?: string;
  } | null;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  initials: string;
}

interface EngagementData {
  stats: {
    envie: number;
    'grande-envie': number;
    decouvrir: number;
    'pas-envie': number;
  };
  gaugePercentage: number;
  eventBadge?: {
    type: string;
    label: string;
    color: string;
  } | null;
  userEngagement?: string | null;
  totalEngagements: number;
  usersByEngagement: {
    envie: User[];
    'grande-envie': User[];
    decouvrir: User[];
    'pas-envie': User[];
  };
}

export default function EventCardNew({ event, establishment }: EventCardNewProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast, ToastContainer } = useToast();
  
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [justVoted, setJustVoted] = useState<string | null>(null);
  const [engagementData, setEngagementData] = useState<EngagementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  // Mapping des niveaux d'engagement avec les nouveaux termes
  const excitementLevels = [
    { 
      id: 'grande-envie', 
      emoji: '🔥',
      label: 'Ultra envie !',
      sublabel: 'Je compte les heures',
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50',
      score: 100
    },
    { 
      id: 'envie', 
      emoji: '⭐',
      label: 'Envie d\'y être',
      sublabel: "J'ai hâte",
      color: 'from-yellow-400 to-orange-500',
      bgColor: 'bg-yellow-50',
      score: 75
    },
    { 
      id: 'decouvrir', 
      emoji: '👀',
      label: 'Intrigué ?',
      sublabel: 'Pourquoi pas',
      color: 'from-blue-400 to-cyan-500',
      bgColor: 'bg-blue-50',
      score: 50
    },
    { 
      id: 'pas-envie', 
      emoji: '❄️',
      label: 'Pas envie !',
      sublabel: 'Ça ne me parle pas',
      color: 'from-gray-400 to-gray-600',
      bgColor: 'bg-gray-50',
      score: 25
    },
  ];

  // Charger les données d'engagement au montage
  useEffect(() => {
    fetchEngagementData();
  }, [event.id]);

  const fetchEngagementData = async () => {
    try {
      const response = await fetch(`/api/events/${event.id}/engage`);
      if (response.ok) {
        const data = await response.json();
        setEngagementData(data);
        setSelectedLevel(data.userEngagement);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'engagement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (levelId: string) => {
    if (status === 'unauthenticated') {
      router.push('/auth');
      return;
    }

    if (status === 'loading') {
      return;
    }

    // Vérifier si l'utilisateur est le propriétaire de l'établissement
    if (session?.user?.id && session.user.id === establishment?.userId) {
      showToast('Vous êtes le propriétaire de cet établissement, vous ne pouvez donc pas voter', 'info');
      return;
    }

    const isAlreadySelected = selectedLevel === levelId;
    
    if (isAlreadySelected) {
      // Désélectionner
      setSelectedLevel(null);
      return;
    }

    setLoading(true);
    setJustVoted(levelId);
    
    try {
      const response = await fetch(`/api/events/${event.id}/engage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: levelId }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'engagement');
      }

      const data = await response.json();

      // Mise à jour des données
      setEngagementData(data);
      setSelectedLevel(data.userEngagement);

      // Afficher notification si nouveau badge
      if (data.newBadge) {
        showToast(`🏆 Badge débloqué: ${data.newBadge.name}!`, 'success', 3000);
      } else {
        showToast("Ton vote est pris en compte, Merci ! 🎉", 'success', 2000);
      }

      setTimeout(() => setJustVoted(null), 2000);

    } catch (error) {
      console.error('Erreur:', error);
      showToast('Une erreur est survenue. Veuillez réessayer.', 'error');
      setSelectedLevel(null);
    } finally {
      setLoading(false);
    }
  };

  // Formater la date et l'heure
  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
    
    if (isToday) {
      return 'Aujourd\'hui';
    } else if (isTomorrow) {
      return 'Demain';
    } else {
      return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    }
  };

  // Déterminer le statut de l'événement (utiliser le champ status de l'API)
  const getEventStatus = () => {
    // Si l'API fournit un statut, l'utiliser directement
    if (event.status) {
      if (event.status === 'ongoing') {
        return { status: 'in-progress', label: 'Événement en cours' };
      } else if (event.status === 'upcoming') {
        return { status: 'upcoming', label: 'Événement à venir' };
      }
    }
    
    // Fallback : calculer le statut localement si l'API ne fournit pas de statut
    const now = new Date();
    const eventStart = new Date(event.startDate);
    const eventEnd = event.endDate ? new Date(event.endDate) : eventStart;
    
    if (eventStart > now) {
      return { status: 'upcoming', label: 'Événement à venir' };
    } else if (eventStart <= now && eventEnd >= now) {
      return { status: 'in-progress', label: 'Événement en cours' };
    } else {
      return { status: 'past', label: 'Événement terminé' };
    }
  };

  const eventStatus = getEventStatus();

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading && !engagementData) {
    return (
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200"></div>
          <div className="p-6 space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!engagementData) return null;

  const totalUsers = engagementData.totalEngagements;
  const baseScore = Math.round(engagementData.gaugePercentage);
  
  // Calcul du score "Méga Feu" - peut dépasser 100%
  // Si très haute participation, on peut aller jusqu'à 150%
  const participationBonus = totalUsers > 10 ? Math.min((totalUsers - 10) * 2, 50) : 0;
  const avgScore = Math.min(baseScore + participationBonus, 150);
  
  // Détermine si on est en mode "Méga Feu"
  const isMegaFire = avgScore > 100;

  const avatarColors = [
    'bg-pink-500', 'bg-purple-500', 'bg-blue-500', 'bg-green-500', 
    'bg-yellow-500', 'bg-red-500', 'bg-indigo-500', 'bg-teal-500',
    'bg-orange-500', 'bg-cyan-500', 'bg-fuchsia-500', 'bg-lime-500',
    'bg-rose-500', 'bg-violet-500', 'bg-sky-500', 'bg-emerald-500'
  ];

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header avec gradient + image de l'événement - CLIQUABLE */}
        <div
          onClick={() => setIsAccordionOpen(!isAccordionOpen)}
          className="relative min-h-[200px] bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 overflow-hidden w-full text-left hover:from-orange-600 hover:via-red-600 hover:to-pink-600 transition-all duration-300 group cursor-pointer"
        >
          {/* Pattern de fond */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }} />
          </div>
          
          <div className="relative flex flex-col md:flex-row gap-4 p-4 md:p-6">
            {/* Zone image de l'événement */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.stopPropagation(); // Empêcher l'ouverture de l'accordéon
                setShowImageModal(true);
              }}
              className="relative w-full md:w-40 h-40 md:h-full flex-shrink-0 rounded-xl overflow-hidden bg-white/10 backdrop-blur-sm border-2 border-white/20 group"
            >
              {event.imageUrl ? (
                <img 
                  src={event.imageUrl}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`w-full h-full flex items-center justify-center ${
                  eventStatus.status === 'in-progress' 
                    ? 'bg-green-100' 
                    : 'bg-yellow-100'
                }`}>
                  <Calendar className={`w-12 h-12 ${
                    eventStatus.status === 'in-progress' 
                      ? 'text-green-600' 
                      : 'text-yellow-600'
                  }`} />
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.button>

            {/* Infos de l'événement */}
            <div className="flex-1 flex flex-col justify-center text-white">
              <h3 className="text-xl md:text-2xl mb-2 text-center md:text-left font-bold">{event.title}</h3>
              
              {/* Description de l'événement */}
              {event.description && (
                <p className="text-sm opacity-90 mb-2 text-center md:text-left leading-relaxed">
                  {event.description}
                </p>
              )}
              
              {/* Modalité en petit */}
              {(event.modality || establishment?.name) && (
                <p className="text-xs opacity-75 mb-4 text-center md:text-left">
                  {event.modality || establishment?.name}
                </p>
              )}
              
              <div className="flex flex-wrap justify-center md:justify-start gap-2">
                {/* Badge de statut */}
                <div className={`flex items-center gap-1 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm ${
                  eventStatus.status === 'in-progress' 
                    ? 'bg-emerald-600 text-white border border-white' 
                    : eventStatus.status === 'upcoming'
                    ? 'bg-yellow-400 text-black'
                    : 'bg-gray-500/30 text-gray-100'
                }`}>
                  <span className="text-xs font-medium">{eventStatus.label}</span>
                </div>
                
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm">
                  <Calendar className={`w-3 h-3 ${
                    eventStatus.status === 'in-progress' 
                      ? 'text-green-600' 
                      : 'text-yellow-600'
                  }`} />
                  <span>{formatEventDate(event.startDate)}</span>
                </div>
                <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm">
                  <Clock className="w-3 h-3" />
                  <span>{formatEventTime(event.startDate)}</span>
                </div>
                {event.endDate && (
                  <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm">
                    <Clock className="w-3 h-3" />
                    <span>Fin: {formatEventTime(event.endDate)}</span>
                  </div>
                )}
                {event.price !== null && event.price !== undefined && event.price > 0 && (
                  <div className="flex items-center gap-1 bg-white/30 backdrop-blur-sm rounded-full px-3 py-1.5 text-sm font-semibold">
                    <span>€ {event.price}€{event.priceUnit ? ` ${event.priceUnit}` : ''}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Chevron pour l'accordéon avec effet halo/onde */}
          <div className="absolute top-4 right-4">
            {/* Ondes de pulsation ralenties */}
            <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" style={{ animationDuration: '3s' }}></div>
            <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" style={{ animationDelay: '1s', animationDuration: '3s' }}></div>
            <div className="absolute inset-0 rounded-full bg-white/10 animate-ping" style={{ animationDelay: '2s', animationDuration: '3s' }}></div>
            
            {/* Container principal */}
            <div className="relative bg-white/20 backdrop-blur-sm rounded-full p-2 group-hover:bg-white/30 transition-colors">
              {isAccordionOpen ? (
                <ChevronUp className="w-5 h-5 text-white" />
              ) : (
                <ChevronDown className="w-5 h-5 text-white" />
              )}
            </div>
          </div>
        </div>

        {/* Contenu de l'accordéon - Niveau d'engagement et vote */}
        <AnimatePresence>
          {isAccordionOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="p-4 md:p-6">
                {/* Niveau d'excitation moyen */}
                <div className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Niveau d'envie global</p>
                  <p className="text-xs text-gray-500">{totalUsers} personnes ont voté</p>
                </div>
              </div>
              <div className="text-center sm:text-right">
                <div className="text-2xl md:text-3xl font-bold">{avgScore}%</div>
                <div className="text-xs text-gray-500">
                  {avgScore > 150 ? '💥 MÉGA FEU !' : 
                   avgScore > 100 ? '🔥 FEU VIOLET !' : 
                   avgScore > 80 ? '🔥 Ultra chaud' : 
                   avgScore > 60 ? '⭐ Très chaud' : 
                   avgScore > 40 ? '👀 Intrigué' : '❄️ Froid'}
                </div>
              </div>
            </div>

            {/* Barre de progression globale - Méga Feu */}
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(avgScore, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`h-full rounded-full transition-all duration-0.8s ease-out ${
                  isMegaFire 
                    ? 'jauge-mega-fire' // CSS custom pour le Méga Feu avec animation
                    : '' // Pas de classe par défaut, on utilise le style inline
                }`}
                style={{
                  background: 'linear-gradient(to right, #4CAF50 0%, #8BC34A 25%, #FFC107 50%, #FF9800 75%, #F44336 100%, #9C27B0 125%, #6A1B9A 150%)',
                  backgroundSize: isMegaFire ? '150% 100%' : '100% 100%',
                  backgroundPosition: 'left center',
                  boxShadow: avgScore >= 150 ? '0 0 20px rgba(156, 39, 176, 0.6)' : undefined
                }}
              />
              {/* Extension violette pour les scores > 100% */}
              {isMegaFire && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((avgScore - 100) * 2, 100)}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-purple-700 rounded-full absolute top-0 left-0 opacity-80"
                  style={{
                    boxShadow: avgScore >= 150 ? '0 0 25px rgba(156, 39, 176, 0.8)' : '0 0 15px rgba(156, 39, 176, 0.4)'
                  }}
                />
              )}
            </div>
          </div>

          {/* Niveaux d'excitation */}
          <div className="mb-4">
            <p className="text-sm mb-3 font-medium">Quel est votre niveau d'envie ?</p>
            
            <div className="space-y-2">
              {excitementLevels.map((level) => {
                const isSelected = selectedLevel === level.id;
                const hasJustVoted = justVoted === level.id;
                const count = engagementData.stats[level.id as keyof typeof engagementData.stats] || 0;
                const percentage = totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0;

                return (
                  <div key={level.id} className="relative">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleVote(level.id)}
                      disabled={loading}
                      className={`
                        w-full rounded-xl p-4 transition-all duration-200 text-left relative overflow-hidden
                        ${isSelected 
                          ? `bg-gradient-to-r ${level.color} text-white shadow-lg` 
                          : `${level.bgColor} hover:shadow-md`
                        }
                        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      {/* Animation de vote - badge +1 */}
                      <AnimatePresence>
                        {hasJustVoted && (
                          <motion.div
                            initial={{ scale: 0, y: 0, opacity: 1 }}
                            animate={{ scale: 1, y: -40, opacity: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 1 }}
                            className="absolute top-4 right-12 text-2xl pointer-events-none z-10"
                          >
                            +1
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex items-center gap-3 mb-3">
                        {/* Animation de l'emoji lors du vote */}
                        <motion.span
                          animate={hasJustVoted ? {
                            scale: [1, 1.5, 1],
                            rotate: [0, 10, -10, 0]
                          } : {}}
                          transition={{ duration: 0.5 }}
                          className="text-3xl"
                        >
                          {level.emoji}
                        </motion.span>
                        
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                            {level.label}
                          </p>
                          <p className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-600'}`}>
                            {level.sublabel}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <motion.div 
                            className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-gray-900'}`}
                            animate={hasJustVoted ? { scale: [1, 1.3, 1] } : {}}
                            transition={{ duration: 0.3 }}
                          >
                            {count}
                          </motion.div>
                          <div className={`text-xs ${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                            {percentage}%
                          </div>
                        </div>
                      </div>

                      {/* Preview des avatars avec badges */}
                      {count > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex -space-x-2">
                            {engagementData?.usersByEngagement[level.id as keyof typeof engagementData.usersByEngagement]?.slice(0, 8).map((user, i) => (
                              <div key={user.id} className="relative group">
                                <div 
                                  className={`w-6 h-6 border-2 border-white rounded-full ${avatarColors[i % avatarColors.length]} transition-transform group-hover:scale-110 flex items-center justify-center text-white text-[10px] font-bold`}
                                >
                                  {user.initials}
                                </div>
                                {/* Badge emoji sur l'avatar */}
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center text-[8px]">
                                  {level.emoji}
                                </div>
                              </div>
                            ))}
                            {count > 8 && (
                              <div className={`w-6 h-6 rounded-full ${isSelected ? 'bg-white/20 border-white' : 'bg-gray-200 border-white'} border-2 flex items-center justify-center`}>
                                <span className={`text-[10px] ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                                  +{count - 8}
                                </span>
                              </div>
                            )}
                          </div>

                        </div>
                      )}

                      {/* Liste des noms - affichée par défaut avec limite */}
                      {count > 0 && engagementData?.usersByEngagement[level.id as keyof typeof engagementData.usersByEngagement] && (
                        <div className="mt-3">
                          {/* Ligne de séparation */}
                          <div className={`w-full h-px mb-3 ${isSelected ? 'bg-white/30' : 'bg-gray-200'}`}></div>
                          <div className="flex flex-wrap gap-2">
                            {engagementData.usersByEngagement[level.id as keyof typeof engagementData.usersByEngagement]
                              .slice(0, 25) // Limite à 25 noms
                              .map((user) => (
                                <div
                                  key={user.id}
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    isSelected 
                                      ? 'bg-white/20 text-white border border-white/30' 
                                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                                  }`}
                                >
                                  {user.firstName}
                                </div>
                              ))}
                            
                            {/* Bouton "+X autres" si il y a plus de 25 participants */}
                            {engagementData.usersByEngagement[level.id as keyof typeof engagementData.usersByEngagement].length > 25 && (
                              <div
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  isSelected 
                                    ? 'bg-white/10 text-white/80 border border-white/20' 
                                    : 'bg-gray-50 text-gray-500 border border-gray-300'
                                }`}
                              >
                                +{engagementData.usersByEngagement[level.id as keyof typeof engagementData.usersByEngagement].length - 25} autres
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Message de motivation - Méga Feu */}
          <div className={`rounded-xl p-4 text-center ${
            avgScore > 150 
              ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300' 
              : avgScore > 100 
              ? 'bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200'
              : 'bg-gradient-to-r from-orange-50 to-red-50'
          }`}>
            <p className={`text-sm ${
              avgScore > 100 ? 'text-purple-700 font-medium' : 'text-gray-600'
            }`}>
              {avgScore > 150 
                ? "💥 MÉGA FEU ! L'événement va être LEGENDAIRE ! 🔥💜" 
                : avgScore > 100 
                ? "🔥 FEU VIOLET ! L'ambiance va exploser ! 💜" 
                : avgScore > 80 
                ? "🔥 L'ambiance s'annonce explosive !" 
                : avgScore > 60 
                ? "⭐ Ça va être sympa !" 
                : avgScore > 40 
                ? "👀 Les gens sont curieux..."
                : "Pas encore convaincu ? Viens quand même !"
              }
            </p>
          </div>
                </div>
              </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toast Container */}
      <ToastContainer />

      {/* Modal de l'image en plein écran */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4"
            onClick={() => setShowImageModal(false)}
          >
            <div className="relative max-w-4xl w-full">
              <button
                onClick={() => setShowImageModal(false)}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <motion.img
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                src={event.imageUrl || ''}
                alt={event.title}
                className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

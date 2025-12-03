'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSupabaseSession } from '@/hooks/useSupabaseSession';
import { useRouter } from 'next/navigation';
import { Brain, TrendingUp, Target, BarChart3, Users, CheckCircle, AlertCircle } from 'lucide-react';
import ValidationModal from '@/components/ValidationModal';

interface LearningStats {
  totalPatterns: number;
  correctedPatterns: number;
  accuracy: number;
  mostCommonTypes: Array<{ type: string; count: number }>;
}

interface LearningPattern {
  id: string;
  name: string;
  detectedType: string;
  correctedType?: string;
  googleTypes: string[];
  keywords: string[];
  confidence: number;
  isCorrected: boolean;
  correctedBy?: string;
  createdAt: string;
  updatedAt: string;
}

interface TypeOption {
  value: string;
  label: string;
}

export default function LearningDashboard() {
  const { session, loading: sessionLoading } = useSupabaseSession();
  const router = useRouter();
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [patterns, setPatterns] = useState<LearningPattern[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingPattern, setEditingPattern] = useState<string | null>(null);
  const [correctedType, setCorrectedType] = useState<string>('');
  const [validationModal, setValidationModal] = useState<{
    isOpen: boolean;
    patternId: string;
    patternName: string;
    detectedType: string;
    confidence?: number;
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const hasRedirectedRef = useRef(false);
  const hasFetchedRef = useRef(false);

  // Options de types d'établissements (organisées par catégories) - LISTE COMPLÈTE
  const typeOptions: TypeOption[] = [
    // 🏢 TYPES GÉNÉRIQUES
    { value: 'restaurant_general', label: '🏢 Restaurant (général)' },
    { value: 'bar_general', label: '🏢 Bar (général)' },
    
    // 🍽️ RESTAURANTS SPÉCIALISÉS
    { value: 'restaurant_gastronomique', label: '⭐ Restaurant gastronomique' },
    { value: 'restaurant_traditionnel', label: '🍽️ Restaurant traditionnel' },
    { value: 'restaurant_familial', label: '👨‍👩‍👧‍👦 Restaurant familial' },
    { value: 'bistrot', label: '🍽️ Bistrot' },
    
    // 🌍 CUISINES DU MONDE
    { value: 'restaurant_italien', label: '🍝 Restaurant italien' },
    { value: 'restaurant_japonais', label: '🍣 Restaurant japonais' },
    { value: 'restaurant_chinois', label: '🥢 Restaurant chinois' },
    { value: 'restaurant_thai', label: '🌶️ Restaurant thaï' },
    { value: 'restaurant_vietnamien', label: '🍜 Restaurant vietnamien' },
    { value: 'restaurant_coreen', label: '🥢 Restaurant coréen' },
    { value: 'restaurant_asiatique', label: '🍜 Restaurant asiatique' },
    { value: 'restaurant_oriental', label: '🥢 Restaurant oriental' },
    { value: 'restaurant_indien', label: '🍛 Restaurant indien' },
    { value: 'restaurant_libanais', label: '🥙 Restaurant libanais' },
    { value: 'restaurant_turc', label: '🥙 Restaurant turc' },
    { value: 'restaurant_grec', label: '🫒 Restaurant grec' },
    { value: 'restaurant_espagnol', label: '🥘 Restaurant espagnol' },
    { value: 'restaurant_portugais', label: '🐟 Restaurant portugais' },
    { value: 'restaurant_allemand', label: '🍺 Restaurant allemand' },
    { value: 'restaurant_russe', label: '🥟 Restaurant russe' },
    { value: 'restaurant_marocain', label: '🥘 Restaurant marocain' },
    { value: 'restaurant_ethiopien', label: '🍽️ Restaurant éthiopien' },
    { value: 'restaurant_brasilien', label: '🌴 Restaurant brésilien' },
    { value: 'restaurant_peruvien', label: '🌶️ Restaurant péruvien' },
    { value: 'restaurant_mexicain', label: '🌮 Restaurant mexicain' },
    
    // 🥙 FAST FOOD & STREET FOOD
    { value: 'kebab', label: '🥙 Kebab' },
    { value: 'tacos_mexicain', label: '🌮 Tacos mexicain' },
    { value: 'burger', label: '🍔 Burger' },
    { value: 'pizzeria', label: '🍕 Pizzeria' },
    
    // 🍹 BARS & BOISSONS
    { value: 'bar_ambiance', label: '🍹 Bar d\'ambiance' },
    { value: 'bar_lounge', label: '🛋️ Bar lounge' },
    { value: 'bar_cocktails', label: '🍹 Bar à cocktails' },
    { value: 'bar_vins', label: '🍷 Bar à vins' },
    { value: 'bar_sports', label: '⚽ Bar sportif' },
    { value: 'rooftop_bar', label: '🏢 Rooftop bar' },
    { value: 'bar_karaoke', label: '🎤 Bar karaoké' },
    { value: 'bar_bières', label: '🍺 Bar à bières' },
    { value: 'bar_jus_smoothies', label: '🥤 Bar jus & smoothies' },
    { value: 'bar_tapas', label: '🥘 Bar tapas' },
    { value: 'bar_plage', label: '🏖️ Bar de plage' },
    { value: 'bar_rooftop', label: '🏢 Bar rooftop' },
    { value: 'bar_brasserie', label: '🍺 Bar brasserie' },
    { value: 'bar_whisky', label: '🥃 Bar à whisky' },
    { value: 'bar_rhum', label: '🥃 Bar à rhum' },
    { value: 'bar_gin', label: '🥃 Bar à gin' },
    { value: 'bar_tequila', label: '🥃 Bar à tequila' },
    { value: 'bar_champagne', label: '🥂 Bar à champagne' },
    { value: 'bar_apéritif', label: '🍸 Bar apéritif' },
    { value: 'bar_afterwork', label: '💼 Bar afterwork' },
    { value: 'bar_brunch', label: '🥞 Bar brunch' },
    { value: 'bar_glacé', label: '🍦 Bar glacé' },
    { value: 'bar_healthy', label: '🥗 Bar healthy' },
    { value: 'bar_vegan', label: '🌱 Bar vegan' },
    { value: 'bar_gluten_free', label: '🌾 Bar sans gluten' },
    { value: 'bar_halal', label: '☪️ Bar halal' },
    { value: 'bar_kosher', label: '✡️ Bar kosher' },
    { value: 'bar_jeux', label: '🎮 Bar à jeux' },
    { value: 'pub_traditionnel', label: '🍺 Pub traditionnel' },
    { value: 'brasserie_artisanale', label: '🍺 Brasserie artisanale' },
    
    // 🎉 SORTIES NOCTURNES
    { value: 'discotheque', label: '💃 Discothèque' },
    { value: 'club_techno', label: '🎧 Club techno' },
    { value: 'boite_nuit_mainstream', label: '🌙 Boîte de nuit mainstream' },
    
    // 🎯 SPORTS & ACTIVITÉS
    { value: 'bowling', label: '🎳 Bowling' },
    { value: 'billard_americain', label: '🎱 Billard américain' },
    { value: 'billard_francais', label: '🎱 Billard français' },
    { value: 'roller_indoor', label: '🛼 Roller indoor' },
    { value: 'moto_electrique_indoor', label: '🏍️ Moto électrique indoor' },
    { value: 'futsal', label: '⚽ Futsal' },
    { value: 'karting', label: '🏎️ Karting' },
    { value: 'laser_game', label: '🔫 Laser Game' },
    { value: 'vr_experience', label: '🥽 VR Experience' },
    
    // 🎮 ESCAPE GAMES
    { value: 'escape_game', label: '🔍 Escape Game' },
    { value: 'escape_game_horreur', label: '👻 Escape Game Horreur' },
    { value: 'escape_game_aventure', label: '🏴‍☠️ Escape Game Aventure' },
    { value: 'escape_game_mystere', label: '🕵️ Escape Game Mystère' },
    { value: 'escape_game_sf', label: '🚀 Escape Game Science-Fiction' },
    { value: 'escape_game_fantasy', label: '🧙 Escape Game Fantasy' },
    { value: 'escape_game_familial', label: '👨‍👩‍👧‍👦 Escape Game Familial' },
    
    // 🎵 BLIND TEST & QUIZ
    { value: 'blind_test', label: '🎵 Blind Test' },
    { value: 'quiz_room', label: '🧠 Quiz Room' },
    { value: 'salle_jeux_amis', label: '🎮 Salle de jeux entre amis' },
    { value: 'complexe_multiactivites', label: '🏢 Complexe multiactivités' },
    
    // 👶 ENFANTS & FAMILLE
    { value: 'trampoline_parc', label: '🤸 Trampoline parc' },
    { value: 'parc_loisirs_enfants', label: '🎠 Parc de loisirs enfants' },
    { value: 'centre_aquatique', label: '🏊 Centre aquatique' },
    { value: 'parc_aventure_enfants', label: '🌳 Parc d\'aventure enfants' },
    { value: 'ludotheque', label: '🧸 Ludothèque' },
    { value: 'centre_loisirs_enfants', label: '🏫 Centre de loisirs enfants' },
    { value: 'ferme_pedagogique', label: '🐄 Ferme pédagogique' },
    { value: 'musee_enfants', label: '🏛️ Musée enfants' },
    { value: 'parc_theme_enfants', label: '🎭 Parc à thème enfants' },
    { value: 'centre_sportif_enfants', label: '🏃 Centre sportif enfants' },
    { value: 'atelier_creatif_enfants', label: '🎨 Atelier créatif enfants' },
    { value: 'parc_jeux_interieur', label: '🏠 Parc de jeux intérieur' },
    { value: 'mini_golf', label: '⛳ Mini-golf' },
    { value: 'parc_attractions_familial', label: '🎡 Parc d\'attractions familial' },
    { value: 'centre_anniversaires', label: '🎂 Centre d\'anniversaires' },
    { value: 'parc_animalier', label: '🐾 Parc animalier' },
    { value: 'parc_plage_enfants', label: '🏖️ Parc de plage enfants' },
    { value: 'centre_equitation_enfants', label: '🐴 Centre d\'équitation enfants' },
    { value: 'parc_skate_enfants', label: '🛹 Parc de skate enfants' },
    { value: 'centre_cirque_enfants', label: '🎪 Centre de cirque enfants' },
    { value: 'parc_loisir_indoor', label: '🎪 Parc de loisir indoor' },
    
    // 🎭 CULTURE & SPECTACLES
    { value: 'cinema', label: '🎬 Cinéma' },
    { value: 'theatre', label: '🎭 Théâtre' },
    
    // 🏃 SPORTS & BIEN-ÊTRE
    { value: 'sport', label: '⚽ Sport' },
    { value: 'wellness', label: '🧘 Bien-être/Spa' },
    
    // ❓ AUTRES
    { value: 'cafe', label: '☕ Café' },
    { value: 'autre', label: '❓ Autre' }
  ];

  const fetchLearningData = useCallback(async () => {
    // Éviter les appels multiples
    if (hasFetchedRef.current) {
      return;
    }

    try {
      hasFetchedRef.current = true;
      setLoading(true);
      
      // Récupérer les statistiques
      const statsResponse = await fetch('/api/admin/learning/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Récupérer les patterns récents
      const patternsResponse = await fetch('/api/admin/learning/patterns');
      if (patternsResponse.ok) {
        const patternsData = await patternsResponse.json();
        setPatterns(patternsData);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      hasFetchedRef.current = false; // Permettre de réessayer en cas d'erreur
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionLoading) return;
    
    // Éviter les redirections multiples
    if (!session && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      router.push('/auth?error=AccessDenied');
      return;
    }

    if (session && session.user?.role !== 'admin' && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      router.push('/auth?error=AccessDenied');
      return;
    }

    // Éviter les appels multiples
    if (!session || session.user?.role !== 'admin' || hasFetchedRef.current) {
      return;
    }

    fetchLearningData();
  }, [session, sessionLoading, fetchLearningData]); // Retirer router des dépendances

  const handleCorrectType = async (patternId: string, patternName: string) => {
    if (!correctedType) return;

    try {
      const response = await fetch('/api/admin/learning/correct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patternId,
          patternName,
          correctedType,
          correctedBy: session?.user?.email || 'admin'
        }),
      });

      if (response.ok) {
        // Recharger les données
        hasFetchedRef.current = false; // Réinitialiser pour permettre le rechargement
        await fetchLearningData();
        setEditingPattern(null);
        setCorrectedType('');
      } else {
        setError('Erreur lors de la correction du type');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  const handleDeletePattern = async (patternId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce pattern d\'apprentissage ?')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/learning/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ patternId }),
      });

      if (response.ok) {
        // Recharger les données
        hasFetchedRef.current = false; // Réinitialiser pour permettre le rechargement
        await fetchLearningData();
      } else {
        setError('Erreur lors de la suppression du pattern');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  const handleValidatePattern = (patternId: string, patternName: string, detectedType: string, confidence?: number) => {
    setValidationModal({
      isOpen: true,
      patternId,
      patternName,
      detectedType,
      confidence: confidence ? Math.round(confidence * 100) : undefined
    });
  };

  const confirmValidation = async () => {
    if (!validationModal) return;

    setIsValidating(true);
    try {
      const response = await fetch('/api/admin/learning/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patternId: validationModal.patternId,
          patternName: validationModal.patternName,
          validatedType: validationModal.detectedType,
          validatedBy: session?.user?.email || 'admin'
        }),
      });

      if (response.ok) {
        // Recharger les données
        hasFetchedRef.current = false; // Réinitialiser pour permettre le rechargement
        await fetchLearningData();
        setValidationModal(null);
      } else {
        setError('Erreur lors de la validation du pattern');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsValidating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Brain className="w-8 h-8 text-orange-500 mr-3" />
            Intelligence d&apos;Apprentissage
          </h1>
          <p className="text-gray-600 mt-2">
            Analyse des patterns d&apos;apprentissage et de la performance du système
          </p>
        </div>

        {/* Statistiques globales */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <Target className="w-8 h-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Patterns</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalPatterns}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Patterns Corrigés</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.correctedPatterns}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Précision</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(stats.accuracy * 100)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Types Uniques</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.mostCommonTypes.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Types les plus courants */}
        {stats && stats.mostCommonTypes.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 text-blue-600 mr-2" />
              Types d'établissements les plus courants
            </h3>
            <div className="space-y-3">
              {stats.mostCommonTypes.slice(0, 10).map((type, index) => (
                <div key={type.type} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-900">{type.type}</span>
                  </div>
                  <span className="text-sm text-gray-500">{type.count} occurrences</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Patterns récents */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Brain className="w-5 h-5 text-purple-600 mr-2" />
              Patterns d&apos;Apprentissage Récents
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Établissement
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type Détecté
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type Corrigé
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confiance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {patterns.map((pattern) => (
                  <tr key={pattern.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {pattern.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {pattern.detectedType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {pattern.isCorrected ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          {pattern.correctedType}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-orange-500 h-2 rounded-full" 
                            style={{ width: `${Math.round(pattern.confidence * 100)}%` }}
                          ></div>
                        </div>
                        <span>{Math.round(pattern.confidence * 100)}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {pattern.isCorrected ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Corrigé
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          En attente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(pattern.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {!pattern.isCorrected && (
                        <div className="flex space-x-2">
                          {editingPattern === pattern.id ? (
                            <div className="flex items-center space-x-2">
                              <select
                                value={correctedType}
                                onChange={(e) => setCorrectedType(e.target.value)}
                                className="text-xs border border-gray-300 rounded px-2 py-1"
                              >
                                <option value="">Sélectionner...</option>
                                {typeOptions.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                              <button
                                onClick={() => handleCorrectType(pattern.id, pattern.name)}
                                disabled={!correctedType}
                                className="text-xs bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 disabled:bg-gray-300"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => {
                                  setEditingPattern(null);
                                  setCorrectedType('');
                                }}
                                className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => handleValidatePattern(pattern.id, pattern.name, pattern.detectedType, pattern.confidence)}
                                className="text-green-600 hover:text-green-900 text-xs bg-green-50 px-2 py-1 rounded"
                              >
                                ✓ Valider
                              </button>
                              <button
                                onClick={() => setEditingPattern(pattern.id)}
                                className="text-orange-600 hover:text-orange-900 text-xs bg-orange-50 px-2 py-1 rounded"
                              >
                                ✏️ Corriger
                              </button>
                              <button
                                onClick={() => handleDeletePattern(pattern.id)}
                                className="text-red-600 hover:text-red-900 text-xs bg-red-50 px-2 py-1 rounded"
                              >
                                🗑️
                              </button>
                            </>
                          )}
                        </div>
                      )}
                      {pattern.isCorrected && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                          ✓ Corrigé
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => {
              hasFetchedRef.current = false; // Réinitialiser pour permettre le rechargement
              fetchLearningData();
            }}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            🔄 Actualiser
          </button>
          <button
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            ← Retour Admin
          </button>
        </div>
      </div>

      {/* Modal de validation */}
      {validationModal && (
        <ValidationModal
          isOpen={validationModal.isOpen}
          onClose={() => setValidationModal(null)}
          patternName={validationModal.patternName}
          detectedType={validationModal.detectedType}
          confidence={validationModal.confidence}
          onValidate={confirmValidation}
          onCancel={() => setValidationModal(null)}
          isLoading={isValidating}
        />
      )}
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";

interface Tariff {
  id: string;
  label: string;
  price: number;
  isNew?: boolean;
}

interface Establishment {
  id: string;
  name: string;
  slug: string;
  status: string;
  description: string | null;
  address: string;
  city: string | null;
  viewsCount: number;
  clicksCount: number;
  avgRating: number | null;
  totalComments: number;
  createdAt: string;
  updatedAt: string;
}

interface TariffsManagementProps {
  establishment: Establishment | null;
  onUpdate: (est: Establishment) => void;
}

export function TariffsManagement({ establishment, onUpdate }: TariffsManagementProps) {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Charger les tarifs existants
  useEffect(() => {
    const loadTariffs = async () => {
      try {
        const response = await fetch('/api/dashboard/tariffs');
        if (response.ok) {
          const data = await response.json();
          setTariffs(data);
        } else {
          setError('Erreur lors du chargement des tarifs');
        }
      } catch (error) {
        console.error('Erreur chargement tarifs:', error);
        setError('Erreur lors du chargement des tarifs');
      } finally {
        setLoading(false);
      }
    };

    if (establishment) {
      loadTariffs();
    }
  }, [establishment]);

  // Créer un nouveau tarif
  const createTariff = async () => {
    const newTariff: Tariff = { id: 'temp-' + Date.now(), label: '', price: 0, isNew: true };
    setTariffs(prev => [...prev, newTariff]);
  };

  // Sauvegarder un tarif
  const saveTariff = async (tariff: Tariff) => {
    setSaving(true);
    setError(null);
    
    try {
      if (tariff.isNew) {
        // Créer un nouveau tarif
        const response = await fetch('/api/dashboard/tariffs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ label: tariff.label, price: tariff.price })
        });
        
        if (response.ok) {
          const newTariff = await response.json();
          setTariffs(prev => prev.map(t => 
            t.id === tariff.id ? { ...newTariff, isNew: false } : t
          ));
          setSuccess('Tarif créé avec succès !');
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Erreur lors de la création');
        }
      } else {
        // Modifier un tarif existant
        const response = await fetch(`/api/dashboard/tariffs/${tariff.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ label: tariff.label, price: tariff.price })
        });
        
        if (response.ok) {
          const updatedTariff = await response.json();
          setTariffs(prev => prev.map(t => 
            t.id === tariff.id ? updatedTariff : t
          ));
          setSuccess('Tarif mis à jour avec succès !');
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Erreur lors de la modification');
        }
      }
    } catch (error) {
      console.error('Erreur sauvegarde tarif:', error);
      setError('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  // Supprimer un tarif
  const deleteTariff = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce tarif ?')) {
      try {
        const response = await fetch(`/api/dashboard/tariffs/${id}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          setTariffs(prev => prev.filter(t => t.id !== id));
          setSuccess('Tarif supprimé avec succès !');
        } else {
          setError('Erreur lors de la suppression');
        }
      } catch (error) {
        console.error('Erreur suppression tarif:', error);
        setError('Erreur lors de la suppression');
      }
    }
  };

  // Mettre à jour un tarif localement
  const updateTariff = (id: string, field: 'label' | 'price', value: string | number) => {
    setTariffs(prev => prev.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  if (!establishment) {
    return <div className="p-8 text-center text-gray-500">Aucun établissement trouvé</div>;
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Chargement des tarifs...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des tarifs</h1>
        <button
          onClick={createTariff}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
        >
          + Ajouter un tarif
        </button>
      </div>

      {/* Messages de feedback */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Statistiques des tarifs */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Aperçu des tarifs</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {tariffs.length}
            </p>
            <p className="text-sm text-gray-600">Tarifs définis</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {tariffs.length > 0 
                ? Math.round(tariffs.reduce((sum, t) => sum + t.price, 0) / tariffs.length)
                : 0
              }€
            </p>
            <p className="text-sm text-gray-600">Prix moyen</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {tariffs.length > 0 ? Math.min(...tariffs.map(t => t.price)) : 0}€
            </p>
            <p className="text-sm text-gray-600">Prix minimum</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600">
              {tariffs.length > 0 ? Math.max(...tariffs.map(t => t.price)) : 0}€
            </p>
            <p className="text-sm text-gray-600">Prix maximum</p>
          </div>
        </div>
      </div>

      {/* Tableau des tarifs */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Mes tarifs</h2>
        </div>
        
        {tariffs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg">Aucun tarif défini</p>
            <p className="text-sm">Cliquez sur "Ajouter un tarif" pour commencer</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {tariffs.map((tariff) => (
              <div key={tariff.id} className="p-6 flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={tariff.label}
                    onChange={(e) => updateTariff(tariff.id, 'label', e.target.value)}
                    placeholder="Ex: Menu du jour, Entrée + Plat..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="w-32">
                  <div className="flex items-center">
                    <input
                      type="number"
                      min="0"
                      step="0.50"
                      value={tariff.price}
                      onChange={(e) => updateTariff(tariff.id, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="0.00"
                    />
                    <span className="ml-2 text-gray-600">€</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => saveTariff(tariff)}
                    disabled={saving || !tariff.label.trim() || tariff.price <= 0}
                    className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                    title="Sauvegarder"
                  >
                    💾
                  </button>
                  <button
                    onClick={() => deleteTariff(tariff.id)}
                    className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    title="Supprimer"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Conseils */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Conseils pour vos tarifs</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Utilisez des labels clairs : "Menu du jour", "Formule déjeuner", etc.</li>
          <li>• Fixez des prix compétitifs par rapport à votre zone géographique</li>
          <li>• Proposez des tarifs dégressifs pour les groupes</li>
          <li>• Mettez à jour régulièrement vos prix selon la saisonnalité</li>
        </ul>
      </div>
    </div>
  );
}

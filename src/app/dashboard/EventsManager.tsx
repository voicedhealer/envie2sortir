"use client";

import { useState, useEffect } from "react";
import { toast } from "@/lib/fake-toast";
import { getSubscriptionDisplayInfo, getPremiumRequiredMessage } from "@/lib/subscription-utils";
import ImageUpload from "@/components/ImageUpload";
import { FileText, Calendar, Euro, Image as ImageIcon } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string | null;
  modality: string | null;
  startDate: string;
  endDate: string | null;
  imageUrl: string | null;
  price: number | null;
  priceUnit: string | null;
  maxCapacity: number | null;
  createdAt: string;
  updatedAt: string;
}

interface EventsManagerProps {
  establishmentId: string;
  isPremium: boolean;
  subscription: 'FREE' | 'PREMIUM';
}

export default function EventsManager({ establishmentId, isPremium, subscription }: EventsManagerProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    modality: '',
    startDate: '',
    endDate: '',
    imageUrl: '',
    price: '',
    priceUnit: '',
    maxCapacity: ''
  });

  // Charger les événements
  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/dashboard/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events);
      } else if (response.status === 403) {
        toast.error('Fonctionnalité réservée aux abonnements Premium');
      } else {
        toast.error('Erreur lors du chargement des événements');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des événements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isPremium) {
      fetchEvents();
    } else {
      setLoading(false);
    }
  }, [isPremium]);

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.startDate) {
      toast.error('Titre et date de début requis');
      return;
    }

    try {
      const url = editingEvent 
        ? `/api/dashboard/events/${editingEvent.id}`
        : '/api/dashboard/events';
      
      const method = editingEvent ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        setShowForm(false);
        setEditingEvent(null);
        resetForm();
        fetchEvents();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  // Supprimer un événement
  const handleDelete = async (eventId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/dashboard/events/${eventId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        fetchEvents();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  // Modifier un événement
  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    
    // Fonction pour formater correctement les dates pour datetime-local
    const formatDateForInput = (dateString: string) => {
      try {
        const date = new Date(dateString);
        // S'assurer que la date est valide
        if (isNaN(date.getTime())) {
          console.error('Date invalide:', dateString);
          return '';
        }
        
        // Convertir en format datetime-local (YYYY-MM-DDTHH:MM)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      } catch (error) {
        console.error('Erreur lors du formatage de la date:', dateString, error);
        return '';
      }
    };
    
    setFormData({
      title: event.title,
      description: event.description || '',
      modality: event.modality || '',
      startDate: formatDateForInput(event.startDate),
      endDate: event.endDate ? formatDateForInput(event.endDate) : '',
      imageUrl: event.imageUrl || '',
      price: event.price ? event.price.toString() : '',
      priceUnit: event.priceUnit || '',
      maxCapacity: event.maxCapacity ? event.maxCapacity.toString() : ''
    });
    setShowForm(true);
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      modality: '',
      startDate: '',
      endDate: '',
      imageUrl: '',
      price: '',
      priceUnit: '',
      maxCapacity: ''
    });
  };

  // Annuler l'édition
  const handleCancel = () => {
    setShowForm(false);
    setEditingEvent(null);
    resetForm();
  };

  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isPremium) {
    const displayInfo = getSubscriptionDisplayInfo(subscription);
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 text-orange-500 mb-4">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Gestion des événements
          </h3>
          <p className="text-gray-600 mb-4">
            {getPremiumRequiredMessage('Événements')}
          </p>
          <div className="space-y-2">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${displayInfo.badgeColor}`}>
              {displayInfo.label}
            </div>
            <p className="text-sm text-gray-500">
              Fonctionnalités disponibles : {displayInfo.features.length > 0 ? displayInfo.features.join(', ') : 'Aucune'}
            </p>
          </div>
          <button className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors mt-4">
            Passer en Premium
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">
            Mes événements
          </h3>
          <button
            onClick={() => setShowForm(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            + Nouvel événement
          </button>
        </div>
      </div>

      <div className="px-6 py-4">
        {showForm && (
          <div className="mb-6 space-y-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-6">
              {editingEvent ? 'Modifier l\'événement' : 'Nouvel événement'}
            </h4>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Informations générales */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">Informations générales</h4>
                    <p className="text-sm text-gray-600">Définissez les informations principales de votre événement.</p>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Titre <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Titre de l'événement"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        rows={3}
                        placeholder="Description de l'événement"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Modalité <span className="text-gray-500 text-sm font-normal">(optionnel)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.modality}
                        onChange={(e) => setFormData({...formData, modality: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="Spécifiez les modalités de l'événement, ex: Lot à gagner, tenue à portée, boisson gratuite. etc..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Information complémentaire qui s'affichera en plus petit sous la description
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Dates & Horaires */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">Dates & Horaires</h4>
                    <p className="text-sm text-gray-600">Définissez la durée de votre événement.</p>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date de début <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date de fin
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Prix & Capacité */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Euro className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">Prix & Capacité</h4>
                    <p className="text-sm text-gray-600">Configurez le tarif et la capacité d'accueil.</p>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prix (€)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unité <span className="text-gray-500 text-sm font-normal">(optionnel)</span>
                      </label>
                      <input
                        type="text"
                        value={formData.priceUnit}
                        onChange={(e) => setFormData({...formData, priceUnit: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="par personne, par session, par room..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Précisez l'unité du prix (ex: par personne, par session, par room)
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capacité max
                      </label>
                      <input
                        type="number"
                        value={formData.maxCapacity}
                        onChange={(e) => setFormData({...formData, maxCapacity: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        placeholder="50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 4: Médias */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">Médias</h4>
                    <p className="text-sm text-gray-600">Ajoutez une image pour rendre votre événement plus attractif.</p>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image de l'événement
                    </label>
                    <ImageUpload
                      currentImageUrl={formData.imageUrl}
                      onImageUpload={(imageUrl) => setFormData({...formData, imageUrl})}
                      onImageRemove={() => setFormData({...formData, imageUrl: ''})}
                      establishmentId={establishmentId}
                      uploadType="event"
                      className="w-full"
                    />
                    <p className="text-xs text-orange-600 font-medium mt-2">
                      📐 Taille recommandée : 1200 × 800 pixels (ratio 3:2) pour un affichage optimal sur toutes les cards
                    </p>
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-2.5 rounded-lg transition-colors font-semibold"
                >
                  💾 {editingEvent ? 'Modifier' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2.5 rounded-lg transition-colors font-semibold"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {events.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucun événement
            </h3>
            <p className="text-gray-600 mb-4">
              Créez votre premier événement pour promouvoir votre établissement
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              + Créer un événement
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start gap-4">
                  {/* Miniature de l'image */}
                  {event.imageUrl ? (
                    <div className="flex-shrink-0">
                      <img
                        src={event.imageUrl}
                        alt={event.title}
                        className="w-24 h-24 md:w-32 md:h-32 object-cover rounded-lg border border-gray-200"
                      />
                    </div>
                  ) : (
                    <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      {event.title}
                    </h4>
                    {event.description && (
                      <p className="text-gray-600 mb-2">{event.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                      <span>📅 {formatDate(event.startDate)}</span>
                      {event.endDate && (
                        <span>⏰ Fin: {formatDate(event.endDate)}</span>
                      )}
                      {event.price && (
                        <span>💰 {event.price}€{event.priceUnit ? ` par ${event.priceUnit}` : ''}</span>
                      )}
                      {event.maxCapacity && (
                        <span>👥 {event.maxCapacity} places</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(event)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Modifier"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Supprimer"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

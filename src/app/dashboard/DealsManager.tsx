"use client";

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, Clock, Image as ImageIcon, FileText, Eye, EyeOff, Copy, RotateCcw } from 'lucide-react';
import { formatDealTime, formatPrice, calculateDiscount, isDealActive } from '@/lib/deal-utils';
import DealEngagementStats from '@/components/DealEngagementStats';

interface DailyDeal {
  id: string;
  establishmentId: string;
  title: string;
  description: string;
  modality?: string | null;
  originalPrice?: number | null;
  discountedPrice?: number | null;
  imageUrl?: string | null;
  pdfUrl?: string | null;
  dateDebut: Date | string;
  dateFin: Date | string;
  heureDebut?: string | null;
  heureFin?: string | null;
  isActive: boolean;
  createdAt: Date | string;
  // Récurrence
  isRecurring?: boolean;
  recurrenceType?: string | null;
  recurrenceDays?: number[] | null;
  recurrenceEndDate?: Date | string | null;
  // Champs pour l'effet flip
  promoUrl?: string | null;
}

interface DealsManagerProps {
  establishmentId: string;
  isPremium: boolean;
}

export default function DealsManager({ establishmentId, isPremium }: DealsManagerProps) {
  const [deals, setDeals] = useState<DailyDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDeal, setEditingDeal] = useState<DailyDeal | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    modality: '',
    originalPrice: '',
    discountedPrice: '',
    imageUrl: '',
    pdfUrl: '',
    dateDebut: '',
    dateFin: '',
    heureDebut: '',
    heureFin: '',
    isActive: true,
    // Récurrence
    isRecurring: false,
    recurrenceType: '',
    recurrenceDays: [] as number[],
    recurrenceEndDate: '',
    // Champs pour l'effet flip
    promoUrl: '' // Lien vers la promotion sur internet (format URL)
  });

  // Charger les bons plans
  useEffect(() => {
    loadDeals();
  }, [establishmentId]);

  const loadDeals = async () => {
    try {
      const response = await fetch(`/api/deals/by-establishment/${establishmentId}`);
      const data = await response.json();
      
      if (data.success) {
        setDeals(data.deals);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des bons plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Gestion des jours de récurrence
  const handleRecurrenceDayChange = (day: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      recurrenceDays: checked 
        ? [...prev.recurrenceDays, day]
        : prev.recurrenceDays.filter(d => d !== day)
    }));
  };

  // Noms des jours de la semaine
  const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);
      formDataToSend.append('establishmentId', establishmentId);
      formDataToSend.append('imageType', 'deals'); // Type pour l'optimisation

      const response = await fetch('/api/upload/optimized-image', {
        method: 'POST',
        body: formDataToSend
      });

      const data = await response.json();
      
      if (data.success) {
        // Utiliser la variante 'main' pour l'affichage principal
        const mainImageUrl = data.variants.main || data.variants.hero;
        
        setFormData(prev => ({ 
          ...prev, 
          imageUrl: mainImageUrl,
          pdfUrl: '' // Effacer le PDF si une image est ajoutée
        }));
        
        // Afficher les économies réalisées
        if (data.totalSavingsPercentage > 0) {
          console.log(`✅ Image optimisée: ${data.totalSavingsPercentage.toFixed(1)}% d'économie d'espace`);
          // Optionnel: afficher une notification à l'utilisateur
          // alert(`Image optimisée ! ${data.totalSavingsPercentage.toFixed(1)}% d'économie d'espace`);
        }
      } else {
        alert(data.error || 'Erreur lors de l\'upload de l\'image');
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPdf(true);
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', file);
      formDataToSend.append('establishmentId', establishmentId);
      formDataToSend.append('fileType', 'pdf');

      const response = await fetch('/api/upload/deal-media', {
        method: 'POST',
        body: formDataToSend
      });

      const data = await response.json();
      
      if (data.success) {
        setFormData(prev => ({ 
          ...prev, 
          pdfUrl: data.fileUrl,
          imageUrl: '' // Effacer l'image si un PDF est ajouté
        }));
      } else {
        alert(data.error || 'Erreur lors de l\'upload du PDF');
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert('Erreur lors de l\'upload du PDF');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation : exactement un média (image OU PDF) doit être fourni
    if (!formData.imageUrl && !formData.pdfUrl) {
      alert('Veuillez ajouter soit une image, soit un PDF pour votre bon plan');
      return;
    }
    
    // Validation des dates pour les bons plans non récurrents
    if (!formData.isRecurring) {
      if (!formData.dateDebut || !formData.dateFin) {
        alert('Veuillez renseigner les dates de début et de fin');
        return;
      }
    }
    
    try {
      const url = editingDeal 
        ? `/api/deals/${editingDeal.id}` 
        : '/api/deals';
      
      const method = editingDeal ? 'PUT' : 'POST';

      // Préparer les données selon le type de bon plan
      const dealData = {
        ...formData,
        establishmentId,
        // Pour les bons plans récurrents, utiliser des dates par défaut
        dateDebut: formData.isRecurring ? new Date().toISOString().split('T')[0] : formData.dateDebut,
        dateFin: formData.isRecurring ? (formData.recurrenceEndDate || '2099-12-31') : formData.dateFin
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(dealData)
      });

      if (!response.ok) {
        const errorText = await response.text();
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText };
        }
        
        alert(errorData.error || `Erreur ${response.status}: ${response.statusText}`);
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        alert(editingDeal ? 'Bon plan mis à jour avec succès !' : 'Bon plan créé avec succès !');
        
        await loadDeals();
        resetForm();
        setShowForm(false);
      } else {
        alert(data.error || 'Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du bon plan: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
    }
  };

  const handleEdit = (deal: DailyDeal) => {
    setEditingDeal(deal);
    setFormData({
      title: deal.title,
      description: deal.description,
      modality: deal.modality || '',
      originalPrice: deal.originalPrice?.toString() || '',
      discountedPrice: deal.discountedPrice?.toString() || '',
      imageUrl: deal.imageUrl || '',
      pdfUrl: deal.pdfUrl || '',
      dateDebut: new Date(deal.dateDebut).toISOString().split('T')[0],
      dateFin: new Date(deal.dateFin).toISOString().split('T')[0],
      heureDebut: deal.heureDebut || '',
      heureFin: deal.heureFin || '',
      isActive: deal.isActive,
      // Récurrence
      isRecurring: deal.isRecurring || false,
      recurrenceType: deal.recurrenceType || '',
      recurrenceDays: deal.recurrenceDays || [],
      recurrenceEndDate: deal.recurrenceEndDate ? new Date(deal.recurrenceEndDate).toISOString().split('T')[0] : '',
      // Champs pour l'effet flip
      promoUrl: (deal as any).promoUrl || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (dealId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce bon plan ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/deals/${dealId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        await loadDeals();
      } else {
        alert(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression du bon plan');
    }
  };

  const handleDuplicate = (deal: DailyDeal) => {
    setEditingDeal(null);
    setFormData({
      title: deal.title + ' (copie)',
      description: deal.description,
      modality: deal.modality || '',
      originalPrice: deal.originalPrice?.toString() || '',
      discountedPrice: deal.discountedPrice?.toString() || '',
      imageUrl: deal.imageUrl || '',
      pdfUrl: deal.pdfUrl || '',
      dateDebut: '',
      dateFin: '',
      heureDebut: deal.heureDebut || '',
      heureFin: deal.heureFin || '',
      isActive: true,
      // Récurrence
      isRecurring: deal.isRecurring || false,
      recurrenceType: deal.recurrenceType || '',
      recurrenceDays: deal.recurrenceDays || [],
      recurrenceEndDate: '',
      // Champs pour l'effet flip
      promoUrl: (deal as any).promoUrl || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      modality: '',
      originalPrice: '',
      discountedPrice: '',
      imageUrl: '',
      pdfUrl: '',
      dateDebut: '',
      dateFin: '',
      heureDebut: '',
      heureFin: '',
      isActive: true,
      // Récurrence
      isRecurring: false,
      recurrenceType: '',
      recurrenceDays: [],
      recurrenceEndDate: '',
      // Champs pour l'effet flip
      promoUrl: ''
    });
    setEditingDeal(null);
  };

  if (!isPremium) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🌟</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Fonctionnalité Premium
          </h3>
          <p className="text-gray-600 mb-6">
            Les bons plans journaliers sont réservés aux comptes Premium
          </p>
          <button className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors">
            Passer à Premium
          </button>
        </div>
      </div>
    );
  }

  // Catégoriser les bons plans
  const now = new Date();
  
  const activeDeals = deals.filter(deal => {
    const startDate = new Date(deal.dateDebut);
    const endDate = new Date(deal.dateFin);
    return deal.isActive && startDate <= now && endDate >= now;
  });
  
  const upcomingDeals = deals.filter(deal => {
    const startDate = new Date(deal.dateDebut);
    return deal.isActive && startDate > now;
  });
  
  const pastDeals = deals.filter(deal => {
    const endDate = new Date(deal.dateFin);
    return !deal.isActive || endDate < now;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bons plans journaliers</h2>
            <p className="text-gray-600 mt-1">
              Créez des offres spéciales pour attirer vos clients
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Nouveau bon plan
          </button>
        </div>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingDeal ? 'Modifier le bon plan' : 'Nouveau bon plan'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Titre */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titre du bon plan *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Ex: Tacos à 3€"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  placeholder="Ex: Profitez de nos tacos à prix réduit jusqu'à épuisement des stocks"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Modalité */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modalité (optionnel)
                </label>
                <input
                  type="text"
                  name="modality"
                  value={formData.modality}
                  onChange={handleInputChange}
                  placeholder="Ex: jusqu'à épuisement des stocks, dans la limite des places disponibles"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Cette information apparaîtra sur l'overlay "Bon plan du jour" des cartes de recherche
                </p>
              </div>

              {/* Lien promotion */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lien vers la promotion (optionnel)
                </label>
                <input
                  type="url"
                  name="promoUrl"
                  value={formData.promoUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/promotion"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  URL complète vers votre promotion sur internet
                </p>
              </div>

              {/* Prix */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix initial (€)
                </label>
                <input
                  type="number"
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  placeholder="Ex: 5.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prix réduit (€)
                </label>
                <input
                  type="number"
                  name="discountedPrice"
                  value={formData.discountedPrice}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  placeholder="Ex: 3.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Dates - conditionnelles selon la récurrence */}
              {!formData.isRecurring && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de début *
                    </label>
                    <input
                      type="date"
                      name="dateDebut"
                      value={formData.dateDebut}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de fin *
                    </label>
                    <input
                      type="date"
                      name="dateFin"
                      value={formData.dateFin}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </>
              )}

              {/* Pour les bons plans récurrents, on utilise des dates par défaut */}
              {formData.isRecurring && (
                <div className="md:col-span-2">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Bon plan récurrent :</strong> Ce bon plan sera actif tous les jours selon les horaires définis ci-dessous.
                      {formData.recurrenceEndDate && (
                        <span> Il se terminera le {new Date(formData.recurrenceEndDate).toLocaleDateString('fr-FR')}.</span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Horaires */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure de début (optionnel)
                </label>
                <input
                  type="time"
                  name="heureDebut"
                  value={formData.heureDebut}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure de fin (optionnel)
                </label>
                <input
                  type="time"
                  name="heureFin"
                  value={formData.heureFin}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Récurrence */}
              <div className="md:col-span-2">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      name="isRecurring"
                      checked={formData.isRecurring}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        isRecurring: e.target.checked,
                        recurrenceType: e.target.checked ? prev.recurrenceType : '',
                        recurrenceDays: e.target.checked ? prev.recurrenceDays : [],
                        recurrenceEndDate: e.target.checked ? prev.recurrenceEndDate : ''
                      }))}
                      className="mr-2"
                    />
                    <label className="text-sm font-medium text-gray-700">
                      🔄 Bon plan récurrent
                    </label>
                  </div>
                  
                  {formData.isRecurring && (
                    <div className="space-y-4">
                      {/* Type de récurrence */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Type de récurrence
                        </label>
                        <div className="flex gap-4">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="recurrenceType"
                              value="weekly"
                              checked={formData.recurrenceType === 'weekly'}
                              onChange={handleInputChange}
                              className="mr-2"
                            />
                            <span className="text-sm">Hebdomadaire</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="recurrenceType"
                              value="monthly"
                              checked={formData.recurrenceType === 'monthly'}
                              onChange={handleInputChange}
                              className="mr-2"
                            />
                            <span className="text-sm">Mensuel</span>
                          </label>
                        </div>
                      </div>

                      {/* Jours de la semaine (pour hebdomadaire) */}
                      {formData.recurrenceType === 'weekly' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Jours de la semaine
                          </label>
                          <div className="grid grid-cols-4 gap-2">
                            {dayNames.map((dayName, index) => {
                              const dayNumber = index + 1; // 1 = Lundi, 7 = Dimanche
                              return (
                                <label key={dayNumber} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={formData.recurrenceDays.includes(dayNumber)}
                                    onChange={(e) => handleRecurrenceDayChange(dayNumber, e.target.checked)}
                                    className="mr-2"
                                  />
                                  <span className="text-sm">{dayName}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Date de fin de récurrence */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date de fin de récurrence (optionnel)
                        </label>
                        <input
                          type="date"
                          name="recurrenceEndDate"
                          value={formData.recurrenceEndDate}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Laissez vide pour une récurrence illimitée
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image (optionnel)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                  />
                  {formData.imageUrl && (
                    <a
                      href={formData.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-500 hover:text-orange-600"
                    >
                      <Eye className="w-5 h-5" />
                    </a>
                  )}
                </div>
                {uploadingImage && <p className="text-sm text-gray-500 mt-1">Upload en cours...</p>}
                <p className="text-xs text-gray-500 mt-1">
                  Choisissez soit une image, soit un PDF (pas les deux)
                </p>
              </div>

              {/* PDF */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PDF (optionnel)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    disabled={uploadingPdf}
                    className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                  />
                  {formData.pdfUrl && (
                    <a
                      href={formData.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-500 hover:text-orange-600"
                    >
                      <FileText className="w-5 h-5" />
                    </a>
                  )}
                </div>
                {uploadingPdf && <p className="text-sm text-gray-500 mt-1">Upload en cours...</p>}
                <p className="text-xs text-gray-500 mt-1">
                  Alternative à l'image pour les menus détaillés
                </p>
              </div>

              {/* Actif */}
              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Bon plan actif</span>
                </label>
              </div>
            </div>

            {/* Boutons */}
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
              >
                {editingDeal ? 'Mettre à jour' : 'Créer le bon plan'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des bons plans */}
      {loading ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-600">Chargement...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Bons plans actifs */}
          {activeDeals.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Bons plans actifs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeDeals.map(deal => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicate}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Bons plans à venir */}
          {upcomingDeals.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Bons plans à venir</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingDeals.map(deal => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicate}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Bons plans passés */}
          {pastDeals.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Bons plans passés</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pastDeals.map(deal => (
                  <DealCard
                    key={deal.id}
                    deal={deal}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onDuplicate={handleDuplicate}
                  />
                ))}
              </div>
            </div>
          )}


          {deals.length === 0 && (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-gray-600 mb-4">Aucun bon plan créé pour le moment</p>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Créer votre premier bon plan
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Composant DealCard
function DealCard({ 
  deal, 
  onEdit, 
  onDelete, 
  onDuplicate 
}: { 
  deal: DailyDeal;
  onEdit: (deal: DailyDeal) => void;
  onDelete: (id: string) => void;
  onDuplicate: (deal: DailyDeal) => void;
}) {
  const isActive = isDealActive(deal);
  const discount = calculateDiscount(deal.originalPrice, deal.discountedPrice);

  return (
    <div className={`bg-white border-2 rounded-lg p-4 ${isActive ? 'border-orange-500 shadow-lg shadow-orange-500/20' : 'border-gray-200'}`}>
      <div className="flex gap-4">
        {/* Image */}
        {deal.imageUrl && (
          <div className="flex-shrink-0">
            <img 
              src={deal.imageUrl} 
              alt={deal.title}
              className="w-24 h-24 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Contenu principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900 truncate">{deal.title}</h4>
              {deal.isRecurring && (
                <div title="Bon plan récurrent" className="flex-shrink-0">
                  <RotateCcw className="text-orange-500 w-4 h-4" />
                </div>
              )}
            </div>
            {!deal.isActive && (
              <span className="flex-shrink-0 ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                Inactif
              </span>
            )}
          </div>
          
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{deal.description}</p>

          {/* Prix */}
          {(deal.originalPrice || deal.discountedPrice) && (
            <div className="flex items-center gap-2 mb-2">
              {deal.originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(deal.originalPrice)}
                </span>
              )}
              {deal.discountedPrice && (
                <span className="text-lg font-bold text-orange-600">
                  {formatPrice(deal.discountedPrice)}
                </span>
              )}
              {discount > 0 && (
                <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                  -{discount}%
                </span>
              )}
            </div>
          )}

          {/* Dates */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Calendar className="w-4 h-4" />
            <span>{formatDealTime(deal)}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(deal)}
              className="text-blue-600 hover:text-blue-800 p-1"
              title="Modifier"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDuplicate(deal)}
              className="text-green-600 hover:text-green-800 p-1"
              title="Dupliquer"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(deal.id)}
              className="text-red-600 hover:text-red-800 p-1"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Statistiques d'engagement */}
      <div className="mt-4">
        <DealEngagementStats 
          dealId={deal.id}
          establishmentId={deal.establishmentId}
        />
      </div>
    </div>
  );
}


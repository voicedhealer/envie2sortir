"use client";

import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Calendar, Clock, Image as ImageIcon, FileText, Eye, EyeOff, Copy, RotateCcw, X as CloseIcon, Info, Euro, RotateCw } from 'lucide-react';
import { formatDealTime, formatPrice, calculateDiscount, isDealActive } from '@/lib/deal-utils';
import DealEngagementStats from '@/components/DealEngagementStats';
import HelpTooltip from '@/components/HelpTooltip';
import { toast } from '@/lib/fake-toast';

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

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const pdfInputRef = useRef<HTMLInputElement | null>(null);
  const isUploadingMedia = uploadingImage || uploadingPdf;

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
        const mainImageUrl = data.variants.main || data.variants.hero || Object.values(data.variants)[0];
        
        if (!mainImageUrl) {
          throw new Error("Impossible de récupérer l'URL de l'image optimisée");
        }
        
        setFormData(prev => ({ 
          ...prev, 
          imageUrl: mainImageUrl,
          pdfUrl: '' // Effacer le PDF si une image est ajoutée
        }));
        
        // Afficher les économies réalisées
        if (data.totalSavingsPercentage > 0) {
          console.log(`✅ Image optimisée: ${data.totalSavingsPercentage.toFixed(1)}% d'économie d'espace`);
          toast.success(`📸 Image optimisée ! ${data.totalSavingsPercentage.toFixed(1)}% d'économie d'espace`);
        } else {
          toast.success('📸 Image ajoutée avec succès !');
        }
      } else {
        toast.error(`❌ ${data.error || 'Erreur lors de l\'upload de l\'image'}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      toast.error('❌ Erreur lors de l\'upload de l\'image');
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
        toast.success('📄 PDF ajouté avec succès !');
      } else {
        toast.error(`❌ ${data.error || 'Erreur lors de l\'upload du PDF'}`);
      }
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      toast.error('❌ Erreur lors de l\'upload du PDF');
    } finally {
      setUploadingPdf(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isUploadingMedia) {
      toast.error('⏳ Veuillez patienter, un upload est en cours...');
      return;
    }
    
    // Validation : exactement un média (image OU PDF) doit être fourni
    if (!formData.imageUrl && !formData.pdfUrl) {
      toast.error('📎 Veuillez ajouter soit une image, soit un PDF pour votre bon plan');
      return;
    }
    
    // Validation des dates pour les bons plans non récurrents
    if (!formData.isRecurring) {
      if (!formData.dateDebut || !formData.dateFin) {
        toast.error('📅 Veuillez renseigner les dates de début et de fin');
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
        
        toast.error(`❌ ${errorData.error || `Erreur ${response.status}: ${response.statusText}`}`);
        return;
      }

      const data = await response.json();
      
      if (data.success) {
        const successMessage = editingDeal 
          ? '✨ Bon plan mis à jour avec succès !' 
          : '🎉 Bon plan créé avec succès !';
        toast.success(successMessage);
        
        await loadDeals();
        resetForm();
        setShowForm(false);
      } else {
        toast.error(`❌ ${data.error || 'Erreur lors de la sauvegarde'}`);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error(`❌ Erreur lors de la sauvegarde du bon plan: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
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
        toast.success('🗑️ Bon plan supprimé avec succès !');
        await loadDeals();
      } else {
        toast.error(`❌ ${data.error || 'Erreur lors de la suppression'}`);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('❌ Erreur lors de la suppression du bon plan');
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
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            {editingDeal ? 'Modifier le bon plan' : 'Nouveau bon plan'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Informations générales */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Info className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">Informations générales</h4>
                  <p className="text-sm text-gray-600">Les détails principaux qui accrochent l'utilisateur.</p>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Titre */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre du bon plan <span className="text-red-500">*</span> <span className="text-gray-500 font-normal">Obligatoire</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                      placeholder="ex: -50% sur le menu Best Of"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span> <span className="text-gray-500 font-normal">Obligatoire</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                      placeholder="Décrivez votre offre en détail..."
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
                      placeholder="Jusqu'à épuisement des stocks"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
                </div>
              </div>
              </div>

            {/* Section 2: Prix & Lien */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Euro className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">Prix & Lien</h4>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Prix initial */}
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
                      placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

                  {/* Prix réduit */}
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
                      placeholder="0.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

                  {/* Lien promotion */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lien vers la promotion (optionnel)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </div>
                      <input
                        type="url"
                        name="promoUrl"
                        value={formData.promoUrl}
                        onChange={handleInputChange}
                        placeholder="https://example.com/promotion"
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 3: Calendrier */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">Calendrier</h4>
                  <p className="text-sm text-gray-600">Définissez la durée de validité.</p>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dates - conditionnelles selon la récurrence */}
              {!formData.isRecurring && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date de début <span className="text-red-500">*</span> <span className="text-gray-500 font-normal">Obligatoire</span>
                    </label>
                    <input
                      type="date"
                      name="dateDebut"
                      value={formData.dateDebut}
                      onChange={handleInputChange}
                      required
                          placeholder="jj/mm/aaaa"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date de fin <span className="text-red-500">*</span> <span className="text-gray-500 font-normal">Obligatoire</span>
                    </label>
                    <input
                      type="date"
                      name="dateFin"
                      value={formData.dateFin}
                      onChange={handleInputChange}
                      required
                          placeholder="jj/mm/aaaa"
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
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      Plage horaire active
                  <HelpTooltip content="Définissez l'heure de début de la plage horaire journalière où votre bon plan est actif. Si vous laissez vide ou si les deux heures sont identiques, le bon plan sera actif toute la journée." />
                </label>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Clock className="w-5 h-5 text-gray-400" />
                        </div>
                <input
                  type="time"
                  name="heureDebut"
                  value={formData.heureDebut}
                  onChange={handleInputChange}
                          placeholder="--:--"
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
                      <span className="text-gray-500">à</span>
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <Clock className="w-5 h-5 text-gray-400" />
                        </div>
                <input
                  type="time"
                  name="heureFin"
                  value={formData.heureFin}
                  onChange={handleInputChange}
                          placeholder="--:--"
                          className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                      </div>
                    </div>
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
                  <p className="text-sm text-gray-600">Ajoutez des visuels pour rendre votre bon plan plus attractif.</p>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Image principale */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image principale
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Cliquez ou glissez le fichier ici</p>
                        <p className="text-xs text-gray-500">Taille recommandée : 1200 x 800 pixels (ratio 3:2)</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          disabled={uploadingImage}
                          ref={imageInputRef}
                          className="hidden"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="mt-3 inline-block px-4 py-2 bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100 cursor-pointer text-sm font-medium transition-colors"
                        >
                          {uploadingImage ? 'Upload en cours...' : 'Choisir une image'}
                        </label>
                        {formData.imageUrl && (
                          <div className="mt-3 flex items-center gap-2">
                            <a
                              href={formData.imageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-orange-500 hover:text-orange-600"
                            >
                              <Eye className="w-5 h-5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, imageUrl: '' }));
                                if (imageInputRef.current) {
                                  imageInputRef.current.value = '';
                                }
                              }}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                              title="Supprimer l'image"
                            >
                              <CloseIcon className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* PDF optionnel */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Document PDF (optionnel)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Cliquez ou glissez le fichier ici</p>
                        <p className="text-xs text-gray-500">Pour les menus détaillés ou les conditions longues</p>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={handlePdfUpload}
                          disabled={uploadingPdf}
                          ref={pdfInputRef}
                          className="hidden"
                          id="pdf-upload"
                        />
                        <label
                          htmlFor="pdf-upload"
                          className="mt-3 inline-block px-4 py-2 bg-orange-50 text-orange-700 rounded-md hover:bg-orange-100 cursor-pointer text-sm font-medium transition-colors"
                        >
                          {uploadingPdf ? 'Upload en cours...' : 'Choisir un PDF'}
                        </label>
                        {formData.pdfUrl && (
                          <div className="mt-3 flex items-center gap-2">
                            <a
                              href={formData.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-orange-500 hover:text-orange-600"
                            >
                              <FileText className="w-5 h-5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, pdfUrl: '' }));
                                if (pdfInputRef.current) {
                                  pdfInputRef.current.value = '';
                                }
                              }}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                              title="Supprimer le PDF"
                            >
                              <CloseIcon className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 5: Bon plan actif */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Eye className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">Bon plan actif</h4>
                    <p className="text-sm text-gray-600">Rendre visible immédiatement</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
            </div>

            {/* Section 6: Récurrence - seulement si activée */}
            {formData.isRecurring && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <RotateCw className="w-5 h-5 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-lg font-semibold text-gray-900">Récurrence</h4>
                      <label className="relative inline-flex items-center cursor-pointer">
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
                          className="sr-only peer"
                    />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                    </label>
                  </div>
                    <p className="text-sm text-gray-600">Configurer ce bon plan pour qu'il se répète automatiquement.</p>
                  </div>
                </div>
                <div className="border-t border-orange-200 pt-4">
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
                        placeholder="jj/mm/aaaa"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Laissez vide pour une récurrence illimitée
                        </p>
                      </div>
                    </div>
                </div>
                    </div>
                  )}

            {/* Toggle récurrence - seulement si pas activée */}
            {!formData.isRecurring && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <RotateCw className="w-5 h-5 text-orange-600" />
                    </div>
              <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">Récurrence</h4>
                      <p className="text-sm text-gray-600">Configurer ce bon plan pour qu'il se répète automatiquement.</p>
                    </div>
                </div>
                  <label className="relative inline-flex items-center cursor-pointer">
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
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>
            </div>
            )}

            {/* Boutons */}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isUploadingMedia}
                className={`bg-orange-500 text-white px-6 py-2 rounded-lg transition-colors ${
                  isUploadingMedia ? 'opacity-50 cursor-not-allowed' : 'hover:bg-orange-600'
                }`}
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
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
    <div className={`bg-white border rounded-lg p-7 ${isActive ? 'border-orange-500 shadow-md shadow-orange-500/10' : 'border-gray-200'}`}>
      <div className="flex gap-4">
        {/* Image */}
        {deal.imageUrl && (
          <div className="flex-shrink-0">
            <img 
              src={deal.imageUrl} 
              alt={deal.title}
              className="w-28 h-28 md:w-32 md:h-32 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Contenu principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <h4 className="font-semibold text-sm md:text-base text-gray-900 truncate">{deal.title}</h4>
              {deal.isRecurring && (
                <div title="Bon plan récurrent" className="flex-shrink-0">
                  <RotateCcw className="text-orange-500 w-4 h-4" />
                </div>
              )}
            </div>
            {!deal.isActive && (
              <span className="flex-shrink-0 ml-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                Inactif
              </span>
            )}
          </div>
          
          <p className="text-xs md:text-sm text-gray-600 mb-2 line-clamp-2">{deal.description}</p>

          {/* Prix */}
          {(deal.originalPrice || deal.discountedPrice) && (
            <div className="flex items-center gap-2 mb-2">
              {deal.originalPrice && (
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(deal.originalPrice)}
                </span>
              )}
              {deal.discountedPrice && (
                <span className="text-lg md:text-xl font-bold text-orange-600">
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
          <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500 mb-2">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span className="line-clamp-1 truncate">{formatDealTime(deal)}</span>
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
      <div className="mt-4 pt-4 border-t border-gray-100">
        <DealEngagementStats 
          dealId={deal.id}
          establishmentId={deal.establishmentId}
        />
      </div>
    </div>
  );
}


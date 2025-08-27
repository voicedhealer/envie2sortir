"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Types
type ProfessionalData = {
  // Données légales/administratives
  siret: string;
  companyName: string;
  legalStatus: string;
  
  // Données personnelles du responsable
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Données de l'établissement
  establishmentName: string;
  description: string;
  address: string;
  latitude?: number;
  longitude?: number;
  
  // Catégorie et services
  primaryCategory: string;
  subCategories: string[];
  services: string[];
  ambiance: string[];
  
  // Photos
  photos: File[];
  
  // Réseaux sociaux
  website?: string;
  instagram?: string;
  facebook?: string;
  
  // Abonnement
  subscriptionPlan: 'free' | 'premium';
};

type FormStep = 1 | 2 | 3 | 4 | 5;

// Icônes simples en SVG
const Icons = {
  Camera: () => (
    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Upload: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  Check: () => (
    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  X: () => (
    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Info: () => (
    <svg className="inline w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Star: () => (
    <svg className="inline w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  Spinner: () => (
    <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
  )
};

// Configuration des catégories et services
const CATEGORIES = {
  bar: {
    label: "Bar / Pub / Brasserie",
    services: [
      "Cocktails maison", "Bières pression", "Vins au verre", "Tapas/Planches",
      "Happy Hour", "Terrasse", "Musique live", "DJ", "Écrans sport"
    ],
    ambiance: ["Décontractée", "Festive", "Cosy", "Branchée", "Sportive", "Romantique"]
  },
  restaurant: {
    label: "Restaurant",
    services: [
      "Menu du jour", "Carte des vins", "Terrasse", "Privatisation",
      "Livraison", "À emporter", "Brunch", "Menu enfant", "Végétarien/Vegan"
    ],
    ambiance: ["Gastronomique", "Bistrot", "Familiale", "Romantique", "Décontractée"]
  },
  nightclub: {
    label: "Discothèque / Club",
    services: [
      "Piste de danse", "Bar", "VIP/Carré", "Vestiaire", "Parking",
      "Fumoir", "Terrasse", "Événements privés"
    ],
    ambiance: ["Électro", "Hip-Hop", "Pop/Rock", "Latino", "Années 80/90", "Clubbing"]
  },
  escape_game: {
    label: "Escape Game",
    services: [
      "Plusieurs salles", "Team building", "Anniversaires", "Parking",
      "Vestiaire", "Espace détente", "Boutique souvenirs"
    ],
    ambiance: ["Horreur", "Aventure", "Mystère", "Sci-Fi", "Historique", "Familial"]
  },
  cinema: {
    label: "Cinéma",
    services: [
      "Plusieurs salles", "3D/IMAX", "Snack", "Parking",
      "Séances matinales", "Avant-premières", "Cinéma d'art"
    ],
    ambiance: ["Blockbusters", "Art et essai", "Familial", "Documentaires"]
  }
};

const SUBSCRIPTION_PLANS = {
  free: {
    label: "Plan Gratuit",
    features: [
      "1 photo maximum",
      "Informations de base",
      "Présence sur la carte",
      "Statistiques limitées"
    ],
    price: "0€/mois"
  },
  premium: {
    label: "Plan Premium",
    features: [
      "10 photos maximum",
      "Description détaillée",
      "Mise en avant dans les résultats",
      "Statistiques avancées",
      "Badge 'Partenaire vérifié'",
      "Support prioritaire"
    ],
    price: "29€/mois"
  }
};

export default function ProfessionalRegistrationForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<FormStep>(1);
  const [formData, setFormData] = useState<ProfessionalData>({
    siret: "",
    companyName: "",
    legalStatus: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    establishmentName: "",
    description: "",
    address: "",
    primaryCategory: "",
    subCategories: [],
    services: [],
    ambiance: [],
    photos: [],
    subscriptionPlan: "free"
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [siretVerification, setSiretVerification] = useState<{
    status: 'idle' | 'loading' | 'valid' | 'invalid';
    data?: any;
  }>({ status: 'idle' });

  // Vérification SIRET en temps réel
  const verifySiret = async (siret: string) => {
    if (siret.length !== 14) return;
    
    setSiretVerification({ status: 'loading' });
    
    try {
      // Simulation d'appel API - à remplacer par une vraie API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulation de données retournées
      const mockData = {
        valid: true,
        denomination: "SARL EXEMPLE",
        categorieJuridiqueUniteLegale: "SARL",
        adresse: "123 Rue de la Paix, 21000 Dijon"
      };
      
      setSiretVerification({ status: 'valid', data: mockData });
      setFormData(prev => ({
        ...prev,
        companyName: mockData.denomination || "",
        legalStatus: mockData.categorieJuridiqueUniteLegale || "",
        address: mockData.adresse || ""
      }));
    } catch (error) {
      setSiretVerification({ status: 'invalid' });
    }
  };

  const handleInputChange = (field: keyof ProfessionalData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'siret' && typeof value === 'string') {
      const cleanSiret = value.replace(/\s/g, '');
      setFormData(prev => ({ ...prev, siret: cleanSiret }));
      
      if (cleanSiret.length === 14) {
        verifySiret(cleanSiret);
      }
    }
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleArrayToggle = (field: 'subCategories' | 'services' | 'ambiance', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const handlePhotoUpload = (files: FileList) => {
    const maxPhotos = formData.subscriptionPlan === 'premium' ? 10 : 1;
    const newPhotos = Array.from(files).slice(0, maxPhotos - formData.photos.length);
    
    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, ...newPhotos]
    }));
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step: FormStep): boolean => {
    const newErrors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.siret) newErrors.siret = "SIRET requis";
        if (siretVerification.status !== 'valid') newErrors.siret = "SIRET invalide";
        if (!formData.firstName) newErrors.firstName = "Prénom requis";
        if (!formData.lastName) newErrors.lastName = "Nom requis";
        if (!formData.email) newErrors.email = "Email requis";
        if (!formData.phone) newErrors.phone = "Téléphone requis";
        break;
      
      case 2:
        if (!formData.establishmentName) newErrors.establishmentName = "Nom requis";
        if (!formData.address) newErrors.address = "Adresse requise";
        if (!formData.primaryCategory) newErrors.primaryCategory = "Catégorie requise";
        break;
      
      case 3:
        if (formData.services.length === 0) newErrors.services = "Sélectionnez au moins un service";
        if (formData.ambiance.length === 0) newErrors.ambiance = "Sélectionnez au moins une ambiance";
        break;
      
      case 4:
        if (formData.photos.length === 0) newErrors.photos = "Au moins une photo requise";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(5, prev + 1) as FormStep);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(1, prev - 1) as FormStep);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    
    try {
      const formDataToSend = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'photos') {
          value.forEach((photo: File, index: number) => {
            formDataToSend.append(`photo_${index}`, photo);
          });
        } else if (Array.isArray(value)) {
          formDataToSend.append(key, JSON.stringify(value));
        } else if (value !== undefined && value !== null) {
          formDataToSend.append(key, value.toString());
        }
      });
      
      // Simulation d'envoi - remplacer par une vraie API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      alert('Inscription réussie ! Votre établissement sera vérifié sous 24h.');
      router.push('/');
      
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'inscription');
    } finally {
      setIsSubmitting(false);
    }
  };

/**
 * Composant de rendu dynamique pour chaque étape du formulaire professionnel.
 * Affiche le contenu correspondant à l'étape courante, gère la validation front, 
 * et permet d'adapter facilement les contenus pour chaque logique métier.
 *
 * Utilisation : placer `{renderStep()}` dans le JSX parent, et inclure les états nécessaires :
 *  - currentStep, formData, errors, handleInputChange, etc.
 */
const renderStep = () => {
  switch (currentStep) {
    // === Étape 1 : Informations professionnelles et vérification SIRET ===
    case 1:
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Vérification professionnelle
            </h2>
            <p className="text-gray-600 mt-2">
              Nous devons vérifier votre statut professionnel pour valider votre inscription
            </p>
          </div>
          {/* Champ SIRET + indication du statut de vérification */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Numéro SIRET * <Icons.Info />
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.siret}
                onChange={(e) =>
                  handleInputChange('siret', e.target.value)
                }
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.siret ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="14 chiffres (ex: 12345678901234)"
                maxLength={14}
              />
              <div className="absolute right-3 top-3">
                {siretVerification.status === 'loading' && <Icons.Spinner />}
                {siretVerification.status === 'valid' && <Icons.Check />}
                {siretVerification.status === 'invalid' && <Icons.X />}
              </div>
            </div>
            {/* Feedback de vérification */}
            {siretVerification.status === 'valid' && siretVerification.data && (
              <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ Entreprise vérifiée: {siretVerification.data.denomination}
                </p>
              </div>
            )}
            {errors.siret && <p className="text-red-500 text-sm mt-1">{errors.siret}</p>}
          </div>

          {/* Champs du responsable */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Prénom *</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Nom *</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Email professionnel *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Téléphone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
          </div>
        </div>
      );
    // === Etape 2 : Informations établissement ===
    case 2:
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Informations sur l’établissement
            </h2>
            <p className="text-gray-600 mt-2">
              Décrivez votre établissement pour que les clients le trouvent facilement
            </p>
          </div>
          {/* Nom commercial */}
          <div>
            <label className="block text-sm font-medium mb-2">Nom de l’établissement *</label>
            <input
              type="text"
              value={formData.establishmentName}
              onChange={(e) => handleInputChange('establishmentName', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.establishmentName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: Le Central Bar"
            />
            {errors.establishmentName && <p className="text-red-500 text-sm mt-1">{errors.establishmentName}</p>}
          </div>
          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Description de l’établissement</label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Décrivez l’ambiance, les spécialités, etc."
            />
          </div>
          {/* Adresse complète */}
          <div>
            <label className="block text-sm font-medium mb-2">Adresse complète *</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="10 Rue Principale, 21000 Dijon"
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>
          {/* Catégorie principale */}
          <div>
            <label className="block text-sm font-medium mb-2">Catégorie principale *</label>
            <select
              value={formData.primaryCategory}
              onChange={(e) => handleInputChange('primaryCategory', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.primaryCategory ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Sélectionnez une catégorie</option>
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <option key={key} value={key}>{cat.label}</option>
              ))}
            </select>
            {errors.primaryCategory && <p className="text-red-500 text-sm mt-1">{errors.primaryCategory}</p>}
          </div>
        </div>
      );
    // === Etape 3 : Services & Ambiances ===
    case 3: {
      // On récupère la catégorie pour afficher les bons services/ambiances dynamiquement
      const selectedCategory = CATEGORIES[formData.primaryCategory as keyof typeof CATEGORIES];
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">
              Services et ambiance
            </h2>
            <p className="text-gray-600 mt-2">
              Sélectionnez ce que votre établissement propose réellement
            </p>
          </div>
          {/* Liste de services */}
          {selectedCategory &&
            <div>
              <label className="block text-sm font-medium mb-4">Quels services proposez-vous ? *</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {selectedCategory.services.map((service) => (
                  <label key={service} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.services.includes(service)}
                      onChange={() => handleArrayToggle('services', service)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{service}</span>
                  </label>
                ))}
              </div>
              {errors.services && <p className="text-red-500 text-sm mt-1">{errors.services}</p>}
            </div>
          }
          {/* Liste d’ambiances */}
          {selectedCategory &&
            <div>
              <label className="block text-sm font-medium mb-4">
                Quelle ambiance décrit le mieux votre établissement ? *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {selectedCategory.ambiance.map((amb) => (
                  <label key={amb} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.ambiance.includes(amb)}
                      onChange={() => handleArrayToggle('ambiance', amb)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{amb}</span>
                  </label>
                ))}
              </div>
              {errors.ambiance && <p className="text-red-500 text-sm mt-1">{errors.ambiance}</p>}
            </div>
          }
        </div>
      );
    }
    // === Etape 4 : Abonnement & photos ===
    case 4:
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Photos & abonnement</h2>
            <p className="text-gray-600 mt-2">
              Ajoutez une belle photo (ou plusieurs si plan premium) de votre établissement
            </p>
          </div>
          {/* Sélection du plan */}
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
              <div
                key={key}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.subscriptionPlan === key
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleInputChange('subscriptionPlan', key)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{plan.label}</h3>
                  <span className="text-lg font-bold text-blue-600">{plan.price}</span>
                </div>
                <ul className="text-sm space-y-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <Icons.Check />
                      <span className="ml-2">{feature}</span>
                    </li>
                  ))}
                </ul>
                {key === 'premium' && (
                  <div className="mt-2">
                    <Icons.Star />
                    <span className="text-sm text-gray-600 ml-1">Recommandé</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Upload des photos */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Photos ({formData.photos.length}/{formData.subscriptionPlan === 'premium' ? 10 : 1})
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Icons.Camera />
              <div className="space-y-2 mt-4">
                <p className="text-sm text-gray-600">
                  Glissez vos photos ici ou cliquez pour sélectionner
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && handlePhotoUpload(e.target.files)}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700"
                >
                  <Icons.Upload />
                  <span className="ml-2">Sélectionner des photos</span>
                </label>
              </div>
            </div>
            {/* Aperçu */}
            {formData.photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {errors.photos && <p className="text-red-500 text-sm mt-1">{errors.photos}</p>}
          </div>
        </div>
      );
    // === Etape 5 : Finalisation/Réseaux et résumé ===
    case 5:
      return (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Réseaux & finalisation</h2>
            <p className="text-gray-600 mt-2">
              Derniers détails avant validation de votre fiche établissement
            </p>
          </div>
          {/* Liens réseaux sociaux */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Site web</label>
              <input
                type="url"
                value={formData.website || ''}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://www.votre-site.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Instagram</label>
              <input
                type="text"
                value={formData.instagram || ''}
                onChange={(e) => handleInputChange('instagram', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="@votre_compte"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Facebook</label>
            <input
              type="url"
              value={formData.facebook || ''}
              onChange={(e) => handleInputChange('facebook', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://www.facebook.com/votre-page"
            />
          </div>
          {/* Récapitulatif */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold mb-4">Récapitulatif de votre inscription</h3>
            <div className="space-y-2 text-sm">
              <p><strong>Établissement :</strong> {formData.establishmentName}</p>
              <p>
                <strong>Catégorie :</strong>{' '}
                {CATEGORIES[formData.primaryCategory as keyof typeof CATEGORIES]?.label}
              </p>
              <p>
                <strong>Services :</strong> {formData.services.slice(0, 3).join(', ')}{formData.services.length > 3 ? '...' : ''}
              </p>
              <p><strong>Plan :</strong> {SUBSCRIPTION_PLANS[formData.subscriptionPlan].label}</p>
              <p><strong>Photos :</strong> {formData.photos.length}</p>
            </div>
          </div>
          {/* Conditions d'utilisation */}
          <div className="text-sm text-gray-600">
            <label className="flex items-start space-x-2">
              <input type="checkbox" className="mt-1 rounded text-blue-600 focus:ring-blue-500" required />
              <span>
                J'accepte les{' '}
                <a href="/conditions" className="text-blue-600 underline">
                  conditions générales d'utilisation
                </a>
                {' '}et la{' '}
                <a href="/politique-confidentialite" className="text-blue-600 underline">
                  politique de confidentialité
                </a>
              </span>
            </label>
          </div>
        </div>
      );
    // Sécurité fallback si étape inconnue
    default:
      return <div>Erreur technique : étape inconnue.</div>;
  }
};

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step <= currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step}
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 5) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-8">
        {renderStep()}

        <div className="flex justify-between mt-8 pt-6 border-t">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>

          {currentStep < 5 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Suivant
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Inscription en cours...' : 'Finaliser l\'inscription'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

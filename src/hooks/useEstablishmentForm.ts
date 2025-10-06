import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { 
  ProfessionalData, 
  FormStep, 
  SiretVerification, 
  PhoneVerification, 
  ExistingEstablishment 
} from '@/types/establishment-form.types';
import { EnrichmentData } from '@/lib/enrichment-system';
import { 
  parseAddressFromGoogle, 
  convertAccessibilityArrayToObject,
  convertServicesAvailableArrayToObject,
  convertDiningServicesArrayToObject,
  convertOfferingsArrayToObject,
  convertAtmosphereArrayToObject,
  convertGeneralServicesArrayToObject,
  convertPaymentMethodsArrayToObject,
  convertPaymentMethodsObjectToArray,
  parseAddress,
  isValidFrenchPhone,
  isValidEmail,
  isValidPassword,
  isValidSiret
} from '@/lib/establishment-form.utils';

interface UseEstablishmentFormProps {
  establishment?: ExistingEstablishment;
  isEditMode?: boolean;
}

export function useEstablishmentForm({ establishment, isEditMode = false }: UseEstablishmentFormProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // États principaux
  const [currentStep, setCurrentStep] = useState<FormStep>(isEditMode ? 2 : 0);
  const [formData, setFormData] = useState<ProfessionalData>(() => {
    // Pré-remplir avec les données existantes si en mode édition
    if (isEditMode && establishment) {
      return {
        // Données de compte (étape 0) - non modifiables en mode édition
        accountEmail: "",
        accountPassword: "",
        accountPasswordConfirm: "",
        accountFirstName: "",
        accountLastName: "",
        accountPhone: "",
        
        // Données légales/administratives - non modifiables en mode édition
        siret: "",
        companyName: "",
        legalStatus: "",
        
        // Données de l'établissement - pré-remplies
        establishmentName: establishment.name || "",
        description: establishment.description || "",
        address: {
          street: establishment.address || "",
          postalCode: establishment.postalCode || "",
          city: establishment.city || "",
          latitude: establishment.latitude || undefined,
          longitude: establishment.longitude || undefined
        },
        activities: establishment.activities || [],
        services: establishment.services || [],
        ambiance: establishment.ambiance || [],
        paymentMethods: undefined,
        tags: establishment.tags || [],
        photos: [],
        hours: establishment.horairesOuverture || {},
        website: establishment.website || "",
        instagram: establishment.instagram || "",
        facebook: establishment.facebook || "",
        tiktok: establishment.tiktok || "",
        youtube: establishment.youtube || "",
        priceMin: establishment.priceMin || undefined,
        priceMax: establishment.priceMax || undefined,
        informationsPratiques: establishment.informationsPratiques || [],
        subscriptionPlan: establishment.subscription === 'PREMIUM' ? 'premium' : 'free'
      };
    }
    
    // Valeurs par défaut pour la création
    return {
      accountEmail: "",
      accountPassword: "",
      accountPasswordConfirm: "",
      accountFirstName: "",
      accountLastName: "",
      accountPhone: "",
      siret: "",
      companyName: "",
      legalStatus: "",
      establishmentName: "",
      description: "",
      address: {
        street: "",
        postalCode: "",
        city: "",
        latitude: undefined,
        longitude: undefined
      },
      activities: [],
      services: [],
      ambiance: [],
      paymentMethods: undefined,
      tags: [],
      photos: [],
      hours: {},
      priceMin: undefined,
      priceMax: undefined,
      informationsPratiques: [],
      subscriptionPlan: "free"
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [envieGeneratedTags, setEnvieGeneratedTags] = useState<string[]>([]);
  
  // État pour la vérification SMS
  const [phoneVerification, setPhoneVerification] = useState<PhoneVerification>({
    isVerified: false,
    isSending: false,
    verificationCode: '',
    error: ''
  });
  
  // État pour le modal de vérification téléphone
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  
  const [enrichmentData, setEnrichmentData] = useState<EnrichmentData>({
    name: '',
    establishmentType: '',
    priceLevel: 0,
    rating: 0,
    address: '',
    phone: '',
    website: '',
    description: '',
    openingHours: [],
    hours: {},
    practicalInfo: [],
    envieTags: [],
    specialties: [],
    atmosphere: [],
    googlePlaceId: '',
    googleBusinessUrl: '',
    googleRating: 0,
    googleReviewCount: 0,
    theForkLink: '',
    uberEatsLink: '',
    accessibilityInfo: [],
    servicesAvailableInfo: [],
    pointsForts: [],
    populairePour: [],
    offres: [],
    servicesRestauration: [],
    servicesInfo: [],
    ambianceInfo: [],
    clientele: [],
    planning: [],
    paiements: [],
    enfants: [],
    parking: []
  });
  
  const [siretVerification, setSiretVerification] = useState<SiretVerification>({ status: 'idle' });

  // Cache pour le token CSRF
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [csrfTokenExpiry, setCsrfTokenExpiry] = useState<number>(0);

  // Vérification si l'utilisateur a déjà un établissement
  useEffect(() => {
    const checkExistingEstablishment = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/professional/establishments');
          if (response.ok) {
            const data = await response.json();
            if (data.establishment) {
              router.push('/dashboard?tab=overview');
            }
          }
        } catch (error) {
          console.error('Erreur lors de la vérification de l\'établissement:', error);
        }
      }
    };

    if (status === 'authenticated') {
      checkExistingEstablishment();
    }
  }, [session, status, router]);


  // Charger les données existantes en mode édition
  useEffect(() => {
    if (isEditMode && establishment) {
      console.log('🔄 Chargement des données existantes en mode édition:', establishment);
      
      // Charger les données du professionnel (propriétaire)
      if (establishment.owner) {
        console.log('👤 Chargement des données du professionnel:', establishment.owner);
        setFormData(prev => ({
          ...prev,
          firstName: establishment.owner.firstName || "",
          lastName: establishment.owner.lastName || "",
          email: establishment.owner.email || "",
          phone: establishment.owner.phone || "",
          companyName: establishment.owner.companyName || "",
          siret: establishment.owner.siret || "",
          legalStatus: establishment.owner.legalStatus || ""
        }));
      }
      
      const parsedAddress = parseAddress(establishment.address || "");
      
      console.log('🔍 Parsing de l\'adresse:', {
        original: establishment.address,
        parsed: parsedAddress,
        hasCoordinates: !!(establishment.latitude && establishment.longitude)
      });

      // Charger les données de l'établissement
      const newFormData = {
        establishmentName: establishment.name || "",
        description: establishment.description || "",
        address: {
          street: parsedAddress.street || establishment.address || "",
          postalCode: establishment.postalCode || parsedAddress.postalCode || "",
          city: establishment.city || parsedAddress.city || "",
          latitude: establishment.latitude || undefined,
          longitude: establishment.longitude || undefined
        },
        phone: establishment.phone || "",
        whatsappPhone: establishment.whatsappPhone || "",
        messengerUrl: establishment.messengerUrl || "",
        email: establishment.email || "",
        website: establishment.website || "",
        instagram: establishment.instagram || "",
        facebook: establishment.facebook || "",
        tiktok: establishment.tiktok || "",
        youtube: establishment.youtube || "",
        activities: establishment.activities ? (typeof establishment.activities === 'string' ? JSON.parse(establishment.activities) : establishment.activities) : [],
        paymentMethods: establishment.paymentMethods ? convertPaymentMethodsArrayToObject(typeof establishment.paymentMethods === 'string' ? JSON.parse(establishment.paymentMethods) : establishment.paymentMethods) : {},
        horairesOuverture: establishment.horairesOuverture ? (typeof establishment.horairesOuverture === 'string' ? JSON.parse(establishment.horairesOuverture) : establishment.horairesOuverture) : {},
        prixMoyen: establishment.prixMoyen || "",
        capaciteMax: establishment.capaciteMax || "",
        accessibilite: establishment.accessibilite ? (typeof establishment.accessibilite === 'string' ? JSON.parse(establishment.accessibilite) : establishment.accessibilite) : {},
        parking: establishment.parking || false,
        terrasse: establishment.terrasse || false,
        priceMin: establishment.priceMin || "",
        priceMax: establishment.priceMax || ""
      };
      
      setFormData(prev => ({ ...prev, ...newFormData }));
      
      // Déclencher la géolocalisation automatique si l'adresse est complète
      if (newFormData.address.street && newFormData.address.postalCode && newFormData.address.city) {
        console.log('🚀 Déclenchement de la géolocalisation automatique en mode édition');
        setTimeout(() => {
          handleInputChange('address', newFormData.address);
        }, 100);
      }
      
      // Charger les données Google Places existantes
      if (establishment.services) {
        try {
          const services = typeof establishment.services === 'string' 
            ? JSON.parse(establishment.services) 
            : establishment.services;
          setFormData(prev => ({ ...prev, services: Array.isArray(services) ? services : [] }));
        } catch (error) {
          console.error('Erreur parsing services:', error);
        }
      }
      
      if (establishment.ambiance) {
        try {
          const ambiance = typeof establishment.ambiance === 'string' 
            ? JSON.parse(establishment.ambiance) 
            : establishment.ambiance;
          setFormData(prev => ({ ...prev, ambiance: Array.isArray(ambiance) ? ambiance : [] }));
        } catch (error) {
          console.error('Erreur parsing ambiance:', error);
        }
      }
      
      if (establishment.informationsPratiques) {
        try {
          const informationsPratiques = typeof establishment.informationsPratiques === 'string' 
            ? JSON.parse(establishment.informationsPratiques) 
            : establishment.informationsPratiques;
          setFormData(prev => ({ ...prev, informationsPratiques: Array.isArray(informationsPratiques) ? informationsPratiques : [] }));
        } catch (error) {
          console.error('Erreur parsing informationsPratiques:', error);
        }
      }
      
      // Charger les tags existants
      if (establishment.tags && Array.isArray(establishment.tags)) {
        const existingTags = establishment.tags.map(t => t.tag);
        console.log("🏷️ Tags existants chargés:", existingTags);
        setFormData(prev => ({ ...prev, tags: existingTags }));
      }
      
      // Charger les envie tags existants
      if (establishment.envieTags && Array.isArray(establishment.envieTags)) {
        console.log("💭 Envie tags existants chargés:", establishment.envieTags);
        setFormData(prev => ({ ...prev, envieTags: establishment.envieTags }));
      }      
      console.log('✅ Toutes les données chargées en mode édition');
    }
  }, [isEditMode, establishment]);

  // Géocodage automatique en mode édition si l'adresse n'a pas de coordonnées
  useEffect(() => {
    if (isEditMode && formData.address && 
        formData.address.street && formData.address.postalCode && formData.address.city &&
        (!formData.address.latitude || !formData.address.longitude)) {
      
      console.log('🌍 Géocodage automatique en mode édition pour:', formData.address);
      
      const geocodeAddress = async () => {
        try {
          const fullAddress = `${formData.address.street}, ${formData.address.postalCode} ${formData.address.city}`;
          const response = await fetch(`/api/geocode?address=${encodeURIComponent(fullAddress)}`);
          const result = await response.json();

          if (result.success && result.data) {
            console.log('✅ Géocodage réussi en mode édition:', result.data);
            setFormData(prev => ({
              ...prev,
              address: {
                ...prev.address,
                latitude: result.data.latitude,
                longitude: result.data.longitude
              }
            }));
          } else {
            console.log('❌ Échec du géocodage en mode édition:', result);
          }
        } catch (error) {
          console.error('❌ Erreur géocodage en mode édition:', error);
        }
      };

      geocodeAddress();
    }
  }, [isEditMode, formData.address?.street, formData.address?.postalCode, formData.address?.city]);

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
        legalStatus: mockData.categorieJuridiqueUniteLegale || ""
      }));
    } catch (error) {
      setSiretVerification({ status: 'invalid' });
    }
  };

  // Fonction pour gérer la validation de l'adresse
  const handleAddressValidation = useCallback((isValid: boolean) => {
    if (isValid) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.address;
        return newErrors;
      });
    }
  }, []);

  const handleInputChange = (field: string, value: any) => {
    // Debug: afficher les changements de champs du compte
    if (field === 'accountFirstName' || field === 'accountLastName') {
      console.log(`Hook - ${field} changé:`, value);
    }
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Gestion spéciale pour le reset de la vérification téléphone
    if (field === 'resetPhoneVerification') {
      setPhoneVerification(prev => ({
        ...prev,
        isVerified: false,
        error: ''
      }));
      return;
    }
    
    // Gestion spéciale pour l'auto-validation du téléphone
    if (field === 'autoVerifyPhone') {
      // Déclencher automatiquement l'envoi du SMS
      sendVerificationCode();
      return;
    }
    
    // Gestion spéciale pour le téléphone - validation en temps réel
    if (field === 'accountPhone' && typeof value === 'string') {
      const cleanPhone = value.replace(/\s/g, '').replace(/[^\d+]/g, '');
      const isValidFrenchPhone = /^(0[67]|\+33[67])[0-9]{8}$/.test(cleanPhone);
      
      // Si le numéro change et qu'il était vérifié, reset l'état
      if (phoneVerification.isVerified && value !== formData.accountPhone) {
        setPhoneVerification(prev => ({
          ...prev,
          isVerified: false,
          error: ''
        }));
      }
      
      // Si le numéro n'est plus valide ou est vide, reset l'état de vérification
      if (phoneVerification.isVerified && (!isValidFrenchPhone || !value.trim())) {
        setPhoneVerification(prev => ({
          ...prev,
          isVerified: false,
          error: ''
        }));
      }
    }
    
    if (field === 'siret' && typeof value === 'string') {
      const cleanSiret = value.replace(/\s/g, '');
      setFormData(prev => ({ ...prev, siret: cleanSiret }));
      
      if (cleanSiret.length === 14) {
        verifySiret(cleanSiret);
      }
    }
    
    // Gestion spéciale pour l'adresse (AddressData)
    if (field === 'address' && typeof value === 'object') {
      console.log('📍 Adresse mise à jour:', value);
    }
    
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Fonctions pour la vérification SMS
  const sendVerificationCode = async () => {
    if (!formData.accountPhone) {
      setPhoneVerification(prev => ({ ...prev, error: 'Numéro de téléphone requis' }));
      return;
    }

    // Vérifier que le numéro est valide avant d'envoyer
    const cleanPhone = formData.accountPhone.replace(/\s/g, '').replace(/[^\d+]/g, '');
    const isValidFrenchPhone = /^(0[67]|\+33[67])[0-9]{8}$/.test(cleanPhone);
    
    if (!isValidFrenchPhone) {
      setPhoneVerification(prev => ({ 
        ...prev, 
        error: 'Format de téléphone mobile français invalide (doit commencer par 06 ou 07)'
      }));
      return;
    }

    setPhoneVerification(prev => ({ ...prev, isSending: true, error: '' }));

    try {
      const response = await fetch('/api/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: formData.accountPhone, 
          action: 'send' 
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPhoneVerification(prev => ({ 
          ...prev, 
          isSending: false,
          error: ''
        }));
        console.log('📱 Code de vérification envoyé automatiquement:', data.debugCode);
        // Ouvrir automatiquement le modal de vérification
        setShowPhoneModal(true);
      } else {
        setPhoneVerification(prev => ({ 
          ...prev, 
          isSending: false,
          error: data.error || 'Erreur lors de l\'envoi du code'
        }));
      }
    } catch (error) {
      setPhoneVerification(prev => ({ 
        ...prev, 
        isSending: false,
        error: 'Erreur de connexion'
      }));
    }
  };

  const verifyCode = async () => {
    if (!phoneVerification.verificationCode) {
      setPhoneVerification(prev => ({ ...prev, error: 'Code de vérification requis' }));
      return;
    }

    try {
      const response = await fetch('/api/verify-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phone: formData.accountPhone, 
          action: 'verify',
          code: phoneVerification.verificationCode
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPhoneVerification(prev => ({ 
          ...prev, 
          isVerified: true,
          error: ''
        }));
        nextStep();
      } else {
        setPhoneVerification(prev => ({ 
          ...prev, 
          error: data.error || 'Code de vérification incorrect'
        }));
      }
    } catch (error) {
      setPhoneVerification(prev => ({ 
        ...prev, 
        error: 'Erreur de connexion'
      }));
    }
  };

  // Fonctions pour gérer le modal de vérification téléphone
  const handlePhoneVerificationSuccess = () => {
    setPhoneVerification(prev => ({ 
      ...prev, 
      isVerified: true,
      error: ''
    }));
    setShowPhoneModal(false);
  };

  const handleClosePhoneModal = () => {
    setShowPhoneModal(false);
  };

  // Fonction pour récupérer un token CSRF valide
  const getCSRFToken = async (): Promise<string> => {
    const now = Date.now();
    
    if (csrfToken && csrfTokenExpiry > now) {
      return csrfToken;
    }
    
    try {
      const response = await fetch('/api/csrf/token');
      const data = await response.json();
      
      if (data.token) {
        setCsrfToken(data.token);
        setCsrfTokenExpiry(now + (5 * 60 * 1000)); // 5 minutes
        return data.token;
      }
      
      throw new Error('Token CSRF non reçu');
    } catch (error) {
      console.error('Erreur lors de la récupération du token CSRF:', error);
      throw new Error('Impossible de récupérer le token CSRF');
    }
  };

  const handleEnrichmentComplete = (enrichmentData: EnrichmentData) => {
    console.log('🎯 handleEnrichmentComplete appelé avec:', enrichmentData);
    
    setFormData(prev => ({
      ...prev,
      establishmentName: enrichmentData.name || prev.establishmentName,
      description: enrichmentData.description || prev.description,
      phone: enrichmentData.phone || prev.phone,
      website: enrichmentData.website || prev.website,
      
      services: enrichmentData.servicesArray || [],
      ambiance: enrichmentData.ambianceArray || [],
      activities: enrichmentData.activities || [],
      paymentMethods: enrichmentData.paymentMethodsArray ? 
        convertPaymentMethodsArrayToObject(enrichmentData.paymentMethodsArray) : 
        prev.paymentMethods,
      informationsPratiques: enrichmentData.informationsPratiques || prev.informationsPratiques,
      address: enrichmentData.address ? {
        ...parseAddressFromGoogle(enrichmentData.address),
        latitude: enrichmentData.latitude,
        longitude: enrichmentData.longitude
      } : prev.address,
      hours: enrichmentData.hours || prev.hours,
      envieTags: enrichmentData.envieTags || prev.envieTags,
      theForkLink: enrichmentData.theForkLink || prev.theForkLink,
      uberEatsLink: enrichmentData.uberEatsLink || prev.uberEatsLink,
      
      accessibilityInfo: convertAccessibilityArrayToObject(enrichmentData.accessibilityInfo) || prev.accessibilityInfo,
      servicesAvailable: convertServicesAvailableArrayToObject(enrichmentData.servicesAvailableInfo) || prev.servicesAvailable,
      diningServices: convertDiningServicesArrayToObject(enrichmentData.servicesRestauration) || prev.diningServices,
      offerings: convertOfferingsArrayToObject(enrichmentData.offres) || prev.offerings,
      atmosphereFeatures: convertAtmosphereArrayToObject(enrichmentData.ambianceInfo) || prev.atmosphereFeatures,
      generalServices: convertGeneralServicesArrayToObject(enrichmentData.servicesInfo) || prev.generalServices,
      
      hybridAccessibilityDetails: enrichmentData.accessibilityDetails,
      hybridDetailedServices: enrichmentData.detailedServices,
      hybridClienteleInfo: enrichmentData.clienteleInfo,
      hybridDetailedPayments: enrichmentData.detailedPayments,
      hybridChildrenServices: enrichmentData.childrenServices,
      hybridParkingInfo: enrichmentData.parkingInfo,
      
      enriched: true
    }));
    
    setEnrichmentData(enrichmentData);
    
    console.log('✅ Données d\'enrichissement intégrées, passage à l\'étape 3');
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTagsChange = (tags: string[]) => {
    const allTags = [...new Set([...tags, ...envieGeneratedTags])];
    setFormData(prev => ({ ...prev, tags: allTags }));
  };

  const handleEnvieTagsGenerated = (generatedTags: string[]) => {
    setEnvieGeneratedTags(generatedTags);
    const currentManualTags = formData.tags.filter(tag => !envieGeneratedTags.includes(tag));
    const allTags = [...new Set([...currentManualTags, ...generatedTags])];
    setFormData(prev => ({ ...prev, tags: allTags }));
  };

  const handleArrayToggle = (field: 'services' | 'ambiance' | 'informationsPratiques', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  const validateStep = (step: FormStep): boolean => {
    const newErrors: Record<string, string> = {};

    if (isEditMode && (step === 0 || step === 1)) {
      return true;
    }

    switch (step) {
      case 0:
        if (!formData.accountFirstName) newErrors.accountFirstName = "Prénom requis";
        if (!formData.accountLastName) newErrors.accountLastName = "Nom requis";
        if (!formData.accountEmail) newErrors.accountEmail = "Email requis";
        else if (!isValidEmail(formData.accountEmail)) {
          newErrors.accountEmail = "Format d'email invalide";
        }
        if (!formData.accountPassword) newErrors.accountPassword = "Mot de passe requis";
        else {
          const passwordValidation = isValidPassword(formData.accountPassword);
          if (!passwordValidation.isValid) {
            newErrors.accountPassword = `Mot de passe invalide : ${passwordValidation.errors.join(', ')}`;
          }
        }
        if (!formData.accountPhone) newErrors.accountPhone = "Téléphone professionnel requis pour la vérification";
        else if (!isValidFrenchPhone(formData.accountPhone)) {
          newErrors.accountPhone = "Format de téléphone mobile français invalide (doit commencer par 06 ou 07)";
        }
        if (!phoneVerification.isVerified) {
          newErrors.phoneVerification = "Vérification du téléphone requise";
        }
        if (!formData.accountPasswordConfirm) newErrors.accountPasswordConfirm = "Confirmation du mot de passe requise";
        else if (formData.accountPassword !== formData.accountPasswordConfirm) {
          newErrors.accountPasswordConfirm = "Les mots de passe ne correspondent pas";
        }
        break;

      case 1:
        if (!formData.siret) newErrors.siret = "SIRET requis";
        if (siretVerification.status !== 'valid') newErrors.siret = "SIRET invalide";
        break;
      
      case 2:
        // Étape d'enrichissement - pas de validation spécifique
        break;
      
      case 3:
        // Validation des activités proposées - champ obligatoire
        if (formData.activities.length === 0) {
          newErrors.activities = "Veuillez sélectionner au moins une activité";
        }
        if (!formData.establishmentName) newErrors.establishmentName = "Nom requis";
        if (!formData.address.street || !formData.address.postalCode || !formData.address.city) {
          newErrors.address = "Adresse complète requise (rue, code postal et ville)";
        }
        if (!formData.address.latitude || !formData.address.longitude) {
          newErrors.address = "Géolocalisation requise pour valider l'adresse";
        }
        break;
      
      case 4:
        break;
      
      case 5:
        if (!isEditMode && formData.tags.length < 3) {
          newErrors.tags = "Sélectionnez au moins 3 tags de recherche";
        }
        break;
      
      case 6:
        if (!formData.subscriptionPlan) newErrors.subscriptionPlan = "Veuillez sélectionner un plan";
        break;
      
      case 7:
        break;
      
      case 8:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(8, prev + 1) as FormStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1) as FormStep);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    console.log('🚀 handleSubmit appelé, étape courante:', currentStep);
    if (!validateStep(currentStep)) {
      console.log('❌ Validation échouée pour l\'étape:', currentStep);
      return;
    }
    
    console.log('✅ Validation réussie, début de la soumission...');
    setIsSubmitting(true);
    
    try {
      if (isEditMode && establishment) {
        // Mode édition - utiliser l'API de mise à jour
        const updateData = {
          name: formData.establishmentName,
          description: formData.description,
          address: formData.address.street,
          city: formData.address.city,
          postalCode: formData.address.postalCode,
          latitude: formData.address.latitude,
          longitude: formData.address.longitude,
          activities: formData.activities,
          services: formData.services,
          ambiance: formData.ambiance,
          paymentMethods: formData.paymentMethods,
          horairesOuverture: formData.hours,
          phone: formData.phone,
          whatsappPhone: formData.whatsappPhone,
          messengerUrl: formData.messengerUrl,
          email: formData.email,
          website: formData.website,
          instagram: formData.instagram,
          facebook: formData.facebook,
          tiktok: formData.tiktok,
          youtube: formData.youtube,
          priceMin: formData.priceMin,
          priceMax: formData.priceMax,
          informationsPratiques: formData.informationsPratiques,
          subscription: formData.subscriptionPlan === 'premium' ? 'PREMIUM' : 'STANDARD',
          ...(establishment.status === 'rejected' && {
            status: 'pending',
            rejectionReason: null,
            rejectedAt: null,
            lastModifiedAt: new Date().toISOString()
          }),
          accessibilityDetails: formData.hybridAccessibilityDetails,
          detailedServices: formData.hybridDetailedServices,
          clienteleInfo: formData.hybridClienteleInfo,
          detailedPayments: formData.hybridDetailedPayments,
          childrenServices: formData.hybridChildrenServices,
          parkingInfo: formData.hybridParkingInfo
        };

        const csrfToken = await getCSRFToken();

        const response = await fetch(`/api/etablissements/${establishment.slug}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...updateData,
            csrfToken
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Erreur lors de la modification');
        }

        router.push('/dashboard?tab=overview');
        
      } else {
        // Mode création - utiliser l'API d'inscription
        const formDataToSend = new FormData();
        
        console.log('📤 Envoi des données du formulaire:', formData);
        Object.entries(formData).forEach(([key, value]) => {
          if (key === 'photos') {
            if (Array.isArray(value)) {
              (value as File[]).forEach((photo, index) => {
                formDataToSend.append(`photo_${index}`, photo);
              });
            }
          } else if (key === 'hours') {
            formDataToSend.append(key, JSON.stringify(value));
          } else if (key === 'address') {
            const addressData = value as any;
            const fullAddress = `${addressData.street}, ${addressData.postalCode} ${addressData.city}`;
            formDataToSend.append('address', fullAddress);
            
            if (addressData.latitude !== undefined) {
              formDataToSend.append('latitude', addressData.latitude.toString());
            }
            if (addressData.longitude !== undefined) {
              formDataToSend.append('longitude', addressData.longitude.toString());
            }
          } else if (key.startsWith('hybrid') && typeof value === 'object' && value !== null) {
            formDataToSend.append(key, JSON.stringify(value));
          } else if (Array.isArray(value)) {
            formDataToSend.append(key, JSON.stringify(value));
          } else if (value !== undefined && value !== null) {
            formDataToSend.append(key, value.toString());
          }
        });
        
        console.log('📤 FormData construit, envoi vers API...');
        const response = await fetch('/api/professional-registration', {
          method: 'POST',
          body: formDataToSend,
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Erreur lors de l\'inscription');
        }
        
        if (result.autoLogin && result.professional) {
          try {
            console.log('🔄 Tentative de connexion automatique...');
            const signInResult = await signIn('credentials', {
              email: result.professional.email,
              password: formData.accountPassword,
              redirect: false,
            });

            if (signInResult?.ok) {
              console.log('✅ Connexion automatique réussie');
              // Attendre que la session soit mise à jour
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // Vérifier que la session est bien établie
              const sessionCheck = await fetch('/api/auth/session');
              const sessionData = await sessionCheck.json();
              
              if (sessionData?.user?.id) {
                console.log('✅ Session confirmée, redirection vers dashboard');
                router.push('/dashboard');
              } else {
                console.log('⚠️ Session non confirmée, redirection forcée vers dashboard');
                // Forcer la redirection même si la session n'est pas encore propagée
                window.location.href = '/dashboard';
              }
            } else {
              console.error('❌ Échec de la connexion automatique:', signInResult?.error);
              // En cas d'échec, rediriger vers la page de connexion avec un message
              router.push('/auth?message=account-created&email=' + encodeURIComponent(result.professional.email));
            }
          } catch (error) {
            console.error('❌ Erreur connexion automatique:', error);
            // En cas d'erreur, rediriger vers la page de connexion avec un message
            router.push('/auth?message=account-created&email=' + encodeURIComponent(result.professional.email));
          }
        } else {
          console.log('⚠️ Pas de connexion automatique, redirection vers page de connexion');
          router.push('/auth?message=account-created&email=' + encodeURIComponent(result.professional.email));
        }
      }
      
    } catch (error) {
      console.error('Erreur:', error);
      alert(error instanceof Error ? error.message : `Erreur lors de ${isEditMode ? 'la modification' : 'l\'inscription'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction stable pour éviter les boucles infinies dans useEffect
  const handleEnrichmentDataChange = useCallback((data: EnrichmentData | null) => {
    console.log('🔄 Données d\'enrichissement mises à jour dans le parent:', data);
    setEnrichmentData(data || {
      name: '',
      establishmentType: '',
      priceLevel: 0,
      rating: 0,
      address: '',
      phone: '',
      website: '',
      description: '',
      openingHours: [],
      hours: {},
      practicalInfo: [],
      envieTags: [],
      specialties: [],
      atmosphere: [],
      googlePlaceId: '',
      googleBusinessUrl: '',
      googleRating: 0,
      googleReviewCount: 0,
      theForkLink: '',
      uberEatsLink: '',
      accessibilityInfo: [],
      servicesAvailableInfo: [],
      pointsForts: [],
      populairePour: [],
      offres: [],
      servicesRestauration: [],
      servicesInfo: [],
      ambianceInfo: [],
      clientele: [],
      planning: [],
      paiements: [],
      enfants: [],
      parking: []
    });
  }, []);

  return {
    // États
    currentStep,
    formData,
    errors,
    isSubmitting,
    envieGeneratedTags,
    phoneVerification,
    showPhoneModal,
    enrichmentData,
    siretVerification,
    
    // Actions
    setCurrentStep,
    handleInputChange,
    handleAddressValidation,
    sendVerificationCode,
    verifyCode,
    handlePhoneVerificationSuccess,
    handleClosePhoneModal,
    handleEnrichmentComplete,
    handleTagsChange,
    handleEnvieTagsGenerated,
    handleArrayToggle,
    validateStep,
    nextStep,
    prevStep,
    handleSubmit,
    handleEnrichmentDataChange,
    setShowPhoneModal
  };
}

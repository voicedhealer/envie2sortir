import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSupabaseSession } from "@/hooks/useSupabaseSession";
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
  const { user, loading: sessionLoading } = useSupabaseSession();
  
  // États principaux
  // En mode édition, démarrer sur l'étape 3 (Informations sur l'établissement)
  // car l'enrichissement a normalement déjà été fait
  // L'utilisateur peut toujours revenir en arrière avec "Précédent" pour refaire l'enrichissement
  const [currentStep, setCurrentStep] = useState<FormStep>(isEditMode ? 3 : 0);
  
  // ❌ Protection : Si on arrive sur l'étape 6 en mode édition, rediriger vers l'étape 7
  useEffect(() => {
    if (isEditMode && currentStep === 6) {
      console.log('⚠️ [useEstablishmentForm] Étape 6 détectée en mode édition, redirection vers étape 7');
      setCurrentStep(7);
    }
  }, [currentStep, isEditMode]);
  
  const [submitProgress, setSubmitProgress] = useState<string>('');
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
        
        // Données SIRET enrichies (nouvelles)
        siretAddress: "",
        siretActivity: "",
        siretCreationDate: "",
        siretEffectifs: "",
        
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
        paymentMethods: [],
        // Convertir les tags d'objets {tag, typeTag, poids} en tableau de strings
        tags: (establishment.tags && Array.isArray(establishment.tags)) 
          ? establishment.tags.map((t: any) => typeof t === 'string' ? t : t.tag).filter(Boolean)
          : [],
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
        subscriptionPlan: establishment.subscription === 'PREMIUM' || establishment.subscription === 'WAITLIST_BETA' ? 'premium' : 'free',
        subscriptionPlanType: "monthly", // Par défaut mensuel (on ne peut pas récupérer le type depuis l'établissement existant)
        termsAcceptedCGV: false,
        termsAcceptedCGU: false
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
      
      // Données SIRET enrichies (nouvelles)
      siretAddress: "",
      siretActivity: "",
      siretCreationDate: "",
      siretEffectifs: "",
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
      paymentMethods: ["Espèces|especes-autres"], // ✅ "Espèces" ajouté par défaut dans "Espèces et autres"
      tags: [],
      photos: [],
      hours: {},
      priceMin: undefined,
      priceMax: undefined,
      informationsPratiques: [],
      subscriptionPlan: "free",
      subscriptionPlanType: "monthly", // Par défaut mensuel
      termsAcceptedCGV: false,
      termsAcceptedCGU: false
    };
  });

  // ✅ Ajouter "Espèces" par défaut dans "Espèces et autres" à l'étape 4 si absent
  // ✅ CORRECTION : Ne pas déclencher si on a déjà des moyens de paiement depuis l'enrichissement
  useEffect(() => {
    if (!isEditMode && currentStep === 4) {
      // Vérifier si on a déjà des moyens de paiement
      const hasPaymentMethods = Array.isArray(formData.paymentMethods) && formData.paymentMethods.length > 0;
      
      // Vérifier si "Espèces" est déjà présent
      const hasEspeces = hasPaymentMethods && 
        formData.paymentMethods.some(pm => {
          const cleanPm = pm.replace(/^[⚠️✅❌🔴🟡🟢⭐🔥💡🎯📢🎁📊💬✨🦋]+\s*/, '').trim();
          const itemWithoutMarker = cleanPm.split('|')[0].trim().toLowerCase();
          return itemWithoutMarker === 'espèces' || itemWithoutMarker === 'especes' || itemWithoutMarker === 'cash';
        });
      
      // ✅ CORRECTION : Ne pas ajouter "Espèces" si on a déjà des moyens de paiement depuis l'enrichissement
      // L'enrichissement Google devrait déjà inclure "Espèces" si disponible
      if (!hasEspeces && !hasPaymentMethods) {
        setFormData(prev => ({
          ...prev,
          paymentMethods: [...(Array.isArray(prev.paymentMethods) ? prev.paymentMethods : []), "Espèces|especes-autres"]
        }));
        console.log('✅ [useEstablishmentForm] "Espèces" ajouté automatiquement dans "Espèces et autres" (aucun moyen de paiement existant)');
      } else if (hasPaymentMethods && !hasEspeces) {
        // Si on a des moyens de paiement mais pas "Espèces", on peut l'ajouter
        // mais seulement si l'utilisateur n'a pas encore interagi avec cette section
        console.log('ℹ️ [useEstablishmentForm] Moyens de paiement existants détectés, "Espèces" non ajouté automatiquement');
      }
    }
  }, [currentStep, isEditMode, formData.paymentMethods]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');
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

  // ✅ OPTIMISATION : Suppression de la vérification inutile des établissements existants
  // Cette vérification causait une 404 et ralentissait la validation
  // Le dashboard gère déjà la récupération des établissements


  // Charger les données existantes en mode édition
  useEffect(() => {
    if (isEditMode && establishment) {
      console.log('🔄 Chargement des données existantes en mode édition:', establishment);
      
      // Charger les données du professionnel (propriétaire)
      if (establishment.owner) {
        console.log('👤 Chargement des données du professionnel:', establishment.owner);
        const ownerSiret = establishment.owner?.siret || "";
        
        console.log('👤 [useEstablishmentForm] Chargement des données du propriétaire:', {
          firstName: establishment.owner?.firstName,
          lastName: establishment.owner?.lastName,
          email: establishment.owner?.email,
          phone: establishment.owner?.phone
        });
        
        setFormData(prev => ({
          ...prev,
          // ✅ Charger les données du propriétaire dans les champs account* pour l'affichage
          accountFirstName: establishment.owner?.firstName || "",
          accountLastName: establishment.owner?.lastName || "",
          accountEmail: establishment.owner?.email || "",
          accountPhone: establishment.owner?.phone || "",
          // Garder aussi les anciens champs pour compatibilité
          firstName: establishment.owner?.firstName || "",
          lastName: establishment.owner?.lastName || "",
          email: establishment.owner?.email || "",
          phone: establishment.owner?.phone || "",
          companyName: establishment.owner?.companyName || "",
          siret: ownerSiret,
          legalStatus: establishment.owner?.legalStatus || ""
        }));
        
        // ✅ Récupérer les données SIRET enrichies depuis l'API INSEE si le SIRET est disponible
        if (ownerSiret && ownerSiret.trim().length === 14) {
          console.log('🔍 [useEstablishmentForm] Récupération des données INSEE pour le SIRET:', ownerSiret);
          fetch('/api/siret/verify', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ siret: ownerSiret })
          })
            .then(res => res.json())
            .then(data => {
              if (data.isValid && data.data) {
                console.log('✅ [useEstablishmentForm] Données INSEE récupérées:', data.data);
                setFormData(prev => ({
                  ...prev,
                  siretAddress: data.data.address || establishment.address || "",
                  siretActivity: data.data.activityLabel || "",
                  siretCreationDate: data.data.creationDate || "",
                  siretEffectifs: data.data.effectifTranche || ""
                }));
              } else {
                console.log('⚠️ [useEstablishmentForm] Données INSEE non disponibles, utilisation des valeurs par défaut');
                // Utiliser l'adresse de l'établissement comme fallback
                setFormData(prev => ({
                  ...prev,
                  siretAddress: establishment.address || "",
                  siretActivity: "",
                  siretCreationDate: "",
                  siretEffectifs: ""
                }));
              }
            })
            .catch(error => {
              console.error('❌ [useEstablishmentForm] Erreur récupération données INSEE:', error);
              // En cas d'erreur, utiliser l'adresse de l'établissement comme fallback
              setFormData(prev => ({
                ...prev,
                siretAddress: establishment.address || "",
                siretActivity: "",
                siretCreationDate: "",
                siretEffectifs: ""
              }));
            });
        } else {
          // Si pas de SIRET, utiliser l'adresse de l'établissement comme fallback
          console.log('⚠️ [useEstablishmentForm] Pas de SIRET valide, utilisation de l\'adresse de l\'établissement');
          setFormData(prev => ({
            ...prev,
            siretAddress: establishment.address || "",
            siretActivity: "",
            siretCreationDate: "",
            siretEffectifs: ""
          }));
        }
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
        // ✅ CORRECTION : Garder les paymentMethods en format tableau (pas objet)
        // Convertir depuis la base de données (peut être string JSON, tableau, ou objet)
        paymentMethods: (() => {
          const paymentMethodsData = (establishment as any).paymentMethods;
          console.log('🔍 [useEstablishmentForm] paymentMethodsData brut:', paymentMethodsData);
          
          if (!paymentMethodsData) {
            console.log('⚠️ [useEstablishmentForm] Aucun paymentMethodsData');
            return [];
          }
          
          // Si c'est une string, parser
          const parsed = typeof paymentMethodsData === 'string' 
            ? JSON.parse(paymentMethodsData) 
            : paymentMethodsData;
          
          console.log('🔍 [useEstablishmentForm] paymentMethodsData parsé:', parsed, 'Type:', typeof parsed, 'IsArray:', Array.isArray(parsed));
          
          // Si c'est déjà un tableau, le retourner
          if (Array.isArray(parsed)) {
            console.log('✅ [useEstablishmentForm] paymentMethods est un tableau:', parsed);
            return parsed;
          }
          
          // Si c'est un objet, le convertir en tableau
          if (typeof parsed === 'object' && parsed !== null) {
            const converted = convertPaymentMethodsObjectToArray(parsed);
            console.log('✅ [useEstablishmentForm] paymentMethods converti depuis objet:', converted);
            return converted;
          }
          
          console.log('⚠️ [useEstablishmentForm] Format de paymentMethods non reconnu');
          return [];
        })(),
        horairesOuverture: establishment.horairesOuverture ? (typeof establishment.horairesOuverture === 'string' ? JSON.parse(establishment.horairesOuverture) : establishment.horairesOuverture) : {},
        prixMoyen: establishment.prixMoyen || "",
        capaciteMax: establishment.capaciteMax || "",
        accessibilite: establishment.accessibilite ? (typeof establishment.accessibilite === 'string' ? JSON.parse(establishment.accessibilite) : establishment.accessibilite) : {},
        parking: establishment.parking || false,
        terrasse: establishment.terrasse || false,
        priceMin: typeof establishment.priceMin === 'number' ? establishment.priceMin : undefined,
        priceMax: typeof establishment.priceMax === 'number' ? establishment.priceMax : undefined
      };
      
      console.log('📋 [useEstablishmentForm] Données de contact chargées:', JSON.stringify({
        phone: newFormData.phone,
        email: newFormData.email,
        website: newFormData.website,
        instagram: newFormData.instagram,
        facebook: newFormData.facebook,
        whatsappPhone: newFormData.whatsappPhone,
        messengerUrl: newFormData.messengerUrl
      }, null, 2));
      
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
          console.log('🔍 [useEstablishmentForm] services chargés:', services, 'Type:', typeof services, 'IsArray:', Array.isArray(services));
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
          console.log('🔍 [useEstablishmentForm] ambiance chargée:', ambiance, 'Type:', typeof ambiance, 'IsArray:', Array.isArray(ambiance));
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
          console.log('🔍 [useEstablishmentForm] informationsPratiques chargées:', informationsPratiques, 'Type:', typeof informationsPratiques, 'IsArray:', Array.isArray(informationsPratiques));
          setFormData(prev => ({ ...prev, informationsPratiques: Array.isArray(informationsPratiques) ? informationsPratiques : [] }));
        } catch (error) {
          console.error('Erreur parsing informationsPratiques:', error);
        }
      }
      
      // Charger les tags existants depuis establishment.tags (tableau d'objets {tag, typeTag, poids})
      let loadedTags: string[] = [];
      console.log("🔍 [useEstablishmentForm] establishment.tags reçu:", establishment.tags);
      if (establishment.tags && Array.isArray(establishment.tags) && establishment.tags.length > 0) {
        // Convertir les objets en strings (gérer les deux formats : objet ou string)
        const existingTags = establishment.tags
          .map((t: any) => {
            if (typeof t === 'string') return t;
            if (t && typeof t === 'object' && t.tag) return t.tag;
            return null;
          })
          .filter(Boolean) as string[];
        console.log("🏷️ Tags existants chargés (après conversion):", existingTags);
        loadedTags = [...existingTags];
      } else {
        console.log("⚠️ [useEstablishmentForm] establishment.tags n'est pas un tableau ou est vide:", establishment.tags);
      }
      
      // Charger et fusionner les envie tags existants avec les tags normaux
      console.log("🔍 [useEstablishmentForm] Vérification envieTags:", {
        hasEnvieTags: !!(establishment as any).envieTags,
        envieTagsType: typeof (establishment as any).envieTags,
        envieTagsValue: (establishment as any).envieTags,
        isArray: Array.isArray((establishment as any).envieTags),
        isNull: (establishment as any).envieTags === null,
        isUndefined: (establishment as any).envieTags === undefined
      });
      console.log("🔍 [useEstablishmentForm] establishment complet (pour debug):", {
        id: establishment?.id,
        name: establishment?.name,
        tags: establishment?.tags,
        envieTags: (establishment as any)?.envieTags,
        allKeys: Object.keys(establishment || {})
      });
      
      if ((establishment as any).envieTags && Array.isArray((establishment as any).envieTags)) {
        const envieTags = (establishment as any).envieTags;
        console.log("💭 Envie tags existants chargés:", envieTags);
        
        // Normaliser la casse pour éviter les doublons (garder la casse originale du premier tag trouvé)
        const normalizedTagsMap = new Map<string, string>();
        
        // Ajouter les tags normaux avec normalisation
        loadedTags.forEach(tag => {
          const normalized = tag.toLowerCase();
          if (!normalizedTagsMap.has(normalized)) {
            normalizedTagsMap.set(normalized, tag); // Garder la casse originale
          }
        });
        
        // Ajouter les envieTags avec normalisation
        envieTags.forEach((tag: string) => {
          const normalized = tag.toLowerCase();
          if (!normalizedTagsMap.has(normalized)) {
            normalizedTagsMap.set(normalized, tag); // Garder la casse originale
          }
        });
        
        const allTags = Array.from(normalizedTagsMap.values());
        console.log("✅ Tags fusionnés (normaux + envie, sans doublons):", allTags);
        setFormData(prev => ({ 
          ...prev, 
          tags: allTags,
          envieTags: envieTags 
        }));
        // Mettre à jour envieGeneratedTags pour la cohérence
        setEnvieGeneratedTags(envieTags);
      } else if ((establishment as any).envieTags) {
        // Si envieTags existe mais n'est pas un tableau, essayer de le convertir
        console.log("⚠️ [useEstablishmentForm] envieTags existe mais n'est pas un tableau, tentative de conversion");
        try {
          const envieTags = Array.isArray((establishment as any).envieTags) 
            ? (establishment as any).envieTags 
            : typeof (establishment as any).envieTags === 'string'
            ? JSON.parse((establishment as any).envieTags)
            : [];
          if (Array.isArray(envieTags) && envieTags.length > 0) {
            // Normaliser la casse pour éviter les doublons
            const normalizedTagsMap = new Map<string, string>();
            
            loadedTags.forEach(tag => {
              const normalized = tag.toLowerCase();
              if (!normalizedTagsMap.has(normalized)) {
                normalizedTagsMap.set(normalized, tag);
              }
            });
            
            envieTags.forEach((tag: string) => {
              const normalized = tag.toLowerCase();
              if (!normalizedTagsMap.has(normalized)) {
                normalizedTagsMap.set(normalized, tag);
              }
            });
            
            const allTags = Array.from(normalizedTagsMap.values());
            console.log("✅ Tags fusionnés (après conversion envieTags, sans doublons):", allTags);
            setFormData(prev => ({ 
              ...prev, 
              tags: allTags,
              envieTags: envieTags 
            }));
            setEnvieGeneratedTags(envieTags);
          } else {
            console.log("✅ Tags normaux seulement (envieTags vide ou invalide):", loadedTags);
            setFormData(prev => ({ ...prev, tags: loadedTags }));
          }
        } catch (error) {
          console.error("❌ [useEstablishmentForm] Erreur conversion envieTags:", error);
          setFormData(prev => ({ ...prev, tags: loadedTags }));
        }
      } else {
        // Si pas d'envieTags, juste mettre les tags normaux
        console.log("✅ Tags normaux seulement (pas d'envieTags):", loadedTags);
        setFormData(prev => ({ ...prev, tags: loadedTags }));
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
    
    // ✅ CORRECTION : Gérer spécifiquement termsAcceptedCGV et termsAcceptedCGU pour garantir un boolean
    if (field === 'termsAcceptedCGV' || field === 'termsAcceptedCGU') {
      const booleanValue = Boolean(value);
      console.log(`🔘 [handleInputChange] ${field}:`, value, '->', booleanValue);
      setFormData(prev => ({ ...prev, [field]: booleanValue }));
      // Effacer l'erreur si la checkbox est cochée
      if (booleanValue && errors[field]) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
      return;
    }
    
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Si le plan premium est sélectionné et subscriptionPlanType n'est pas défini, initialiser à 'monthly'
      if (field === 'subscriptionPlan' && value === 'premium' && !newData.subscriptionPlanType) {
        newData.subscriptionPlanType = 'monthly';
      }
      
      // Si le plan change pour 'free', on peut réinitialiser subscriptionPlanType
      if (field === 'subscriptionPlan' && value === 'free') {
        newData.subscriptionPlanType = undefined;
      }
      
      return newData;
    });
    
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
      let cleanPhone = value.replace(/\s/g, '').replace(/[^\d+]/g, '');
      
      // Normaliser les numéros de test Twilio (corriger 015005550006 -> 01500555006)
      if (/^01500555\d{4}$/.test(cleanPhone)) {
        cleanPhone = cleanPhone.substring(0, 11);
        console.log('🔧 Normalisation du numéro de test:', value, '->', cleanPhone);
      } else if (/^\+1500555\d{4}$/.test(cleanPhone)) {
        cleanPhone = cleanPhone.substring(0, 12);
        console.log('🔧 Normalisation du numéro de test:', value, '->', cleanPhone);
      } else if (/^1500555\d{4}$/.test(cleanPhone)) {
        cleanPhone = cleanPhone.substring(0, 11);
        console.log('🔧 Normalisation du numéro de test:', value, '->', cleanPhone);
      }
      
      // Utiliser le numéro normalisé
      setFormData(prev => ({ ...prev, [field]: cleanPhone }));
      
      // Utiliser la fonction importée qui accepte aussi les numéros de test
      const isValidPhone = isValidFrenchPhone(cleanPhone);
      
      // Si le numéro change et qu'il était vérifié, reset l'état
      if (phoneVerification.isVerified && cleanPhone !== formData.accountPhone) {
        setPhoneVerification(prev => ({
          ...prev,
          isVerified: false,
          error: ''
        }));
      }
      
      // Si le numéro n'est plus valide ou est vide, reset l'état de vérification
      if (phoneVerification.isVerified && (!isValidPhone || !cleanPhone.trim())) {
        setPhoneVerification(prev => ({
          ...prev,
          isVerified: false,
          error: ''
        }));
      }
      
      // Ne pas continuer avec le reste du traitement pour ce champ
      return;
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
    // Utiliser la fonction importée qui accepte aussi les numéros de test Twilio
    if (!isValidFrenchPhone(formData.accountPhone)) {
      setPhoneVerification(prev => ({ 
        ...prev, 
        error: 'Format de téléphone mobile français invalide (doit commencer par 06 ou 07, ou utiliser un numéro de test Twilio)'
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
        // Si le backend a auto-validé (numéro de test), marquer directement comme vérifié
        if (data.autoVerified) {
          console.log('🧪 [Hook] Numéro de test auto-validé. Aucun code à saisir.');
          setPhoneVerification(prev => ({
            ...prev,
            isSending: false,
            isVerified: true,
            error: ''
          }));
          setShowPhoneModal(false);
        } else {
          // Sinon, ouvrir le modal pour saisir le code
          setPhoneVerification(prev => ({ 
            ...prev, 
            isSending: false,
            error: ''
          }));
          console.log('📱 Code de vérification envoyé automatiquement:', data.debugCode || data.devCode);
          setShowPhoneModal(true);
        }
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
    console.log(`✅ [Hook] handlePhoneVerificationSuccess appelé pour le numéro: ${formData.accountPhone}`);
    setPhoneVerification(prev => ({ 
      ...prev, 
      isVerified: true,
      error: ''
    }));
    setShowPhoneModal(false);
    console.log(`✅ [Hook] État phoneVerification.isVerified mis à jour à: true`);
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
      // ✅ CORRECTION : Conserver les moyens de paiement sous forme de tableau avec marqueurs
      // au lieu de les convertir en objet, pour préserver tous les items
      paymentMethods: enrichmentData.paymentMethodsArray && enrichmentData.paymentMethodsArray.length > 0
        ? enrichmentData.paymentMethodsArray.map((method: string) => {
            // Ajouter les marqueurs de rubrique si absents
            if (!method.includes('|')) {
              const methodLower = method.toLowerCase();
              if (methodLower.includes('carte') && (methodLower.includes('crédit') || methodLower.includes('credit'))) {
                return `${method}|cartes-bancaires`;
              }
              if (methodLower.includes('carte') && methodLower.includes('débit')) {
                return `${method}|cartes-bancaires`;
              }
              if (methodLower.includes('nfc') || methodLower.includes('mobile')) {
                return `${method}|paiements-mobiles`;
              }
              if (methodLower.includes('espèces') || methodLower.includes('cash')) {
                return `${method}|especes-autres`;
              }
              if (methodLower.includes('titre') || methodLower.includes('restaurant')) {
                return `${method}|especes-autres`;
              }
              if (methodLower.includes('pluxee')) {
                return `${method}|especes-autres`;
              }
              // Par défaut, mettre dans espèces et autres
              return `${method}|especes-autres`;
            }
            return method;
          })
        : prev.paymentMethods,
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
    // Séparer les tags normaux des envieTags
    const normalTags = tags.filter(tag => 
      typeof tag === 'string' && !tag.toLowerCase().startsWith('envie de')
    );
    const envieTagsFromTags = tags.filter(tag => 
      typeof tag === 'string' && tag.toLowerCase().startsWith('envie de')
    );
    
    // Mettre à jour envieGeneratedTags si des envieTags sont présents
    if (envieTagsFromTags.length > 0) {
      setEnvieGeneratedTags(envieTagsFromTags);
    }
    
    // Combiner les tags normaux avec les envieTags existants
    const allTags = [...new Set([...normalTags, ...envieGeneratedTags, ...envieTagsFromTags])];
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
        
        // Validation de la forme juridique - ne peut pas être "inconnue"
        if (!formData.legalStatus || formData.legalStatus.trim() === '') {
          newErrors.legalStatus = "Forme juridique requise";
        } else if (formData.legalStatus.toLowerCase().includes('inconnue') || 
                   formData.legalStatus.toLowerCase().includes('inconnu')) {
          newErrors.legalStatus = "Veuillez renseigner la forme juridique de votre entreprise (SARL, SAS, Auto-entrepreneur, etc.)";
        }
        
        // Validation des autres champs SIRET enrichis
        if (!formData.companyName || formData.companyName.trim() === '') {
          newErrors.companyName = "Raison sociale requise";
        }
        if (!formData.siretAddress || formData.siretAddress.trim() === '') {
          newErrors.siretAddress = "Adresse de l'entreprise requise";
        }
        if (!formData.siretActivity || formData.siretActivity.trim() === '') {
          newErrors.siretActivity = "Activité de l'entreprise requise";
        }
        if (!formData.siretCreationDate || formData.siretCreationDate.trim() === '') {
          newErrors.siretCreationDate = "Date de création requise";
        }
        break;
      
      case 2:
        // Étape d'enrichissement - pas de validation spécifique
        break;
      
      case 3:
        // Validation des activités proposées - champ obligatoire
        if (!formData.activities || formData.activities.length === 0) {
          newErrors.activities = "Veuillez sélectionner au moins une activité";
        }
        if (!formData.establishmentName) newErrors.establishmentName = "Nom requis";
        // ✅ CORRECTION : Validation flexible - soit adresse complète, soit coordonnées GPS
        const hasFullAddress = !!(
          formData.address.street?.trim() && 
          formData.address.postalCode?.trim() && 
          formData.address.city?.trim()
        );
        
        const hasCoordinates = !!(
          formData.address.latitude && 
          formData.address.longitude
        );
        
        if (!hasFullAddress && !hasCoordinates) {
          newErrors.address = "Adresse complète requise (rue, code postal et ville) OU coordonnées GPS";
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
        // ❌ En mode édition, l'étape 6 (abonnement) est toujours validée (elle est sautée)
        if (isEditMode) {
          return true;
        }
        if (!formData.subscriptionPlan) {
          newErrors.subscriptionPlan = "Veuillez sélectionner un plan";
        } else if (formData.subscriptionPlan === 'premium' && !formData.subscriptionPlanType) {
          newErrors.subscriptionPlanType = "Veuillez choisir entre paiement mensuel ou annuel";
        }
        // ✅ Validation de l'acceptation des CGV (Conditions Générales de Vente) pour l'abonnement
        if (!formData.termsAcceptedCGV) {
          newErrors.termsAcceptedCGV = "Vous devez accepter les Conditions Générales de Vente (CGV) pour continuer";
        }
        break;
      
      case 7:
        break;
      
      case 8:
        // ✅ Validation de l'acceptation des CGU (Conditions Générales d'Utilisation) de la plateforme
        if (!isEditMode && !formData.termsAcceptedCGU) {
          newErrors.termsAcceptedCGU = "Vous devez accepter les Conditions Générales d'Utilisation (CGU) pour finaliser votre inscription";
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => {
        let next = prev + 1;
        // ❌ En mode édition, sauter l'étape 6 (abonnement)
        if (isEditMode && next === 6) {
          next = 7; // Passer directement à l'étape 7 (Résumé)
        }
        return Math.min(8, next) as FormStep;
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => {
      let previous = prev - 1;
      // ❌ En mode édition, sauter l'étape 6 (abonnement) en revenant en arrière
      if (isEditMode && previous === 6) {
        previous = 5; // Revenir directement à l'étape 5 (Tags)
      }
      return Math.max(0, previous) as FormStep;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    console.log('🚀 handleSubmit appelé, étape courante:', currentStep);
    
    // Protection contre les clics multiples
    if (isSubmitting) {
      console.log('⚠️ Soumission déjà en cours, requête ignorée');
      return;
    }
    
    if (!validateStep(currentStep)) {
      console.log('❌ Validation échouée pour l\'étape:', currentStep);
      return;
    }
    
    console.log('✅ Validation réussie, début de la soumission...');
    setIsSubmitting(true);
    setSubmitError(''); // Réinitialiser l'erreur
    setSubmitProgress('Préparation des données...');
    
    // Timeout global de 30 secondes pour éviter les blocages
    const timeoutId = setTimeout(() => {
      console.error('⏰ Timeout de soumission atteint (30s)');
      setSubmitError('La soumission prend plus de temps que prévu. Veuillez réessayer.');
      setIsSubmitting(false);
    }, 30000);
    
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
          informationsPratiques: formData.informationsPratiques,
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
          // ⚠️ IMPORTANT : Ne pas modifier subscription en mode édition
          // Le champ subscription (WAITLIST_BETA, PREMIUM, FREE) ne peut être modifié que par un admin
          // En mode édition, on ne l'envoie pas pour préserver la valeur actuelle
          // subscription: formData.subscriptionPlan === 'premium' ? 'PREMIUM' : 'FREE',
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
          parkingInfo: formData.hybridParkingInfo,
          // ✅ AJOUT : Inclure les tags et envieTags
          tags: formData.tags || [],
          envieTags: envieGeneratedTags || []
        };

        console.log('📤 [handleSubmit] Données envoyées pour modification:', {
          services: updateData.services,
          ambiance: updateData.ambiance,
          paymentMethods: updateData.paymentMethods,
          informationsPratiques: updateData.informationsPratiques,
          servicesCount: Array.isArray(updateData.services) ? updateData.services.length : 0,
          ambianceCount: Array.isArray(updateData.ambiance) ? updateData.ambiance.length : 0,
          paymentMethodsCount: Array.isArray(updateData.paymentMethods) ? updateData.paymentMethods.length : 0,
          informationsPratiquesCount: Array.isArray(updateData.informationsPratiques) ? updateData.informationsPratiques.length : 0,
          tags: updateData.tags,
          envieTags: updateData.envieTags,
          tagsCount: updateData.tags?.length || 0,
          envieTagsCount: updateData.envieTags?.length || 0
        });

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
        console.log('🔍 DEBUG paymentMethods dans formData:', formData.paymentMethods);
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
              console.log('📍 Latitude:', addressData.latitude, 'Type:', typeof addressData.latitude);
              formDataToSend.append('latitude', addressData.latitude.toString());
            }
            if (addressData.longitude !== undefined) {
              console.log('📍 Longitude:', addressData.longitude, 'Type:', typeof addressData.longitude);
              formDataToSend.append('longitude', addressData.longitude.toString());
            }
          } else if (key.startsWith('hybrid') && typeof value === 'object' && value !== null) {
            formDataToSend.append(key, JSON.stringify(value));
          } else if (Array.isArray(value)) {
            formDataToSend.append(key, JSON.stringify(value));
          } else if (key === 'termsAcceptedCGV' || key === 'termsAcceptedCGU') {
            // ✅ CORRECTION : Convertir explicitement les booléens en string "true" ou "false"
            formDataToSend.append(key, value === true ? 'true' : 'false');
            console.log(`🔘 [handleSubmit] ${key}:`, value, '->', value === true ? 'true' : 'false');
          } else if (value !== undefined && value !== null) {
            formDataToSend.append(key, value.toString());
          }
        });
        
        // Ajouter le flag de vérification SMS si le téléphone a été vérifié
        console.log(`🔍 [Hook] État phoneVerification.isVerified avant soumission: ${phoneVerification.isVerified}`);
        console.log(`🔍 [Hook] Numéro de téléphone dans formData: ${formData.accountPhone}`);
        
        if (phoneVerification.isVerified) {
          formDataToSend.append('smsVerified', 'true');
          console.log('✅ Vérification SMS confirmée dans FormData');
        } else {
          console.error('❌ Le téléphone n\'a pas été vérifié');
          console.error('❌ État phoneVerification:', phoneVerification);
          setSubmitError('Vérification du numéro de téléphone requise. Veuillez vérifier votre numéro de téléphone via SMS avant de continuer.');
          setIsSubmitting(false);
          clearTimeout(timeoutId);
          return;
        }
        
        console.log('📤 FormData construit, envoi vers API...');
        setSubmitProgress('Envoi des données au serveur...');
        console.log('📤 Données FormData:');
        for (const [key, value] of formDataToSend.entries()) {
          console.log(`  ${key}:`, value);
        }
        
        const response = await fetch('/api/professional-registration', {
          method: 'POST',
          body: formDataToSend,
        });
        
        setSubmitProgress('Traitement des données...');
        const result = await response.json();
        
        // ✅ DEBUG : Logs détaillés pour Stripe
        console.log('📋 [handleSubmit] Réponse API reçue:', {
          success: result.success,
          hasCheckoutUrl: !!result.checkoutUrl,
          checkoutUrl: result.checkoutUrl,
          subscriptionPlan: formData.subscriptionPlan,
          hasAutoLogin: !!result.autoLogin,
          hasProfessional: !!result.professional
        });
        
        if (!response.ok) {
          // Afficher les détails de l'erreur en mode développement
          console.error('❌ Erreur API:', result);
          if (result.details) {
            console.error('❌ Détails:', result.details);
          }
          if (result.suggestion) {
            console.warn('💡 Suggestion:', result.suggestion);
          }
          if (result.stack) {
            console.error('❌ Stack:', result.stack);
          }
          
          // Construire le message d'erreur avec la suggestion si disponible
          let errorMessage = result.error || result.details || 'Erreur lors de l\'inscription';
          if (result.suggestion) {
            errorMessage += `\n\n💡 ${result.suggestion}`;
          }
          
          throw new Error(errorMessage);
        }
        
        // ✅ VÉRIFICATION : Si premium est sélectionné mais pas de checkoutUrl, afficher un avertissement
        if (formData.subscriptionPlan === 'premium' && !result.checkoutUrl) {
          console.warn('⚠️ [handleSubmit] Plan Premium sélectionné mais pas de checkoutUrl dans la réponse');
          console.warn('⚠️ [handleSubmit] Cela peut indiquer que Stripe n\'est pas configuré ou qu\'il y a eu une erreur');
        }
        
        // ✅ CORRECTION : Authentifier l'utilisateur AVANT de rediriger vers Stripe
        // Cela garantit qu'il sera connecté après le paiement
        if (result.autoLogin && result.professional) {
          try {
            console.log('🔄 Tentative de connexion automatique avec Supabase Auth...');
            setSubmitProgress('Connexion automatique...');
            
            // Utiliser l'API Supabase Auth au lieu de NextAuth
            const loginResponse = await fetch('/api/auth/login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: result.professional.email,
                password: formData.accountPassword
              }),
            });

            const loginResult = await loginResponse.json();

            if (loginResponse.ok && loginResult.success) {
              console.log('✅ Connexion automatique réussie');
              
              // Si une URL de checkout Stripe est fournie, rediriger vers Stripe APRÈS authentification
              if (result.checkoutUrl) {
                console.log('💳 [handleSubmit] Redirection vers Stripe Checkout (utilisateur authentifié)...');
                console.log('💳 [handleSubmit] URL Stripe:', result.checkoutUrl);
                // ✅ CORRECTION : Stocker l'email et le mot de passe pour reconnexion après Stripe
                // (en cas de perte de session lors de la redirection externe)
                localStorage.setItem('pending_stripe_email', result.professional.email);
                sessionStorage.setItem('pending_stripe_password', formData.accountPassword);
                // Utiliser window.location.href pour forcer la redirection
                window.location.href = result.checkoutUrl;
                return;
              } else {
                console.warn('⚠️ [handleSubmit] Pas de checkoutUrl alors que premium est sélectionné');
              }
              
              // Sinon, rediriger vers le dashboard
              console.log('✅ Redirection vers dashboard');
              window.location.href = '/dashboard';
            } else {
              console.error('❌ Échec de la connexion automatique:', loginResult);
              // En cas d'échec, rediriger vers la page de connexion avec un message
              router.push('/auth?message=account-created&email=' + encodeURIComponent(result.professional.email));
            }
          } catch (error) {
            console.error('❌ Erreur connexion automatique:', error);
            // En cas d'erreur, rediriger vers la page de connexion avec un message
            router.push('/auth?message=account-created&email=' + encodeURIComponent(result.professional.email));
          }
        } else {
          // Si pas d'autoLogin mais qu'il y a un checkoutUrl, rediriger quand même vers Stripe
          // (cas où l'authentification a déjà été faite ailleurs)
          if (result.checkoutUrl) {
            console.log('💳 [handleSubmit] Redirection vers Stripe Checkout (sans autoLogin)...');
            console.log('💳 [handleSubmit] URL Stripe:', result.checkoutUrl);
            window.location.href = result.checkoutUrl;
            return;
          } else {
            console.warn('⚠️ [handleSubmit] Pas de checkoutUrl et pas d\'autoLogin');
          }
          
          console.log('⚠️ Pas de connexion automatique, redirection vers page de connexion');
          router.push('/auth?message=account-created&email=' + encodeURIComponent(result.professional.email));
        }
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de la soumission:', error);
      const errorMessage = error instanceof Error ? error.message : `Erreur lors de ${isEditMode ? 'la modification' : 'l\'inscription'}`;
      setSubmitError(errorMessage);
      // Scroller vers le haut pour voir l'erreur
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      clearTimeout(timeoutId); // Nettoyer le timeout
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
    submitError,
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
    setShowPhoneModal,
    submitProgress
  };
}

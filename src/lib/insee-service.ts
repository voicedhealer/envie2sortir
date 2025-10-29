import { SiretVerificationResult } from '@/types/siret.types';
import formesJuridiques from '@/lib/nomenclatures/formes-juridiques.json';
import codesNAF from '@/lib/nomenclatures/codes-naf.json';

// Types pour l'API Recherche d'Entreprises (gratuite)
interface RechercheEntreprisesResponse {
  results: Array<{
    nom_complet: string;
    siren: string;
    siret: string;
    siege: {
      adresse: string;
      code_postal: string;
      commune: string;
    };
    activite_principale: string;
    nature_juridique: string;
    date_creation: string;
    tranche_effectif_salarie: string;
    etat_administratif: string;
  }>;
}

class RechercheEntreprisesService {
  private baseUrl = 'https://recherche-entreprises.api.gouv.fr';

  constructor() {
    // Plus besoin de configuration, l'API est gratuite !
  }

  /**
   * Valide le format d'un numéro SIRET
   */
  private validateSiretFormat(siret: string): boolean {
    // Supprimer les espaces et vérifier que c'est un nombre de 14 chiffres
    const cleanSiret = siret.replace(/\s/g, '');
    if (!/^\d{14}$/.test(cleanSiret)) {
      return false;
    }

    // Vérification de la clé de contrôle (algorithme de Luhn)
    let sum = 0;
    let isEven = false;
    
    for (let i = cleanSiret.length - 1; i >= 0; i--) {
      let digit = parseInt(cleanSiret[i]);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  /**
   * Vérifie un numéro SIRET et récupère les informations de l'entreprise
   */
  async verifySiret(siret: string): Promise<SiretVerificationResult> {
    try {
      // Validation du format
      if (!this.validateSiretFormat(siret)) {
        return {
          isValid: false,
          error: 'Le numéro SIRET doit contenir exactement 14 chiffres et être valide'
        };
      }

      // Appel à l'API Recherche d'Entreprises (gratuite, sans authentification)
      const response = await fetch(`${this.baseUrl}/search?q=${siret}`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur API Recherche d'Entreprises: ${response.status}`);
      }

      const data: RechercheEntreprisesResponse = await response.json();
      
      // Vérifier si des résultats ont été trouvés
      if (!data.results || data.results.length === 0) {
        return {
          isValid: false,
          error: 'Aucun établissement trouvé avec ce numéro SIRET'
        };
      }

      const etablissement = data.results[0];
      
      // Construire l'adresse complète
      const adresseParts = [];
      if (etablissement.siege?.adresse) adresseParts.push(etablissement.siege.adresse);
      if (etablissement.siege?.code_postal) adresseParts.push(etablissement.siege.code_postal);
      if (etablissement.siege?.commune) adresseParts.push(etablissement.siege.commune);
      const adresseComplete = adresseParts.join(' ');
      
      // Enrichir avec les nomenclatures officielles
      const legalStatusCode = etablissement.nature_juridique || '';
      const legalStatusLabel = formesJuridiques[legalStatusCode] || '';
      
      const activityCode = etablissement.activite_principale || '';
      const activityLabel = codesNAF[activityCode] || '';
      
      // Extraire les informations enrichies
      const result: SiretVerificationResult = {
        isValid: true,
        data: {
          siret: etablissement.siret,
          siren: etablissement.siren,
          companyName: etablissement.nom_complet,
          legalStatus: legalStatusCode,
          legalStatusLabel: legalStatusLabel,
          address: adresseComplete,
          activityCode: activityCode,
          activityLabel: activityLabel,
          creationDate: etablissement.date_creation || '',
          effectifTranche: etablissement.tranche_effectif_salarie || '',
          etatAdministratif: etablissement.etat_administratif || ''
        }
      };

      return result;

    } catch (error) {
      console.error('Erreur lors de la vérification SIRET:', error);
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue lors de la vérification'
      };
    }
  }
}

// Instance singleton du service
let rechercheEntreprisesService: RechercheEntreprisesService | null = null;

export function getRechercheEntreprisesService(): RechercheEntreprisesService {
  if (!rechercheEntreprisesService) {
    rechercheEntreprisesService = new RechercheEntreprisesService();
  }
  
  return rechercheEntreprisesService;
}

// Alias pour la compatibilité avec l'ancien code
export const getINSEEService = getRechercheEntreprisesService;

export default RechercheEntreprisesService;
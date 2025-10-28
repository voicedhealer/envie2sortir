import { INSEEResponse, SiretVerificationResult, INSEEConfig } from '@/types/siret.types';

class INSEEService {
  private config: INSEEConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor(config: INSEEConfig) {
    this.config = config;
  }

  /**
   * Obtient un token d'accès OAuth2 pour l'API INSEE
   */
  private async getAccessToken(): Promise<string> {
    // Vérifier si le token est encore valide
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await fetch('https://api.insee.fr/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.config.consumerKey}:${this.config.consumerSecret}`)}`
        },
        body: 'grant_type=client_credentials'
      });

      if (!response.ok) {
        throw new Error(`Erreur d'authentification INSEE: ${response.status}`);
      }

      const tokenData = await response.json();
      this.accessToken = tokenData.access_token;
      // Le token expire généralement en 1 heure, on le renouvelle 5 minutes avant
      this.tokenExpiry = Date.now() + (tokenData.expires_in - 300) * 1000;

      return this.accessToken;
    } catch (error) {
      console.error('Erreur lors de l\'obtention du token INSEE:', error);
      throw new Error('Impossible d\'obtenir l\'accès à l\'API INSEE');
    }
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
   * Formate une adresse à partir des données INSEE
   */
  private formatAddress(etablissement: any): string {
    const parts = [];
    
    if (etablissement.numeroVoieEtablissement) {
      parts.push(etablissement.numeroVoieEtablissement);
    }
    
    if (etablissement.typeVoieEtablissement) {
      parts.push(etablissement.typeVoieEtablissement);
    }
    
    if (etablissement.libelleVoieEtablissement) {
      parts.push(etablissement.libelleVoieEtablissement);
    }
    
    if (etablissement.codePostalEtablissement) {
      parts.push(etablissement.codePostalEtablissement);
    }
    
    if (etablissement.libelleCommuneEtablissement) {
      parts.push(etablissement.libelleCommuneEtablissement);
    }
    
    return parts.join(' ');
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

      // Obtenir le token d'accès OAuth2
      const token = await this.getAccessToken();

      // Appel à l'API INSEE avec le token
      const response = await fetch(`https://api.insee.fr/entreprises/sirene/V3/siret/${siret}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.status === 404) {
        return {
          isValid: false,
          error: 'Aucun établissement trouvé avec ce numéro SIRET'
        };
      }

      if (!response.ok) {
        throw new Error(`Erreur API INSEE: ${response.status}`);
      }

      const data: INSEEResponse = await response.json();
      
      // Extraire les informations pertinentes
      const result: SiretVerificationResult = {
        isValid: true,
        data: {
          siret: data.etablissement.siret,
          siren: data.etablissement.siren,
          companyName: data.uniteLegale.denominationUniteLegale || 
                      data.uniteLegale.denominationUsuelle1UniteLegale || 
                      'Nom non disponible',
          legalStatus: data.uniteLegale.categorieJuridiqueUniteLegale || '',
          legalStatusLabel: data.uniteLegale.libelleCategorieJuridiqueUniteLegale || '',
          address: this.formatAddress(data.etablissement),
          activity: data.etablissement.activitePrincipaleEtablissement || '',
          activityLabel: data.etablissement.libelleActivitePrincipaleEtablissement || '',
          creationDate: data.uniteLegale.dateCreationUniteLegale
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

// Instance singleton du service INSEE
let inseeService: INSEEService | null = null;

export function getINSEEService(): INSEEService {
  if (!inseeService) {
    const config: INSEEConfig = {
      baseUrl: 'https://api.insee.fr/api-sirene/3.11',
      consumerKey: process.env.INSEE_CONSUMER_KEY || '',
      consumerSecret: process.env.INSEE_CONSUMER_SECRET || ''
    };
    
    inseeService = new INSEEService(config);
  }
  
  return inseeService;
}

export default INSEEService;

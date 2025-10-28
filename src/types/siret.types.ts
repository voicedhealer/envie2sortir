// Types pour l'API INSEE Sirene

export interface INSEEAddress {
  numeroVoieEtablissement?: string;
  typeVoieEtablissement?: string;
  libelleVoieEtablissement?: string;
  codePostalEtablissement?: string;
  libelleCommuneEtablissement?: string;
  codeCommuneEtablissement?: string;
}

export interface INSEEUniteLegale {
  siren: string;
  denominationUniteLegale?: string;
  denominationUsuelle1UniteLegale?: string;
  denominationUsuelle2UniteLegale?: string;
  denominationUsuelle3UniteLegale?: string;
  categorieJuridiqueUniteLegale?: string;
  libelleCategorieJuridiqueUniteLegale?: string;
  activitePrincipaleUniteLegale?: string;
  libelleActivitePrincipaleUniteLegale?: string;
  statutDiffusionUniteLegale?: string;
  dateCreationUniteLegale?: string;
  dateDernierTraitementUniteLegale?: string;
}

export interface INSEEEtablissement {
  siret: string;
  siren: string;
  nic: string;
  numeroVoieEtablissement?: string;
  typeVoieEtablissement?: string;
  libelleVoieEtablissement?: string;
  codePostalEtablissement?: string;
  libelleCommuneEtablissement?: string;
  codeCommuneEtablissement?: string;
  activitePrincipaleEtablissement?: string;
  libelleActivitePrincipaleEtablissement?: string;
  statutDiffusionEtablissement?: string;
  dateCreationEtablissement?: string;
  dateDernierTraitementEtablissement?: string;
}

export interface INSEEResponse {
  etablissement: INSEEEtablissement;
  uniteLegale: INSEEUniteLegale;
}

export interface SiretVerificationResult {
  isValid: boolean;
  data?: {
    siret: string;
    siren: string;
    companyName: string;
    legalStatus: string;
    legalStatusLabel: string;
    address: string;
    activity: string;
    activityLabel: string;
    creationDate?: string;
  };
  error?: string;
}

export interface INSEEConfig {
  baseUrl: string;
  consumerKey: string;
  consumerSecret: string;
}

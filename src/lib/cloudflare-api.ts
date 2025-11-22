/**
 * Helper functions pour l'API GraphQL Cloudflare Analytics
 * L'API REST Analytics est deprecated, on utilise maintenant GraphQL
 */

interface CloudflareGraphQLResponse {
  data?: {
    viewer?: {
      zones?: Array<{
        httpRequests1dGroups?: Array<{
          dimensions?: {
            date?: string;
          };
          sum?: {
            requests?: number;
            bytes?: number;
            cachedBytes?: number;
            cachedRequests?: number;
          };
        }>;
      }>;
    };
  };
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
  }>;
}

interface CloudflareMetrics {
  requests: number;
  bandwidth: number;
  errors: number;
  cacheHitRate: number;
  lastUpdate: string;
}

export interface CloudflareDetailedMetrics {
  requests: number;
  bandwidth: number;
  errors: number;
  cacheHitRate: number;
  lastUpdate: string;
  dailyData: Array<{
    date: string;
    requests: number;
    bandwidth: number;
    cachedRequests: number;
  }>;
  hourlyData: Array<{
    datetime: string;
    requests: number;
    bandwidth: number;
  }>;
  httpStatusCodes: Record<string, number>;
  countries: Array<{
    name: string;
    requests: number;
  }>;
  threats?: number;
}

/**
 * Récupère les métriques Cloudflare via GraphQL Analytics API
 */
export async function getCloudflareMetrics(
  zoneId: string,
  apiToken: string,
  startDate: Date,
  endDate: Date
): Promise<{ success: boolean; data?: CloudflareMetrics; error?: string }> {
  try {
    // Format des dates pour GraphQL Cloudflare: 'YYYY-MM-DD' (pas ISO 8601)
    const startDateStr = startDate.toISOString().split('T')[0]; // 'YYYY-MM-DD'
    const endDateStr = endDate.toISOString().split('T')[0]; // 'YYYY-MM-DD'

    const query = `
      query {
        viewer {
          zones(filter: { zoneTag: "${zoneId}" }) {
            httpRequests1dGroups(
              limit: 10000
              filter: {
                date_geq: "${startDateStr}"
                date_leq: "${endDateStr}"
              }
              orderBy: [date_ASC]
            ) {
              dimensions {
                date
              }
              sum {
                requests
                bytes
                cachedBytes
                cachedRequests
              }
            }
          }
        }
      }
    `;

    const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`
      };
    }

    const data: CloudflareGraphQLResponse = await response.json();

    // Vérifier les erreurs GraphQL
    if (data.errors && data.errors.length > 0) {
      const errorMessages = data.errors.map(e => e.message).join(', ');
      return {
        success: false,
        error: `GraphQL errors: ${errorMessages}`
      };
    }

    if (!data.data || !data.data.viewer || !data.data.viewer.zones || data.data.viewer.zones.length === 0) {
      return {
        success: false,
        error: 'No zone data returned'
      };
    }

    const zone = data.data.viewer.zones[0];
    const groups = zone.httpRequests1dGroups || [];

    // Agréger les métriques sur toutes les périodes
    let totalRequests = 0;
    let totalBytes = 0;
    let totalCachedBytes = 0;
    let totalCachedRequests = 0;

    groups.forEach(group => {
      if (group.sum) {
        totalRequests += group.sum.requests || 0;
        totalBytes += group.sum.bytes || 0;
        totalCachedBytes += group.sum.cachedBytes || 0;
        totalCachedRequests += group.sum.cachedRequests || 0;
      }
    });

    // Calculer le taux de cache hit
    const cacheHitRate = totalRequests > 0
      ? (totalCachedRequests / totalRequests) * 100
      : 0;

    // Pour les erreurs, on peut utiliser une requête séparée ou estimer
    // L'API GraphQL Cloudflare ne fournit pas directement les erreurs dans cette requête
    // On peut utiliser une autre requête ou laisser à 0 pour l'instant
    const errors = 0;

    return {
      success: true,
      data: {
        requests: totalRequests,
        bandwidth: totalBytes,
        errors: errors,
        cacheHitRate: Math.round(cacheHitRate * 100) / 100,
        lastUpdate: new Date().toISOString()
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Récupère des métriques détaillées Cloudflare via GraphQL Analytics API
 * Inclut des données par jour, par heure, codes HTTP, et géolocalisation
 */
export async function getCloudflareDetailedMetrics(
  zoneId: string,
  apiToken: string,
  startDate: Date,
  endDate: Date
): Promise<{ success: boolean; data?: CloudflareDetailedMetrics; error?: string }> {
  try {
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    // Calculer la date de début pour les données horaires (dernières 24h)
    const hourlyStartDate = new Date(endDate.getTime() - 24 * 60 * 60 * 1000);

    const query = `
      query {
        viewer {
          zones(filter: { zoneTag: "${zoneId}" }) {
            httpRequests1dGroups(
              limit: 10000
              filter: {
                date_geq: "${startDateStr}"
                date_leq: "${endDateStr}"
              }
              orderBy: [date_ASC]
            ) {
              dimensions {
                date
              }
              sum {
                requests
                bytes
                cachedBytes
                cachedRequests
                responseStatusMap {
                  edgeResponseStatus
                  requests
                }
                countryMap {
                  clientCountryName
                  requests
                }
              }
            }
            httpRequests1hGroups(
              limit: 1000
              filter: {
                datetime_geq: "${hourlyStartDate.toISOString()}"
                datetime_leq: "${endDate.toISOString()}"
              }
              orderBy: [datetime_ASC]
            ) {
              dimensions {
                datetime
              }
              sum {
                requests
                bytes
                cachedRequests
              }
            }
          }
        }
      }
    `;

    const response = await fetch('https://api.cloudflare.com/client/v4/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`
      };
    }

    const data: any = await response.json();

    if (data.errors && data.errors.length > 0) {
      const errorMessages = data.errors.map((e: any) => e.message).join(', ');
      return {
        success: false,
        error: `GraphQL errors: ${errorMessages}`
      };
    }

    if (!data.data || !data.data.viewer || !data.data.viewer.zones || data.data.viewer.zones.length === 0) {
      return {
        success: false,
        error: 'No zone data returned'
      };
    }

    const zone = data.data.viewer.zones[0];
    const dailyGroups = zone.httpRequests1dGroups || [];
    const hourlyGroups = zone.httpRequests1hGroups || [];

    // Préparer les données quotidiennes
    const dailyData = dailyGroups.map((group: any) => ({
      date: group.dimensions?.date || '',
      requests: group.sum?.requests || 0,
      bandwidth: group.sum?.bytes || 0,
      cachedRequests: group.sum?.cachedRequests || 0,
    }));

    // Préparer les données horaires
    const hourlyData = hourlyGroups.map((group: any) => ({
      datetime: group.dimensions?.datetime || '',
      requests: group.sum?.requests || 0,
      bandwidth: group.sum?.bytes || 0,
    }));

    // Agréger les codes HTTP
    const httpStatusCodes: Record<string, number> = {};
    dailyGroups.forEach((group: any) => {
      if (group.sum?.responseStatusMap) {
        group.sum.responseStatusMap.forEach((status: any) => {
          const code = status.edgeResponseStatus?.toString() || 'unknown';
          httpStatusCodes[code] = (httpStatusCodes[code] || 0) + (status.requests || 0);
        });
      }
    });

    // Agréger par pays
    const countriesMap: Record<string, number> = {};
    dailyGroups.forEach((group: any) => {
      if (group.sum?.countryMap) {
        group.sum.countryMap.forEach((country: any) => {
          const name = country.clientCountryName || 'Unknown';
          countriesMap[name] = (countriesMap[name] || 0) + (country.requests || 0);
        });
      }
    });

    const countries = Object.entries(countriesMap)
      .map(([name, requests]) => ({ name, requests }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10); // Top 10 pays

    // Calculer les totaux
    const totalRequests = dailyData.reduce((sum, d) => sum + d.requests, 0);
    const totalBytes = dailyData.reduce((sum, d) => sum + d.bandwidth, 0);
    const totalCachedRequests = dailyData.reduce((sum, d) => sum + d.cachedRequests, 0);
    const cacheHitRate = totalRequests > 0
      ? (totalCachedRequests / totalRequests) * 100
      : 0;

    // Calculer les erreurs (codes 4xx et 5xx)
    const errors = Object.entries(httpStatusCodes).reduce((sum, [code, count]) => {
      const codeNum = parseInt(code);
      if (codeNum >= 400 && codeNum < 600) {
        return sum + count;
      }
      return sum;
    }, 0);

    return {
      success: true,
      data: {
        requests: totalRequests,
        bandwidth: totalBytes,
        errors: errors,
        cacheHitRate: Math.round(cacheHitRate * 100) / 100,
        lastUpdate: new Date().toISOString(),
        dailyData,
        hourlyData,
        httpStatusCodes,
        countries,
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Vérifie que la zone Cloudflare existe et que le token est valide
 */
export async function verifyCloudflareZone(
  zoneId: string,
  apiToken: string
): Promise<{ success: boolean; zoneName?: string; error?: string }> {
  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}`,
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ errors: [] }));
      return {
        success: false,
        error: `HTTP ${response.status}: ${JSON.stringify(errorData)}`
      };
    }

    const data = await response.json();
    const zone = data.result;

    return {
      success: true,
      zoneName: zone?.name
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}


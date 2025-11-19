/**
 * Helper functions pour l'API GraphQL Railway
 */

interface RailwayProject {
  id: string;
  name: string;
  services: {
    edges: Array<{
      node: {
        id: string;
        name: string;
      };
    }>;
  };
}

interface RailwayGraphQLResponse {
  data?: {
    project?: RailwayProject;
  };
  errors?: Array<{
    message: string;
    extensions?: {
      code?: string;
    };
  }>;
}

/**
 * Récupère les informations d'un projet Railway via GraphQL
 */
export async function getRailwayProject(
  projectId: string,
  apiToken: string
): Promise<{ success: boolean; data?: RailwayProject; error?: string }> {
  try {
    const response = await fetch('https://backboard.railway.com/graphql/v2', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `
          query {
            project(id: "${projectId}") {
              id
              name
              services {
                edges {
                  node {
                    id
                    name
                  }
                }
              }
            }
          }
        `
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `HTTP ${response.status}: ${errorText}`
      };
    }

    const data: RailwayGraphQLResponse = await response.json();

    // Vérifier les erreurs GraphQL
    if (data.errors && data.errors.length > 0) {
      const errorMessages = data.errors.map(e => e.message).join(', ');
      return {
        success: false,
        error: `GraphQL errors: ${errorMessages}`
      };
    }

    if (!data.data || !data.data.project) {
      return {
        success: false,
        error: 'No project data returned'
      };
    }

    return {
      success: true,
      data: data.data.project
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Récupère les métriques d'un service Railway via l'API REST
 * (Les métriques ne sont pas disponibles via GraphQL)
 */
export async function getRailwayServiceMetrics(
  serviceId: string,
  apiToken: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const response = await fetch(
      `https://api.railway.app/v1/services/${serviceId}/metrics`,
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
    return {
      success: true,
      data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}




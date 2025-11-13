import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/supabase/helpers';

/**
 * GET /api/user/location-preferences
 * Récupère les préférences de localisation de l'utilisateur connecté
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const supabase = createClient();

    // Récupérer les préférences
    const { data: locationPreference, error: preferenceError } = await supabase
      .from('location_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (preferenceError || !locationPreference) {
      return NextResponse.json({
        preferences: null,
      });
    }

    // Formater les préférences pour correspondre au type LocationPreferences
    const preferences = {
      defaultCity: {
        id: locationPreference.city_id,
        name: locationPreference.city_name,
        latitude: locationPreference.city_latitude,
        longitude: locationPreference.city_longitude,
        region: locationPreference.city_region || undefined,
      },
      searchRadius: locationPreference.search_radius,
      mode: locationPreference.mode as 'auto' | 'manual' | 'ask',
      useCurrentLocation: locationPreference.use_current_location,
    };

    return NextResponse.json({
      preferences,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des préférences:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/location-preferences
 * Sauvegarde les préférences de localisation de l'utilisateur connecté
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const supabase = createClient();

    // Récupérer les données du body
    const body = await request.json();
    const { defaultCity, searchRadius, mode, useCurrentLocation } = body;

    if (!defaultCity) {
      return NextResponse.json(
        { error: 'Ville par défaut requise' },
        { status: 400 }
      );
    }

    // Vérifier si une préférence existe déjà
    const { data: existingPreference } = await supabase
      .from('location_preferences')
      .select('id')
      .eq('user_id', user.id)
      .single();

    const preferenceData = {
      user_id: user.id,
      city_id: defaultCity.id,
      city_name: defaultCity.name,
      city_latitude: defaultCity.latitude,
      city_longitude: defaultCity.longitude,
      city_region: defaultCity.region || null,
      search_radius: searchRadius || 20,
      mode: mode || 'manual',
      use_current_location: useCurrentLocation || false,
      updated_at: new Date().toISOString()
    };

    let locationPreference;
    if (existingPreference) {
      // Mettre à jour
      const { data: updated, error: updateError } = await supabase
        .from('location_preferences')
        .update(preferenceData)
        .eq('id', existingPreference.id)
        .select()
        .single();

      if (updateError || !updated) {
        console.error('Erreur mise à jour préférences:', updateError);
        return NextResponse.json(
          { error: 'Erreur serveur' },
          { status: 500 }
        );
      }
      locationPreference = updated;
    } else {
      // Créer
      const { data: created, error: createError } = await supabase
        .from('location_preferences')
        .insert({
          ...preferenceData,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError || !created) {
        console.error('Erreur création préférences:', createError);
        return NextResponse.json(
          { error: 'Erreur serveur' },
          { status: 500 }
        );
      }
      locationPreference = created;
    }

    return NextResponse.json({
      success: true,
      preferences: locationPreference,
    });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des préférences:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}


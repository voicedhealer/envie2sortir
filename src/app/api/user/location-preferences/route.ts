import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth-utils';

/**
 * GET /api/user/location-preferences
 * Récupère les préférences de localisation de l'utilisateur connecté
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer les préférences
    const locationPreference = await prisma.locationPreference.findUnique({
      where: { userId: user.id },
    });

    if (!locationPreference) {
      return NextResponse.json({
        preferences: null,
      });
    }

    // Formater les préférences pour correspondre au type LocationPreferences
    const preferences = {
      defaultCity: {
        id: locationPreference.cityId,
        name: locationPreference.cityName,
        latitude: locationPreference.cityLatitude,
        longitude: locationPreference.cityLongitude,
        region: locationPreference.cityRegion || undefined,
      },
      searchRadius: locationPreference.searchRadius,
      mode: locationPreference.mode as 'auto' | 'manual' | 'ask',
      useCurrentLocation: locationPreference.useCurrentLocation,
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
    const user = await getCurrentUser(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer les données du body
    const body = await request.json();
    const { defaultCity, searchRadius, mode, useCurrentLocation } = body;

    if (!defaultCity) {
      return NextResponse.json(
        { error: 'Ville par défaut requise' },
        { status: 400 }
      );
    }

    // Upsert (create or update) les préférences
    const locationPreference = await prisma.locationPreference.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        cityId: defaultCity.id,
        cityName: defaultCity.name,
        cityLatitude: defaultCity.latitude,
        cityLongitude: defaultCity.longitude,
        cityRegion: defaultCity.region,
        searchRadius: searchRadius || 20,
        mode: mode || 'manual',
        useCurrentLocation: useCurrentLocation || false,
      },
      update: {
        cityId: defaultCity.id,
        cityName: defaultCity.name,
        cityLatitude: defaultCity.latitude,
        cityLongitude: defaultCity.longitude,
        cityRegion: defaultCity.region,
        searchRadius: searchRadius || 20,
        mode: mode || 'manual',
        useCurrentLocation: useCurrentLocation || false,
      },
    });

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


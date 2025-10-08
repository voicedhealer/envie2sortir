import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      searchTerm,
      resultCount,
      clickedEstablishmentId,
      clickedEstablishmentName,
      userAgent,
      referrer,
      city,
      searchedCity,
    } = body;

    // Validation des données requises
    if (!searchTerm) {
      return NextResponse.json(
        { error: 'searchTerm is required' },
        { status: 400 }
      );
    }

    // Enregistrer la recherche
    await prisma.searchAnalytics.create({
      data: {
        searchTerm: searchTerm.trim().toLowerCase(),
        resultCount: resultCount || 0,
        clickedEstablishmentId,
        clickedEstablishmentName,
        userAgent: userAgent || request.headers.get('user-agent'),
        referrer: referrer || request.headers.get('referer'),
        city,
        searchedCity,
        timestamp: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Search tracking error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


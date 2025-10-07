import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const patterns = await prisma.establishmentLearningPattern.findMany({
      take: limit,
      skip: offset,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Parser les données JSON
    const formattedPatterns = patterns.map(pattern => ({
      id: pattern.id,
      name: pattern.name,
      detectedType: pattern.detectedType,
      correctedType: pattern.correctedType,
      googleTypes: JSON.parse(pattern.googleTypes),
      keywords: JSON.parse(pattern.keywords),
      confidence: pattern.confidence,
      isCorrected: pattern.isCorrected,
      correctedBy: pattern.correctedBy,
      createdAt: pattern.createdAt.toISOString(),
      updatedAt: pattern.updatedAt.toISOString()
    }));

    return NextResponse.json(formattedPatterns);
  } catch (error) {
    console.error('Error fetching learning patterns:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

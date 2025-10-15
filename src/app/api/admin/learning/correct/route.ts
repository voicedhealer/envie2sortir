import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { serverLearningService } from '@/lib/server-learning-service';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { patternId, patternName, correctedType, correctedBy } = await request.json();

    if (!patternId || !patternName || !correctedType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await serverLearningService.correctEstablishmentType(patternName, correctedType, correctedBy);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error correcting learning pattern:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

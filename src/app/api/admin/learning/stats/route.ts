import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/supabase/helpers';
import { serverLearningService } from '@/lib/server-learning-service';

export async function GET(request: NextRequest) {
  try {
    const userIsAdmin = await isAdmin();
    if (!userIsAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await serverLearningService.getLearningStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching learning stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

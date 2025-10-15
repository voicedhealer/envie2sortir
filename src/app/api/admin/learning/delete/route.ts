import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { patternId } = await request.json();

    if (!patternId) {
      return NextResponse.json({ error: 'Pattern ID is required' }, { status: 400 });
    }

    await prisma.establishmentLearningPattern.delete({
      where: { id: patternId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting learning pattern:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

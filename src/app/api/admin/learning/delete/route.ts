import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { isAdmin, getCurrentUser } from '@/lib/supabase/helpers';

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    
    if (!user || !(await isAdmin(user.id))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { patternId } = await request.json();

    if (!patternId) {
      return NextResponse.json({ error: 'Pattern ID is required' }, { status: 400 });
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from('establishment_learning_patterns')
      .delete()
      .eq('id', patternId);
    
    if (error) {
      console.error('Error deleting learning pattern:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting learning pattern:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

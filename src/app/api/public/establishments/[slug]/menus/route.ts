import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { PublicMenuDisplay } from '@/types/menu.types';

// GET /api/public/establishments/[slug]/menus - Récupérer les menus publics d'un établissement
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const supabase = await createClient();

    // Récupérer l'établissement par son slug
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select(`
        id,
        subscription,
        owner:professionals!establishments_owner_id_fkey (
          id
        )
      `)
      .eq('slug', slug)
      .eq('status', 'approved')
      .single();

    if (establishmentError || !establishment) {
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 });
    }

    // Vérifier que l'établissement a un plan Premium (seuls les Premium ont des menus)
    if (establishment.subscription !== 'PREMIUM') {
      return NextResponse.json({
        success: true,
        menus: [],
        message: 'Aucun menu disponible pour cet établissement'
      });
    }

    // Récupérer les menus de l'établissement
    const { data: menus, error: menusError } = await supabase
      .from('establishment_menus')
      .select('*')
      .eq('establishment_id', establishment.id)
      .eq('is_active', true)
      .order('order', { ascending: true });

    if (menusError) {
      console.error('Erreur récupération menus:', menusError);
      return NextResponse.json(
        { error: 'Erreur interne du serveur' },
        { status: 500 }
      );
    }

    // Transformer les menus pour l'affichage public
    const publicMenus: PublicMenuDisplay[] = (menus || []).map((menu: any) => ({
      id: menu.id,
      name: menu.name,
      description: menu.description,
      fileUrl: menu.file_url,
      fileName: menu.file_name,
      fileSize: menu.file_size,
      order: menu.order
    }));

    return NextResponse.json({
      success: true,
      menus: publicMenus
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des menus publics:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

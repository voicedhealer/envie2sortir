import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireEstablishment } from '@/lib/supabase/helpers';
import { hasPremiumAccess, type SubscriptionType } from '@/lib/subscription-utils';
import { EstablishmentMenu } from '@/types/menu.types';

// GET /api/establishments/[id]/menus - Récupérer les menus d'un établissement
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireEstablishment();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id: establishmentId } = await params;

    // Vérifier que l'établissement appartient à l'utilisateur professionnel
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select(`
        id,
        subscription,
        owner:professionals!establishments_owner_id_fkey (
          id,
          email
        )
      `)
      .eq('id', establishmentId)
      .eq('owner_id', user.id)
      .single();

    if (establishmentError || !establishment) {
      return NextResponse.json({ error: 'Établissement non trouvé' }, { status: 404 });
    }

    // Vérifier que l'utilisateur a un plan Premium (inclut WAITLIST_BETA)
    if (!hasPremiumAccess(establishment.subscription as SubscriptionType)) {
      return NextResponse.json({ 
        error: 'Cette fonctionnalité est réservée aux comptes Premium' 
      }, { status: 403 });
    }

    // Récupérer les menus de l'établissement
    const { data: menus, error: menusError } = await supabase
      .from('establishment_menus')
      .select('*')
      .eq('establishment_id', establishmentId)
      .eq('is_active', true)
      .order('order', { ascending: true });

    if (menusError) {
      console.error('Erreur récupération menus:', menusError);
      return NextResponse.json(
        { error: 'Erreur interne du serveur' },
        { status: 500 }
      );
    }

    // Convertir snake_case -> camelCase
    const formattedMenus = (menus || []).map((menu: any) => ({
      id: menu.id,
      name: menu.name,
      description: menu.description,
      fileUrl: menu.file_url,
      fileName: menu.file_name,
      fileSize: menu.file_size,
      order: menu.order,
      isActive: menu.is_active,
      createdAt: menu.created_at,
      updatedAt: menu.updated_at
    }));

    return NextResponse.json({
      success: true,
      menus: formattedMenus as EstablishmentMenu[]
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des menus:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

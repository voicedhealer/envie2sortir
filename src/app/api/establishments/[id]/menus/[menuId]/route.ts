import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireEstablishment } from '@/lib/supabase/helpers';
import { deleteFile } from '@/lib/supabase/helpers';
import { hasPremiumAccess, type SubscriptionType } from '@/lib/subscription-utils';

// DELETE /api/establishments/[id]/menus/[menuId] - Supprimer un menu
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; menuId: string }> }
) {
  try {
    const user = await requireEstablishment();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id: establishmentId, menuId } = await params;

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

    // Récupérer le menu à supprimer
    const { data: menu, error: menuError } = await supabase
      .from('establishment_menus')
      .select('*')
      .eq('id', menuId)
      .eq('establishment_id', establishmentId)
      .single();

    if (menuError || !menu) {
      return NextResponse.json({ error: 'Menu non trouvé' }, { status: 404 });
    }

    // Extraire le chemin du fichier depuis l'URL
    const fileUrl = menu.file_url;
    let filePath = '';
    if (fileUrl) {
      // Extraire le chemin depuis l'URL Supabase Storage
      const urlParts = fileUrl.split('/menus/');
      if (urlParts.length > 1) {
        filePath = `menus/${urlParts[1]}`;
      }
    }

    // Supprimer le fichier de Supabase Storage
    if (filePath) {
      await deleteFile('menus', filePath);
    }

    // Supprimer l'entrée en base de données
    const { error: deleteError } = await supabase
      .from('establishment_menus')
      .delete()
      .eq('id', menuId);

    if (deleteError) {
      console.error('Erreur suppression menu:', deleteError);
      return NextResponse.json(
        { error: 'Erreur interne du serveur' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Menu supprimé avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression du menu:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

// PUT /api/establishments/[id]/menus/[menuId] - Mettre à jour un menu
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; menuId: string }> }
) {
  try {
    const user = await requireEstablishment();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const supabase = await createClient();
    const { id: establishmentId, menuId } = await params;
    const body = await request.json();
    const { name, description, order, isActive } = body;

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

    // Vérifier que le menu existe
    const { data: existingMenu, error: existingError } = await supabase
      .from('establishment_menus')
      .select('*')
      .eq('id', menuId)
      .eq('establishment_id', establishmentId)
      .single();

    if (existingError || !existingMenu) {
      return NextResponse.json({ error: 'Menu non trouvé' }, { status: 404 });
    }

    // Préparer les données de mise à jour
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (order !== undefined) updateData.ordre = order;
    if (isActive !== undefined) updateData.is_active = isActive;

    // Mettre à jour le menu
    const { data: updatedMenu, error: updateError } = await supabase
      .from('establishment_menus')
      .update(updateData)
      .eq('id', menuId)
      .select()
      .single();

    if (updateError || !updatedMenu) {
      console.error('Erreur mise à jour menu:', updateError);
      return NextResponse.json(
        { error: 'Erreur interne du serveur' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      menu: {
        id: updatedMenu.id,
        name: updatedMenu.name,
        description: updatedMenu.description,
        fileUrl: updatedMenu.file_url,
        fileName: updatedMenu.file_name,
        fileSize: updatedMenu.file_size,
        mimeType: updatedMenu.mime_type,
        order: updatedMenu.ordre,
        isActive: updatedMenu.is_active,
        establishmentId: updatedMenu.establishment_id,
        createdAt: updatedMenu.created_at,
        updatedAt: updatedMenu.updated_at
      }
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du menu:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

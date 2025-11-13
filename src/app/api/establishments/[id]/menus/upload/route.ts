import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireEstablishment } from '@/lib/supabase/helpers';
import { uploadFile } from '@/lib/supabase/helpers';
import { MENU_CONSTRAINTS } from '@/types/menu.types';

// POST /api/establishments/[id]/menus/upload - Uploader un menu PDF
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireEstablishment();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const supabase = createClient();
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

    // Vérifier que l'utilisateur a un plan Premium
    if (establishment.subscription !== 'PREMIUM') {
      return NextResponse.json({ 
        error: 'Cette fonctionnalité est réservée aux comptes Premium' 
      }, { status: 403 });
    }

    // Vérifier la limite de menus (5 maximum)
    const { count: menuCount, error: countError } = await supabase
      .from('establishment_menus')
      .select('*', { count: 'exact', head: true })
      .eq('establishment_id', establishmentId)
      .eq('is_active', true);

    if (countError) {
      console.error('Erreur comptage menus:', countError);
    }

    if ((menuCount || 0) >= MENU_CONSTRAINTS.MAX_FILES) {
      return NextResponse.json({ 
        error: `Limite de ${MENU_CONSTRAINTS.MAX_FILES} menus atteinte` 
      }, { status: 400 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    if (!file || !name) {
      return NextResponse.json({ 
        error: 'Fichier et nom requis' 
      }, { status: 400 });
    }

    // Validation du fichier
    if (file.size > MENU_CONSTRAINTS.MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `Fichier trop volumineux. Maximum ${MENU_CONSTRAINTS.MAX_FILE_SIZE / (1024 * 1024)}MB` 
      }, { status: 400 });
    }

    if (!MENU_CONSTRAINTS.ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Format de fichier non supporté. Seuls les PDF sont acceptés.' 
      }, { status: 400 });
    }

    // Vérifier l'extension
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!MENU_CONSTRAINTS.ALLOWED_EXTENSIONS.includes(fileExtension)) {
      return NextResponse.json({ 
        error: 'Extension de fichier non supportée. Seuls les PDF sont acceptés.' 
      }, { status: 400 });
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const sanitizedName = name.replace(/[^a-zA-Z0-9\s-_]/g, '').replace(/\s+/g, '_');
    const fileName = `${sanitizedName}_${timestamp}.pdf`;
    const filePath = `menus/${establishmentId}/${fileName}`;

    // Upload vers Supabase Storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const { data: uploadData, error: uploadError } = await uploadFile(
      'menus',
      filePath,
      buffer,
      {
        contentType: file.type,
        upsert: false
      }
    );

    if (uploadError || !uploadData) {
      console.error('Erreur upload menu:', uploadError);
      return NextResponse.json(
        { error: 'Erreur lors de l\'upload du fichier' },
        { status: 500 }
      );
    }

    // Obtenir l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('menus')
      .getPublicUrl(filePath);

    // Déterminer l'ordre (dernier + 1)
    const { data: lastMenu } = await supabase
      .from('establishment_menus')
      .select('ordre')
      .eq('establishment_id', establishmentId)
      .order('ordre', { ascending: false })
      .limit(1)
      .single();

    const order = lastMenu ? (lastMenu.ordre || 0) + 1 : 0;

    // Créer l'entrée en base de données
    const { data: menu, error: menuError } = await supabase
      .from('establishment_menus')
      .insert({
        name,
        description: description || null,
        file_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        ordre: order,
        is_active: true,
        establishment_id: establishmentId
      })
      .select()
      .single();

    if (menuError || !menu) {
      console.error('Erreur création menu:', menuError);
      // Rollback: supprimer le fichier uploadé
      await supabase.storage.from('menus').remove([filePath]);
      return NextResponse.json(
        { error: 'Erreur lors de la création du menu' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      menu: {
        id: menu.id,
        name: menu.name,
        description: menu.description,
        fileUrl: menu.file_url,
        fileName: menu.file_name,
        fileSize: menu.file_size,
        mimeType: menu.mime_type,
        order: menu.ordre,
        isActive: menu.is_active,
        establishmentId: menu.establishment_id,
        createdAt: menu.created_at,
        updatedAt: menu.updated_at
      }
    });

  } catch (error) {
    console.error('Erreur lors de l\'upload du menu:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

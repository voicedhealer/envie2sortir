import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/helpers";

/**
 * API pour incrémenter les statistiques d'un établissement
 * 
 * Endpoints:
 * - POST /api/establishments/[id]/stats?action=view - Incrémente les vues
 * - POST /api/establishments/[id]/stats?action=click - Incrémente les clics
 */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (!action || !['view', 'click'].includes(action)) {
      return NextResponse.json(
        { error: "Action invalide. Utilisez 'view' ou 'click'" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Vérifier que l'établissement existe
    const { data: establishment, error: establishmentError } = await supabase
      .from('establishments')
      .select('id, name, status, owner_id, views_count, clicks_count')
      .eq('id', id)
      .single();

    if (establishmentError || !establishment) {
      return NextResponse.json(
        { error: "Établissement non trouvé" },
        { status: 404 }
      );
    }

    // ✅ CORRECTION : Vérifier si c'est le propriétaire qui consulte
    // Gérer les erreurs de getCurrentUser gracieusement (peut timeout ou échouer)
    let user = null;
    try {
      // Timeout pour getCurrentUser pour éviter de bloquer
      const getUserPromise = getCurrentUser();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('getCurrentUser timeout')), 3000)
      );
      
      user = await Promise.race([getUserPromise, timeoutPromise]).catch(() => null);
    } catch (error) {
      // Si getCurrentUser échoue, continuer quand même (peut être un utilisateur non connecté)
      console.log('ℹ️ [Stats] getCurrentUser failed, continuing without user check:', error);
      user = null;
    }
    
    if (user && user.id === establishment.owner_id) {
      console.log('🔒 Vue/click du propriétaire ignorée pour:', establishment.name);
      return NextResponse.json({
        success: true,
        action,
        message: "Statistique non comptabilisée (propriétaire)",
        establishment: {
          id: establishment.id,
          name: establishment.name,
          viewsCount: 0, // Ne pas révéler les vraies statistiques
          clicksCount: 0
        }
      });
    }

    // Note: On permet l'incrémentation même pour les établissements en attente
    // car le propriétaire peut voir et tester sa propre page avant validation
    // Les établissements rejetés sont exclus
    if (establishment.status === 'rejected') {
      return NextResponse.json(
        { error: "Établissement non disponible" },
        { status: 403 }
      );
    }

    // Incrémenter la statistique appropriée
    const currentViews = establishment.views_count || 0;
    const currentClicks = establishment.clicks_count || 0;
    
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (action === 'view') {
      updateData.views_count = currentViews + 1;
    } else {
      updateData.clicks_count = currentClicks + 1;
    }

    // ✅ CORRECTION : Utiliser directement le client admin pour les stats
    // Les stats doivent être incrémentées même pour les utilisateurs non authentifiés
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    let updatedEstablishment: any = null;
    let updateError: any = null;
    
    if (supabaseUrl && serviceKey) {
      // Utiliser le client admin pour bypass RLS
      const { createClient: createClientAdmin } = await import('@supabase/supabase-js');
      const adminClient = createClientAdmin(supabaseUrl, serviceKey, {
        auth: { persistSession: false }
      });
      
      const adminResult = await adminClient
        .from('establishments')
        .update(updateData)
        .eq('id', id)
        .select('id, name, views_count, clicks_count')
        .single();
      
      updatedEstablishment = adminResult.data;
      updateError = adminResult.error;
    } else {
      // Fallback sur le client normal si les clés admin ne sont pas disponibles
      const result = await supabase
        .from('establishments')
        .update(updateData)
        .eq('id', id)
        .select('id, name, views_count, clicks_count')
        .single();
      
      updatedEstablishment = result.data;
      updateError = result.error;
    }
    
    if (updateError || !updatedEstablishment) {
      // Log détaillé pour debug
      const errorDetails = {
        error: updateError,
        code: updateError?.code,
        message: updateError?.message,
        details: updateError?.details,
        hint: updateError?.hint,
        updateData,
        establishmentId: id,
        hasAdminClient: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
      };
      
      console.error('❌ Erreur incrémentation statistique:', JSON.stringify(errorDetails, null, 2));
      
      // Retourner l'erreur détaillée en développement
      const errorMessage = process.env.NODE_ENV === 'development' 
        ? `Erreur lors de l'incrémentation des statistiques: ${updateError?.message || 'Erreur inconnue'}`
        : "Erreur lors de l'incrémentation des statistiques";
      
      return NextResponse.json(
        { 
          error: errorMessage,
          ...(process.env.NODE_ENV === 'development' && { details: errorDetails })
        },
        { status: 500 }
      );
    }

    console.log(`📊 Statistique ${action} incrémentée pour ${establishment.name}:`, {
      viewsCount: updatedEstablishment.views_count,
      clicksCount: updatedEstablishment.clicks_count
    });

    return NextResponse.json({
      success: true,
      action,
      establishment: {
        id: updatedEstablishment.id,
        name: updatedEstablishment.name,
        viewsCount: updatedEstablishment.views_count,
        clicksCount: updatedEstablishment.clicks_count
      }
    });

  } catch (error) {
    console.error('❌ Erreur incrémentation statistique:', error);
    return NextResponse.json(
      { error: "Erreur lors de l'incrémentation des statistiques" },
      { status: 500 }
    );
  }
}

import { isAdmin } from '@/lib/supabase/helpers';
import { redirect } from 'next/navigation';
import ModificationsManager from './ModificationsManager';
import { createClient } from '@/lib/supabase/server';
import { createClient as createClientAdmin } from '@supabase/supabase-js';

export default async function AdminModificationsPage() {
  // Vérifier que l'utilisateur est un admin
  const adminCheck = await isAdmin();
  if (!adminCheck) {
    redirect('/auth?error=AccessDenied');
  }

  const supabase = await createClient();
  
  // Essayer d'utiliser le client admin pour contourner les RLS si disponible
  let adminSupabase: any = null;
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && supabaseServiceKey) {
      adminSupabase = createClientAdmin(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });
      console.log('✅ Client admin créé pour contourner RLS');
    } else {
      console.warn('⚠️ SUPABASE_SERVICE_ROLE_KEY non défini, utilisation du client normal');
    }
  } catch (error) {
    console.warn('⚠️ Erreur création client admin, utilisation du client normal:', error);
  }

  // Récupérer toutes les demandes en attente
  const { data: pendingRequestsData, error: pendingError } = await supabase
    .from('professional_update_requests')
    .select(`
      *,
      professional:professionals!professional_update_requests_professional_id_fkey (
        id,
        email,
        first_name,
        last_name,
        company_name,
        phone,
        siret
      )
    `)
    .eq('status', 'pending')
    .order('requested_at', { ascending: false });

  if (pendingError) {
    console.error('Erreur récupération demandes en attente:', pendingError);
  }

  // Récupérer l'historique récent
  const { data: recentHistoryData, error: historyError } = await supabase
    .from('professional_update_requests')
    .select(`
      *,
      professional:professionals!professional_update_requests_professional_id_fkey (
        id,
        email,
        first_name,
        last_name,
        company_name
      )
    `)
    .in('status', ['approved', 'rejected'])
    .order('reviewed_at', { ascending: false })
    .limit(20);

  if (historyError) {
    console.error('Erreur récupération historique:', historyError);
  }

  // Récupérer les demandes professionnelles depuis la page wait
  // Utiliser le client admin si disponible pour contourner les RLS
  const clientToUse = adminSupabase || supabase;
  
  const { data: professionalInquiriesData, error: inquiriesError } = await clientToUse
    .from('professional_inquiries')
    .select('*')
    .order('created_at', { ascending: false });

  if (inquiriesError) {
    console.error('❌ Erreur récupération demandes professionnelles:', inquiriesError);
    console.error('Détails:', {
      message: inquiriesError.message,
      code: inquiriesError.code,
      details: inquiriesError.details,
      hint: inquiriesError.hint
    });
  } else {
    console.log(`✅ Demandes professionnelles récupérées: ${professionalInquiriesData?.length || 0}`);
    if (professionalInquiriesData && professionalInquiriesData.length > 0) {
      console.log('📋 Première demande:', professionalInquiriesData[0]);
    }
  }

  // Transformer les demandes professionnelles
  const professionalInquiries = (professionalInquiriesData || []).map((inquiry: any) => ({
    id: inquiry.id,
    firstName: inquiry.first_name,
    lastName: inquiry.last_name,
    establishmentName: inquiry.establishment_name,
    city: inquiry.city,
    description: inquiry.description,
    ipAddress: inquiry.ip_address,
    createdAt: inquiry.created_at,
    updatedAt: inquiry.updated_at
  }));

  // Transformer les données pour correspondre au format attendu
  const pendingRequests = (pendingRequestsData || []).map((req: any) => ({
    ...req,
    requestedAt: req.requested_at,
    reviewedAt: req.reviewed_at,
    professional: req.professional ? {
      id: req.professional.id,
      email: req.professional.email,
      firstName: req.professional.first_name,
      lastName: req.professional.last_name,
      companyName: req.professional.company_name,
      phone: req.professional.phone,
      siret: req.professional.siret
    } : null
  }));

  const recentHistory = (recentHistoryData || []).map((req: any) => ({
    ...req,
    requestedAt: req.requested_at,
    reviewedAt: req.reviewed_at,
    professional: req.professional ? {
      id: req.professional.id,
      email: req.professional.email,
      firstName: req.professional.first_name,
      lastName: req.professional.last_name,
      companyName: req.professional.company_name
    } : null
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ModificationsManager 
          pendingRequests={pendingRequests as any} 
          recentHistory={recentHistory as any}
          professionalInquiries={professionalInquiries as any}
        />
      </div>
    </div>
  );
}


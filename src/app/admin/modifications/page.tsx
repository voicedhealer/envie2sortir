import { isAdmin } from '@/lib/supabase/helpers';
import { redirect } from 'next/navigation';
import ModificationsManager from './ModificationsManager';
import { createClient } from '@/lib/supabase/server';

export default async function AdminModificationsPage() {
  // Vérifier que l'utilisateur est un admin
  const adminCheck = await isAdmin();
  if (!adminCheck) {
    redirect('/auth?error=AccessDenied');
  }

  const supabase = await createClient();

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
        />
      </div>
    </div>
  );
}


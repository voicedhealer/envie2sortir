import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireEstablishment } from "@/lib/supabase/helpers";
import DashboardContent from "@/app/dashboard/DashboardContent";

// Indispensable pour éviter l'erreur "Dynamic server usage" au build
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  try {
    // Vérifier que l'utilisateur est authentifié et est un professionnel
    const user = await requireEstablishment();
    if (!user) {
      redirect('/auth');
    }

    const supabase = await createClient();

    // Récupérer le professionnel
    const { data: professional, error: professionalError } = await supabase
      .from('professionals')
      .select('id, email, first_name, last_name, phone, siret, company_name, subscription_plan')
      .eq('id', user.id)
      .single();

    if (professionalError || !professional) {
      console.error('Erreur récupération professionnel:', professionalError);
      redirect('/auth?error=ProfessionalNotFound');
    }

    // Récupérer l'établissement de l'utilisateur
    // Utiliser getProfessionalEstablishment qui utilise le client admin pour contourner RLS
    const { getProfessionalEstablishment } = await import('@/lib/supabase/helpers');
    let establishment = await getProfessionalEstablishment(user.id);

    if (!establishment) {
      console.error('Aucun établissement trouvé pour l\'utilisateur:', user.id);
      redirect('/auth?error=EstablishmentNotFound');
    }

    // Récupérer les données supplémentaires (images, tags, events) avec le client admin
    const { createClient: createClientAdmin } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (supabaseUrl && supabaseServiceKey) {
      const adminClient = createClientAdmin(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      });

      // Récupérer les images
      const { data: images } = await adminClient
        .from('images')
        .select('id, url, is_primary, ordre, created_at')
        .eq('establishment_id', establishment.id)
        .order('ordre', { ascending: true });

      // Récupérer les tags
      const { data: tagsData } = await adminClient
        .from('etablissement_tags')
        .select(`
          tag:tags (
            id,
            name,
            slug
          )
        `)
        .eq('establishment_id', establishment.id);

      // Récupérer les événements
      const { data: events } = await adminClient
        .from('events')
        .select('id, title, description, start_date, end_date, price, max_capacity, created_at')
        .eq('establishment_id', establishment.id)
        .order('start_date', { ascending: true });

      // Enrichir l'établissement avec les données supplémentaires
      establishment = {
        ...establishment,
        images: images || [],
        tags: (tagsData || []).map((et: any) => ({
          id: et.tag?.id,
          name: et.tag?.name,
          slug: et.tag?.slug,
        })),
        events: events || [],
      };
    }

    // Transformer les données pour correspondre au format attendu par DashboardContent
    const transformedProfessional = {
      id: professional.id,
      email: professional.email,
      firstName: professional.first_name,
      lastName: professional.last_name,
      phone: professional.phone,
      siret: professional.siret,
      companyName: professional.company_name,
      subscriptionPlan: professional.subscription_plan,
    };

    const transformedEstablishment = {
      id: establishment.id,
      name: establishment.name,
      slug: establishment.slug,
      description: establishment.description,
      address: establishment.address,
      city: establishment.city,
      phone: establishment.phone,
      email: establishment.email,
      website: establishment.website,
      instagram: establishment.instagram,
      facebook: establishment.facebook,
      tiktok: establishment.tiktok,
      youtube: establishment.youtube,
      imageUrl: establishment.image_url,
      status: establishment.status,
      subscription: establishment.subscription,
      rejectionReason: establishment.rejection_reason,
      rejectedAt: establishment.rejected_at,
      lastModifiedAt: establishment.last_modified_at,
      viewsCount: establishment.views_count,
      clicksCount: establishment.clicks_count,
      avgRating: establishment.avg_rating,
      totalComments: establishment.total_comments,
      createdAt: establishment.created_at,
      updatedAt: establishment.updated_at,
      images: (establishment.images || []).map((img: any) => ({
        id: img.id,
        url: img.url,
        isPrimary: img.is_primary,
        ordre: img.ordre,
        createdAt: img.created_at,
      })),
      tags: (establishment.tags || []).map((et: any) => ({
        id: et.tag?.id,
        name: et.tag?.name,
        slug: et.tag?.slug,
      })),
      events: (establishment.events || []).map((ev: any) => ({
        id: ev.id,
        title: ev.title,
        description: ev.description,
        startDate: ev.start_date,
        endDate: ev.end_date,
        price: ev.price,
        maxCapacity: ev.max_capacity,
        createdAt: ev.created_at,
      })),
    };

    const transformedUser = {
      id: user.id,
      email: user.email,
      firstName: professional.first_name,
      lastName: professional.last_name,
      role: 'pro',
      userType: 'professional',
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardContent 
          user={transformedUser as any} 
          establishment={transformedEstablishment as any}
          professional={transformedProfessional as any}
        />
      </div>
    );
  } catch (error) {
    console.error('Erreur dans DashboardPage:', error);
    redirect('/auth?error=ServerError');
  }
}

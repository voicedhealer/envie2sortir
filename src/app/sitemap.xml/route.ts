import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Force le rendu dynamique pour éviter les erreurs de cookies au build
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Utilisation d'un client standard (pas de cookies/session)
    // Utilise la clé ANON publique (suffisant pour lire des données publiques)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 1. Récupérer les établissements approuvés
    const { data: establishments, error: establishmentsError } = await supabase
      .from('establishments')
      .select('slug, updated_at')
      .eq('status', 'approved')
      .order('updated_at', { ascending: false });

    if (establishmentsError) {
      console.error('Sitemap Error (establishments):', establishmentsError);
    }

    // 2. Récupérer les événements actifs (non terminés)
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, updated_at')
      .gte('end_date', new Date().toISOString())
      .order('updated_at', { ascending: false });

    if (eventsError) {
      console.error('Sitemap Error (events):', eventsError);
    }

    // Configuration de base
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://envie2sortir.fr';
    const currentDate = new Date().toISOString();

    // Début du XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

    // 3. Pages statiques principales
    const staticPages = [
      { url: '/recherche', priority: '0.8', freq: 'daily' },
      { url: '/carte', priority: '0.8', freq: 'weekly' },
      { url: '/etablissements', priority: '0.9', freq: 'daily' },
      { url: '/a-propos', priority: '0.5', freq: 'monthly' },
      { url: '/contact', priority: '0.5', freq: 'monthly' }
    ];

    staticPages.forEach(page => {
      sitemap += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.freq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    // 4. URLs dynamiques des Établissements
    (establishments || []).forEach(est => {
      // Fallback si updated_at est manquant
      const date = est.updated_at ? new Date(est.updated_at).toISOString() : currentDate;
      sitemap += `
  <url>
    <loc>${baseUrl}/etablissements/${est.slug}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    // 5. URLs dynamiques des Événements
    (events || []).forEach(evt => {
      const date = evt.updated_at ? new Date(evt.updated_at).toISOString() : currentDate;
      sitemap += `
  <url>
    <loc>${baseUrl}/evenements/${evt.id}</loc>
    <lastmod>${date}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    // Fin du XML
    sitemap += `\n</urlset>`;

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        // Cache d'une heure pour soulager la DB
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', 
      },
    });

  } catch (error) {
    console.error('FATAL Error generating sitemap:', error);
    
    // Sitemap de secours minimal en cas de crash complet
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://envie2sortir.fr';
    const minimalSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new NextResponse(minimalSitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'no-store', // Pas de cache en cas d'erreur
      },
    });
  }
}

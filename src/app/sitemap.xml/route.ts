import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { metadataGenerator } from '@/lib/seo/metadata-generator';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Récupérer tous les établissements approuvés avec leurs slugs
    const { data: establishments, error: establishmentsError } = await supabase
      .from('establishments')
      .select('id, slug, updated_at')
      .eq('status', 'approved')
      .order('updated_at', { ascending: false });

    if (establishmentsError) {
      console.error('Erreur récupération établissements pour sitemap:', establishmentsError);
    }

    // Récupérer tous les événements actifs
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, updated_at')
      .gte('end_date', new Date().toISOString())
      .order('updated_at', { ascending: false });

    if (eventsError) {
      console.error('Erreur récupération événements pour sitemap:', eventsError);
    }

    // Générer le sitemap avec les slugs pour les établissements
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://envie2sortir.fr';
    const currentDate = new Date().toISOString();

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

    // Pages statiques
    const staticPages = [
      { url: '/recherche', priority: '0.8' },
      { url: '/carte', priority: '0.8' },
      { url: '/etablissements', priority: '0.9' },
      { url: '/a-propos', priority: '0.5' },
      { url: '/contact', priority: '0.5' }
    ];

    staticPages.forEach(page => {
      sitemap += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
    });

    // Établissements (utiliser slug au lieu de id)
    (establishments || []).forEach(est => {
      sitemap += `
  <url>
    <loc>${baseUrl}/etablissements/${est.slug}</loc>
    <lastmod>${new Date(est.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
    });

    // Événements
    (events || []).forEach(evt => {
      sitemap += `
  <url>
    <loc>${baseUrl}/evenements/${evt.id}</loc>
    <lastmod>${new Date(evt.updated_at).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.6</priority>
  </url>`;
    });

    sitemap += `
</urlset>`;

    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache 1h
      },
    });
  } catch (error) {
    console.error('Erreur génération sitemap:', error);
    // Retourner un sitemap minimal en cas d'erreur
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://envie2sortir.fr';
    const minimalSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new NextResponse(minimalSitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300, s-maxage=300', // Cache 5min en cas d'erreur
      },
    });
  }
}


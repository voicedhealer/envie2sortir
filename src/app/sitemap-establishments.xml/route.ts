import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://envie2sortir.fr';
    
    // Récupérer tous les établissements approuvés
    const { data: establishments, error: establishmentsError } = await supabase
      .from('establishments')
      .select('slug, updated_at')
      .eq('status', 'approved')
      .order('updated_at', { ascending: false });

    if (establishmentsError) {
      console.error('Erreur récupération établissements pour sitemap:', establishmentsError);
    }

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    (establishments || []).forEach(est => {
      sitemap += `
  <url>
    <loc>${baseUrl}/etablissements/${est.slug}</loc>
    <lastmod>${new Date(est.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
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
    console.error('Erreur génération sitemap établissements:', error);
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    });
  }
}


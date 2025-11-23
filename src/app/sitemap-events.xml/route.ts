import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://envie2sortir.fr';
    
    // Récupérer tous les événements à venir
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id, updated_at')
      .gte('end_date', new Date().toISOString())
      .order('updated_at', { ascending: false });

    if (eventsError) {
      console.error('Erreur récupération événements pour sitemap:', eventsError);
    }

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

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
        'Cache-Control': 'public, max-age=1800, s-maxage=1800', // Cache 30min (événements changent plus souvent)
      },
    });
  } catch (error) {
    console.error('Erreur génération sitemap événements:', error);
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=300, s-maxage=300',
      },
    });
  }
}


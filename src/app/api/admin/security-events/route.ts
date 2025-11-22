import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/supabase/helpers';
import { createClient } from '@/lib/supabase/server';

interface SecurityEvent {
  id: string;
  type: 'failed_login' | 'blocked_request' | 'suspicious_activity' | 'rate_limit_exceeded';
  ip_address: string;
  user_agent?: string;
  email?: string;
  details?: any;
  created_at: string;
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const type = searchParams.get('type');

    // Construire la requête
    let query = supabase
      .from('security_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    // Filtrer par type si fourni
    if (type) {
      query = query.eq('type', type);
    }

    const { data: events, error } = await query;

    if (error) {
      console.error('Erreur lors de la récupération des événements de sécurité:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des événements' },
        { status: 500 }
      );
    }

    // Statistiques globales
    const { data: stats } = await supabase
      .from('security_events')
      .select('type')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const statsByType = {
      failed_login: 0,
      blocked_request: 0,
      suspicious_activity: 0,
      rate_limit_exceeded: 0
    };

    stats?.forEach((event: any) => {
      if (event.type in statsByType) {
        statsByType[event.type as keyof typeof statsByType]++;
      }
    });

    // Top IPs avec le plus d'événements
    const { data: topIPs } = await supabase
      .from('security_events')
      .select('ip_address')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const ipCounts: Record<string, number> = {};
    topIPs?.forEach((event: any) => {
      ipCounts[event.ip_address] = (ipCounts[event.ip_address] || 0) + 1;
    });

    const topIPsList = Object.entries(ipCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([ip, count]) => ({ ip, count }));

    return NextResponse.json({
      events: events || [],
      stats: {
        last24h: statsByType,
        total: events?.length || 0
      },
      topIPs: topIPsList
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des événements de sécurité:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des événements de sécurité' },
      { status: 500 }
    );
  }
}


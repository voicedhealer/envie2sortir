import { NextResponse } from 'next/server';
import { metadataGenerator } from '@/lib/seo/metadata-generator';

export async function GET() {
  const robotsTxt = metadataGenerator.generateRobotsTxt();
  
  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache 24h
    },
  });
}


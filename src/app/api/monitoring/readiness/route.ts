import { NextRequest, NextResponse } from 'next/server';
import { createHealthChecker } from '@/lib/monitoring/health-check';

const healthChecker = createHealthChecker();

export async function GET(request: NextRequest) {
  try {
    const isReady = await healthChecker.isReady();
    
    const response = {
      status: isReady ? 'ready' : 'not_ready',
      timestamp: Date.now(),
      checks: await healthChecker.performHealthCheck()
    };

    return NextResponse.json(response, { 
      status: isReady ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'not_ready',
        error: 'Readiness check failed',
        timestamp: Date.now()
      },
      { 
        status: 503,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    );
  }
}

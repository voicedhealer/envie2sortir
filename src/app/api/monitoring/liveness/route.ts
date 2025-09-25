import { NextRequest, NextResponse } from 'next/server';
import { createHealthChecker } from '@/lib/monitoring/health-check';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const healthChecker = createHealthChecker(prisma);

export async function GET(request: NextRequest) {
  try {
    const isAlive = await healthChecker.isAlive();
    
    const response = {
      status: isAlive ? 'alive' : 'dead',
      timestamp: Date.now(),
      uptime: process.uptime()
    };

    return NextResponse.json(response, { 
      status: isAlive ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'dead',
        error: 'Liveness check failed',
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

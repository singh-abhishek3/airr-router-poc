import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'airr-router-poc',
    timestamp: new Date().toISOString(),
  });
}

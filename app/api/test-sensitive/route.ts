import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // For now, skip telemetry to test basic functionality
    console.log('Received sensitive data test request');
    
    return NextResponse.json(
      {
        message: 'Data received',
        processed: true,
        requestId: request.headers.get('x-request-id') || 'unknown',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Test sensitive error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
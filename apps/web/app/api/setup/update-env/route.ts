import { NextRequest, NextResponse } from 'next/server';
import { updateEnvironmentVariable } from '@/app/actions/setup';

export async function POST(request: NextRequest) {
  try {
    const { key, value } = await request.json();
    
    if (!key) {
      return NextResponse.json(
        { error: 'Missing required parameter: key' },
        { status: 400 }
      );
    }
    
    const result = await updateEnvironmentVariable(key, value);
    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message?.includes('only available in development mode')) {
      return NextResponse.json(
        { error: 'Setup is only available in development mode' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to update environment variable' },
      { status: 500 }
    );
  }
}
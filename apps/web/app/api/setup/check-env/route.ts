import { NextResponse } from 'next/server';
import { checkEnvironment } from '@/app/actions/setup';

export async function GET() {
  try {
    const result = await checkEnvironment();
    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message?.includes('only available in development mode')) {
      return NextResponse.json(
        { error: 'Setup is only available in development mode' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to check environment' },
      { status: 500 }
    );
  }
}
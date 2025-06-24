import { NextResponse } from 'next/server';
import { generateEnvTemplateFile } from '@/app/actions/setup';

export async function POST() {
  try {
    const result = await generateEnvTemplateFile();
    
    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 500 });
    }
  } catch (error: any) {
    console.error('Generate template file error:', error);
    if (error.message?.includes('only available in development mode')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Setup is only available in development mode' 
        },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || 'Failed to generate template file' 
      },
      { status: 500 }
    );
  }
}
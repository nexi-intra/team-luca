import { NextResponse } from 'next/server';
import { generateEnvTemplateFile } from '@/app/actions/setup';

export async function GET() {
  try {
    const result = await generateEnvTemplateFile();
    if (!result.success) {
      throw new Error(result.message);
    }
    const template = result.content;
    return new NextResponse(template, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'attachment; filename=.env.local.template'
      }
    });
  } catch (error: any) {
    console.error('Generate template error:', error);
    if (error.message?.includes('only available in development mode')) {
      return NextResponse.json(
        { error: 'Setup is only available in development mode' },
        { status: 403 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to generate template' },
      { status: 500 }
    );
  }
}
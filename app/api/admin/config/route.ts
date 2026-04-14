import { NextRequest, NextResponse } from 'next/server';
import { updatePipelineConfig } from '@/lib/admin/config-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { isAutoPilotEnabled } = body;

    if (typeof isAutoPilotEnabled !== 'boolean') {
      return NextResponse.json({ error: 'Invalid config value' }, { status: 400 });
    }

    await updatePipelineConfig({ isAutoPilotEnabled });

    return NextResponse.json({
      success: true,
      message: `AutoPilot ${isAutoPilotEnabled ? 'enabled' : 'disabled'}`,
    });
  } catch (error: any) {
    console.error('Admin Config API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

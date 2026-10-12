import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: 'META_CONFIG' }
    });

    if (config && config.value) {
      const data = JSON.parse(config.value);
      return NextResponse.json({ 
        connected: true, 
        connected_at: data.connected_at || config.updatedAt,
        token_active: true
      });
    }
  } catch (error) {
    return NextResponse.json({ connected: false });
  }
  return NextResponse.json({ connected: false });
}

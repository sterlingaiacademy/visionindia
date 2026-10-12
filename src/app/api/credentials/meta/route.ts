import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const isAdmin = req.cookies.get('is_admin')?.value === 'true';
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { metaAppId, metaAppSecret } = await req.json();

    if (metaAppId) {
      await prisma.systemConfig.upsert({
        where: { key: 'META_APP_ID' },
        update: { value: metaAppId },
        create: { key: 'META_APP_ID', value: metaAppId },
      });
    }

    if (metaAppSecret) {
      await prisma.systemConfig.upsert({
        where: { key: 'META_APP_SECRET' },
        update: { value: metaAppSecret },
        create: { key: 'META_APP_SECRET', value: metaAppSecret },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const isAdmin = req.cookies.get('is_admin')?.value === 'true';
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const appId = await prisma.systemConfig.findUnique({ where: { key: 'META_APP_ID' } });
    const appSecret = await prisma.systemConfig.findUnique({ where: { key: 'META_APP_SECRET' } });
    
    return NextResponse.json({ 
      metaAppId: appId?.value || '',
      hasAppSecret: !!appSecret?.value
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const SENSITIVE_KEYS = ['META_APP_SECRET', 'ELEVENLABS_API_KEY'];

export async function POST(req: NextRequest) {
  const isAdmin = req.cookies.get('is_admin')?.value === 'true';
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const configs = await req.json(); // e.g. { META_APP_ID: "123", ELEVENLABS_API_KEY: "abc" }
    
    for (const [key, value] of Object.entries(configs)) {
      if (value && typeof value === 'string') {
        // Skip updating if it's the mask string
        if (value === "********") continue;

        await prisma.systemConfig.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      }
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
    const configs = await prisma.systemConfig.findMany();
    const result: Record<string, string> = {};
    
    for (const config of configs) {
      if (SENSITIVE_KEYS.includes(config.key)) {
        result[config.key] = config.value ? "********" : "";
      } else {
        result[config.key] = config.value;
      }
    }
    
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

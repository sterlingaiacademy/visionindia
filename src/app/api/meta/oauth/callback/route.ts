import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  
  if (!code) {
    return NextResponse.redirect(new URL('/dashboard/campaigns?error=no_code', req.url));
  }

  try {
    const appIdConfig = await prisma.systemConfig.findUnique({ where: { key: 'META_APP_ID' } });
    const appSecretConfig = await prisma.systemConfig.findUnique({ where: { key: 'META_APP_SECRET' } });
    
    const appId = appIdConfig?.value;
    const appSecret = appSecretConfig?.value;

    if (!appId || !appSecret) {
      return NextResponse.redirect(new URL('/dashboard/campaigns?error=missing_credentials', req.url));
    }

    const redirectUri = `${new URL(req.url).origin}/api/meta/oauth/callback`;

    const tokenRes = await fetch(`https://graph.facebook.com/v25.0/oauth/access_token?client_id=${appId}&redirect_uri=${redirectUri}&client_secret=${appSecret}&code=${code}`);
    const tokenData = await tokenRes.json();

    if (tokenData.access_token) {
      const configValue = JSON.stringify({
        access_token: tokenData.access_token,
        connected_at: new Date().toISOString()
      });

      await prisma.systemConfig.upsert({
        where: { key: 'META_CONFIG' },
        update: { value: configValue },
        create: { key: 'META_CONFIG', value: configValue }
      });
    }

    return NextResponse.redirect(new URL('/dashboard/campaigns?connected=true', req.url));
  } catch (error) {
    console.error("Meta OAuth Error:", error);
    return NextResponse.redirect(new URL('/dashboard/campaigns?error=auth_failed', req.url));
  }
}

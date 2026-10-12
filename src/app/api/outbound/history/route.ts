import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const HISTORY_FILE = path.join(process.cwd(), 'campaign_history.json');

export async function GET(req: NextRequest) {
  const isAdmin = req.cookies.get('is_admin')?.value === 'true';
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    if (!fs.existsSync(HISTORY_FILE)) {
       return NextResponse.json([]);
    }
    const raw = fs.readFileSync(HISTORY_FILE, 'utf8');
    return NextResponse.json(JSON.parse(raw));
  } catch (_) {
    return NextResponse.json([]);
  }
}

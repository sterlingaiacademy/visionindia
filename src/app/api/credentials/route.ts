import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: NextRequest) {
  // Auth check — only logged-in admins can change credentials
  const isAdmin = req.cookies.get('is_admin')?.value === 'true';
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, error: "Username and password required" }, { status: 400 });
    }

    const credPath = path.join(process.cwd(), 'credentials.json');
    
    const newCreds = {
      username: username,
      password: password
    };

    fs.writeFileSync(credPath, JSON.stringify(newCreds, null, 2), 'utf8');

    return NextResponse.json({ success: true, message: "Credentials updated successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

function hashPassword(password: string) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    const inputUser = (username || "").trim();
    const inputPass = (password || "").trim();

    // 1. Initial Migration Logic: If DB is empty, create first user
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      let defaultUser = "admin";
      let defaultPass = "visionindia";
      
      const credPath = path.join(process.cwd(), 'credentials.json');
      if (fs.existsSync(credPath)) {
        try {
          const creds = JSON.parse(fs.readFileSync(credPath, 'utf8'));
          if (creds.username) defaultUser = creds.username.trim();
          if (creds.password) defaultPass = creds.password.trim();
          // Optionally delete the file here, but keeping it for safety during migration is fine
        } catch(e) {}
      }

      await prisma.user.create({
        data: {
          username: defaultUser,
          passwordHash: hashPassword(defaultPass),
          role: "admin"
        }
      });
    }

    // 2. Validate User
    const user = await prisma.user.findUnique({
      where: { username: inputUser }
    });

    if (user && user.passwordHash === hashPassword(inputPass)) {
      const response = NextResponse.json({ success: true });
      response.cookies.set("is_admin", "true", {
        httpOnly: true,
        secure: false, // set to true when behind HTTPS
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 // 24 hours
      });
      return response;
    } else {
      console.log(`[Login Failed] Attempted login for user: ${inputUser}`);
      return NextResponse.json({ success: false, error: "Invalid credentials" }, { status: 401 });
    }
  } catch (error: any) {
    console.error("Login Error Details:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

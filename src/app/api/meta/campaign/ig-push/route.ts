import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const CONFIG_FILE = path.join(process.cwd(), 'meta_config.json');

export async function POST(req: NextRequest) {
  try {
    if (!fs.existsSync(CONFIG_FILE)) {
      return NextResponse.json({ error: "Meta account not connected." }, { status: 401 });
    }
    
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    const token = config.access_token;
    
    if (!token) {
      return NextResponse.json({ error: "Invalid Access Token." }, { status: 401 });
    }

    const body = await req.json();
    const { caption, imageUrl } = body;

    // TODO: In production, Instagram Graph API requires:
    // 1. Fetch Instagram Account ID using the token
    // 2. POST /{ig-user-id}/media to create a container
    // 3. POST /{ig-user-id}/media_publish to publish the container

    console.log("Mock Instagram Post initiated with caption:", caption);

    return NextResponse.json({ 
      success: true, 
      message: "Instagram post successfully scheduled!" 
    });

  } catch (error) {
    console.error("Instagram Push Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DRAFTS_FILE = path.join(process.cwd(), 'meta_drafts.json');

export async function GET() {
  try {
    if (!fs.existsSync(DRAFTS_FILE)) {
      return NextResponse.json({ drafts: [] });
    }
    const data = fs.readFileSync(DRAFTS_FILE, 'utf8');
    return NextResponse.json({ drafts: JSON.parse(data) });
  } catch (error) {
    return NextResponse.json({ drafts: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const draft = await req.json();
    let drafts = [];
    if (fs.existsSync(DRAFTS_FILE)) {
      drafts = JSON.parse(fs.readFileSync(DRAFTS_FILE, 'utf8'));
    }
    
    if (draft.id) {
      const idx = drafts.findIndex((d: any) => d.id === draft.id);
      if (idx >= 0) {
        drafts[idx] = draft;
      } else {
        drafts.push(draft);
      }
    } else {
      draft.id = Date.now().toString();
      drafts.push(draft);
    }

    fs.writeFileSync(DRAFTS_FILE, JSON.stringify(drafts));
    return NextResponse.json({ success: true, draft });
  } catch (error) {
    return NextResponse.json({ error: "Failed to save draft" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    if (fs.existsSync(DRAFTS_FILE)) {
      let drafts = JSON.parse(fs.readFileSync(DRAFTS_FILE, 'utf8'));
      drafts = drafts.filter((d: any) => d.id !== id);
      fs.writeFileSync(DRAFTS_FILE, JSON.stringify(drafts));
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete draft" }, { status: 500 });
  }
}

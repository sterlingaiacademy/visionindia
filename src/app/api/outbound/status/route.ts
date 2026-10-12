import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const STATUS_FILE = path.join(process.cwd(), 'campaign_status.json');
const HISTORY_FILE = path.join(process.cwd(), 'campaign_history.json');

function archiveStatus(current: any) {
  let history = [];
  if (fs.existsSync(HISTORY_FILE)) {
    history = JSON.parse(fs.readFileSync(HISTORY_FILE, 'utf8'));
  }
  const historyItem = {
     id: current.startedAt || Date.now().toString(),
     startedAt: current.startedAt,
     finishedAt: current.finishedAt || new Date().toISOString(),
     total: current.total,
     contacts: current.contacts || []
  };
  history.unshift(historyItem);
  if (history.length > 10) history = history.slice(0, 10);
  fs.writeFileSync(HISTORY_FILE, JSON.stringify(history));
  fs.unlinkSync(STATUS_FILE);
}

export async function GET(req: NextRequest) {
  const isAdmin = req.cookies.get('is_admin')?.value === 'true';
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    if (fs.existsSync(STATUS_FILE)) {
      const raw = fs.readFileSync(STATUS_FILE, 'utf8');
      const data = JSON.parse(raw);
      
      // Auto-archive if done and older than 5 minutes, or just let UI show it until cleared.
      // But user requested "i need the thing to be empty after campagn is finished".
      // If we auto-archive here, they will never see the "done" state if they refresh!
      // Actually, if we archive it right away, the bulk runner won't be able to write to it.
      // Let's archive it only if it has been finished for more than 1 minute, so they have time to see it finish.
      if (data.status === 'done' && data.finishedAt) {
        const finishedTime = new Date(data.finishedAt).getTime();
        if (Date.now() - finishedTime > 60000) {
           archiveStatus(data);
           return NextResponse.json({ status: 'idle', total: 0, current: 0, contacts: [] });
        }
      }
      return NextResponse.json(data);
    }
  } catch (_) {}
  return NextResponse.json({ status: 'idle', total: 0, current: 0, contacts: [] });
}

export async function DELETE(req: NextRequest) {
  const isAdmin = req.cookies.get('is_admin')?.value === 'true';
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    if (fs.existsSync(STATUS_FILE)) {
      const currentRaw = fs.readFileSync(STATUS_FILE, 'utf8');
      const current = JSON.parse(currentRaw);
      if (current.status === 'done' || current.status === 'running') {
        archiveStatus(current);
      } else {
        fs.unlinkSync(STATUS_FILE);
      }
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to clear' }, { status: 500 });
  }
}

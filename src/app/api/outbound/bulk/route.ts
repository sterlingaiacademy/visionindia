import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';

const STATUS_FILE = path.join(process.cwd(), 'campaign_status.json');

const CALL_TIMEOUT_MS = 5 * 60 * 1000;
const POLL_INTERVAL_MS = 2500;
const CALL_CONNECT_WAIT_MS = 3000;
const BETWEEN_CALLS_BUFFER_MS = 2000;

export type ContactStatus = {
  phone: string;
  name: string;
  loanAccount?: string;
  amountDue?: string;
  bankName?: string;
  vehicle?: string;
  context?: string;
  status: 'queued' | 'calling' | 'done' | 'failed' | 'skipped';
  error?: string;
};

export type CampaignStatus = {
  status: 'idle' | 'running' | 'done';
  startedAt?: string;
  finishedAt?: string;
  total: number;
  current: number;
  contacts: ContactStatus[];
};

function writeStatus(data: CampaignStatus) {
  try {
    fs.writeFileSync(STATUS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('[Campaign] Failed to write status:', e);
  }
}

async function waitForLiveKitRoom(roomName: string, phone: string, pythonBaseUrl: string): Promise<'done' | 'timeout' | 'failed'> {
  const deadline = Date.now() + CALL_TIMEOUT_MS;
  const statusBase = pythonBaseUrl.replace(/\/outbound\/?$/, '/status');
  
  await new Promise(r => setTimeout(r, CALL_CONNECT_WAIT_MS));

  while (Date.now() < deadline) {
    try {
      const res = await fetch(`${statusBase}/${encodeURIComponent(roomName)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'ended') {
          console.log(`[Campaign] Room ${roomName} ended for ${phone}.`);
          return 'done';
        } else {
          console.log(`[Campaign] Call to ${phone} active in ${roomName} (Participants: ${data.participant_count})...`);
        }
      } else {
         if (res.status === 404) return 'done';
      }
    } catch (e) {
      console.error(`[Campaign] Polling error for ${roomName}:`, e);
    }
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
  }

  console.warn(`[Campaign] Call to ${phone} timed out after 5 minutes`);
  return 'timeout';
}

async function processBulkCampaign(contacts: ContactStatus[], pythonUrl: string, agentId: string) {
  const state: CampaignStatus = {
    status: 'running',
    startedAt: new Date().toISOString(),
    total: contacts.length,
    current: 0,
    contacts: contacts.map(c => ({ ...c, status: 'queued' })),
  };
  writeStatus(state);

  for (let i = 0; i < contacts.length; i++) {
    state.current = i;
    state.contacts[i].status = 'calling';
    writeStatus(state);

    const contact = state.contacts[i];

    if (!contact.phone) {
      contact.status = 'skipped';
      contact.error = 'No phone number';
      writeStatus(state);
      continue;
    }

    const safePhone = contact.phone.replace(/[^\d+]/g, '');
    const callId = randomUUID();

    try {
      const payload = {
        phone: safePhone,
        agent_id: agentId,
        call_id: callId,
        conversation_variables: {
          customer_name: contact.name,
          loan_account: contact.loanAccount || "",
          amount_due: contact.amountDue || "",
          bank_nbfc: contact.bankName || "",
          vehicle: contact.vehicle || "",
          context: contact.context || "",
          Direction: 'Outbound',
          direction: 'Outbound',
          phone: safePhone,
          call_id: callId
        },
      };

      console.log(`[Campaign] (${i + 1}/${contacts.length}) Calling ${safePhone} (${contact.name})...`);

      const response = await fetch(pythonUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        contact.status = 'failed';
        contact.error = `Engine error ${response.status}: ${errorText}`;
        writeStatus(state);
        continue;
      }
      
      const resultData = await response.json();
      const roomName = resultData.room_name;

      if (roomName) {
        const result = await waitForLiveKitRoom(roomName, safePhone, pythonUrl);
        if (result === 'done') {
          contact.status = 'done';
        } else if (result === 'timeout') {
          contact.status = 'done';
          contact.error = 'Completed (5-min timeout reached)';
        } else {
          contact.status = 'failed';
          contact.error = 'Call ended unsuccessfully';
        }
      } else {
         contact.status = 'done';
         contact.error = 'Warning: No room tracking available';
         await new Promise(r => setTimeout(r, 60000));
      }
    } catch (e: any) {
      contact.status = 'failed';
      contact.error = e.message || 'Unknown error';
    }

    writeStatus(state);

    if (i < contacts.length - 1) {
      await new Promise(r => setTimeout(r, BETWEEN_CALLS_BUFFER_MS));
    }
  }

  state.status = 'done';
  state.finishedAt = new Date().toISOString();
  state.current = contacts.length;
  writeStatus(state);
  console.log('[Campaign] All done!');
}

export async function POST(req: NextRequest) {
  const isAdmin = req.cookies.get('is_admin')?.value === 'true';
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { contacts } = await req.json();

    const pyConfig = await prisma.systemConfig.findUnique({ where: { key: 'PYTHON_SERVER_URL' } });
    const agentConfig = await prisma.systemConfig.findUnique({ where: { key: 'ELEVENLABS_AGENT_ID' } });
    
    // Fallback to process.env
    const pythonUrl = pyConfig?.value || process.env.PYTHON_SERVER_URL || "http://localhost:8080/outbound";
    const agentId = agentConfig?.value || process.env.ELEVENLABS_AGENT_ID || "";

    if (!contacts || !Array.isArray(contacts)) {
      return NextResponse.json({ error: 'Invalid contacts list' }, { status: 400 });
    }
    if (contacts.length > 500) {
      return NextResponse.json({ error: 'Maximum 500 contacts per campaign' }, { status: 400 });
    }

    try {
      const existing: CampaignStatus = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
      if (existing.status === 'running') {
        return NextResponse.json({ error: 'A campaign is already running. Wait for it to finish.' }, { status: 409 });
      }
    } catch (_) {}

    const prepared: ContactStatus[] = contacts
      .map((row: any) => ({
        phone: (row.phone || row.Phone || row.PHONE || row.phone_number || row.Phone_Number || '').trim(),
        name: row.customer_name || row.name || row.Name || 'Unknown',
        loanAccount: row.loan_account || row.loan_account_no || row.account_no || row.loan_no || '',
        amountDue: row.amount_due || row.overdue_amount || row.emi_amount || row.amount || '',
        bankName: row.bank_nbfc || row.bank || row.nbfc || row.lender || 'Vision India Financial Solutions',
        vehicle: row.vehicle || row.vehicle_name || row.loan_account || '',
        context: row.context || row.Context || '',
        status: 'queued' as const,
      }))
      .filter((c: ContactStatus) => c.phone !== '');

    if (prepared.length === 0) {
      return NextResponse.json({ error: 'No valid phone numbers found in the list' }, { status: 400 });
    }

    processBulkCampaign(prepared, pythonUrl, agentId);

    return NextResponse.json({
      success: true,
      message: `Sequential campaign started for ${prepared.length} contacts. Calling one at a time.`,
      total: prepared.length,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const isAdmin = req.cookies.get('is_admin')?.value === 'true';
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await req.json();
    
    // Fetch configs with process.env fallback
    const pyConfig = await prisma.systemConfig.findUnique({ where: { key: 'PYTHON_SERVER_URL' } });
    const agentConfig = await prisma.systemConfig.findUnique({ where: { key: 'ELEVENLABS_AGENT_ID' } });
    
    const PYTHON_SERVER_URL = pyConfig?.value || process.env.PYTHON_SERVER_URL || "http://localhost:8080/outbound";
    const AGENT_ID = agentConfig?.value || process.env.ELEVENLABS_AGENT_ID || "";

    if (data.phone) data.phone = data.phone.replace(/[^\d+]/g, '');

    const callId = randomUUID();
    data.call_id = callId;
    if (!data.conversation_variables) data.conversation_variables = {};
    data.conversation_variables.Direction = "Outbound";
    data.conversation_variables.direction = "Outbound";
    data.conversation_variables.call_id = callId;
    
    if (!data.agent_id) {
      data.agent_id = AGENT_ID;
    }

    const response = await fetch(PYTHON_SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Engine Server Error: ${errorText}` }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json(result);

  } catch (error: any) {
    console.error("[Outbound] Error:", error);
    return NextResponse.json({ error: "Could not connect to Voice Engine. Ensure it is running." }, { status: 500 });
  }
}

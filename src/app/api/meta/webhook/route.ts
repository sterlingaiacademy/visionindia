import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const VERIFY_TOKEN = "visionindia_secure_webhook_token_2026";

// Handles Meta Webhook Verification
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return new NextResponse(challenge, { status: 200 });
    } else {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }
  return new NextResponse('Bad Request', { status: 400 });
}

// Handles incoming WhatsApp messages/clicks
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry) {
        for (const change of entry.changes) {
          if (change.value && change.value.messages) {
            for (const message of change.value.messages) {
              const customerPhone = message.from;
              const contactInfo = change.value.contacts?.find((c: any) => c.wa_id === customerPhone);
              const customerName = contactInfo?.profile?.name || "Unknown WhatsApp User";

              let replyText = "Clicked Ad";
              if (message.type === 'button') {
                 replyText = message.button.text;
              } else if (message.type === 'text') {
                 replyText = message.text.body;
              }

              console.log(`[LEAD CAPTURED] ${customerName} (${customerPhone}) replied: ${replyText}`);

              // Save to our real SQLite DB
              await prisma.webhookLead.create({
                data: {
                  name: customerName,
                  phone: `+${customerPhone}`,
                  status: replyText
                }
              });
            }
          }
        }
      }
    }
    return new NextResponse('EVENT_RECEIVED', { status: 200 });
  } catch (error) {
    console.error("Webhook Error:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

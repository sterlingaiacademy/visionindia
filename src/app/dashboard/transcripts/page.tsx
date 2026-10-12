import { TranscriptsListClient } from "@/components/TranscriptsListClient";
import { prisma } from "@/lib/prisma";

export const revalidate = 0; // Disable caching

async function getConversations() {
  const agentConfig = await prisma.systemConfig.findUnique({ where: { key: 'ELEVENLABS_AGENT_ID' } });
  const apiConfig = await prisma.systemConfig.findUnique({ where: { key: 'ELEVENLABS_API_KEY' } });
  
  const AGENT_ID = agentConfig?.value || process.env.ELEVENLABS_AGENT_ID || "";
  const API_KEY = apiConfig?.value || process.env.ELEVENLABS_API_KEY || "";

  if (!API_KEY) return [];

  // Try with specific agent_id if configured
  if (AGENT_ID && AGENT_ID.trim() !== "") {
    try {
      const res = await fetch(`https://api.elevenlabs.io/v1/convai/conversations?agent_id=${AGENT_ID.trim()}`, {
        headers: { "xi-api-key": API_KEY },
        cache: "no-store"
      });
      if (res.ok) {
        const data = await res.json();
        return data.conversations || [];
      }
    } catch (e) {
      console.warn("Failed fetching with agent_id, falling back to all conversations", e);
    }
  }

  // Fallback: fetch all conversations for this ElevenLabs account
  try {
    const res = await fetch("https://api.elevenlabs.io/v1/convai/conversations", {
      headers: { "xi-api-key": API_KEY },
      cache: "no-store"
    });
    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Failed to fetch conversations from AI Engine: ${res.statusText || res.status}`);
    }
    const data = await res.json();
    return data.conversations || [];
  } catch (e: any) {
    throw new Error(e.message || "Failed to fetch conversations from AI Engine");
  }
}

async function getTranscript(convId: string) {
  const apiConfig = await prisma.systemConfig.findUnique({ where: { key: 'ELEVENLABS_API_KEY' } });
  const API_KEY = apiConfig?.value || process.env.ELEVENLABS_API_KEY || "";

  if (!API_KEY) return null;

  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${convId}`, {
      headers: { "xi-api-key": API_KEY },
      cache: "no-store"
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function TranscriptsPage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id: selectedId } = await searchParams;
  let conversations: any[] = [];
  let error = null;

  try {
    conversations = await getConversations();
    // Default sort
    conversations.sort((a: any, b: any) => (b.start_time_unix_secs || 0) - (a.start_time_unix_secs || 0));
  } catch (e: any) {
    error = e.message;
  }

  let selectedData = null;
  if (selectedId) {
    selectedData = await getTranscript(selectedId);
  }

  return (
    <TranscriptsListClient 
      conversations={conversations} 
      selectedId={selectedId} 
      selectedData={selectedData} 
      error={error} 
    />
  );
}

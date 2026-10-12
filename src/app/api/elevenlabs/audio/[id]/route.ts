import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const config = await prisma.systemConfig.findUnique({ where: { key: 'ELEVENLABS_API_KEY' } });
    const API_KEY = config?.value || process.env.ELEVENLABS_API_KEY || "";

    const response = await fetch(`https://api.elevenlabs.io/v1/convai/conversations/${id}/audio`, {
      headers: {
        "xi-api-key": API_KEY,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch audio from AI Engine" }, { status: response.status });
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Audio Fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

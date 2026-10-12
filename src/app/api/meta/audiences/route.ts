import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const audiences = await prisma.audience.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    // Convert numbers string back to array for the frontend
    const formatted = audiences.map(a => ({
      ...a,
      numbers: a.numbers ? a.numbers.split(',') : []
    }));
    
    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: "Failed to read audiences" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, numbers } = await req.json();
    
    const parsedNumbers = numbers
      .split('\n')
      .map((n: string) => n.trim().replace(/[^0-9]/g, ''))
      .filter((n: string) => n.length > 5)
      .join(',');

    const newAudience = await prisma.audience.create({
      data: {
        name,
        numbers: parsedNumbers
      }
    });

    return NextResponse.json({ success: true, audience: {
      ...newAudience,
      numbers: newAudience.numbers ? newAudience.numbers.split(',') : []
    }});
  } catch (error) {
    return NextResponse.json({ error: "Failed to save audience" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, name, numbers } = await req.json();
    
    const parsedNumbers = numbers
      .split('\n')
      .map((n: string) => n.trim().replace(/[^0-9]/g, ''))
      .filter((n: string) => n.length > 5)
      .join(',');

    await prisma.audience.update({
      where: { id },
      data: { name, numbers: parsedNumbers }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    await prisma.audience.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

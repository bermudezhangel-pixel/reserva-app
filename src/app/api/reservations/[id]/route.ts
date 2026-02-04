import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    if (!id) return NextResponse.json({ error: "ID no encontrado" }, { status: 400 });

    const updated = await prisma.reservation.update({
      where: { id: id },
      data: { status: status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("ERROR EN DB:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
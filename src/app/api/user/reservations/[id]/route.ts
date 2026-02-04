import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { status } = await req.json(); 

    const updated = await prisma.reservation.update({
      where: { id },
      data: { status: status } // status debe ser PENDING, CONFIRMED o CANCELLED
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error en PATCH:", error);
    return NextResponse.json({ error: "No se pudo actualizar" }, { status: 500 });
  }
}
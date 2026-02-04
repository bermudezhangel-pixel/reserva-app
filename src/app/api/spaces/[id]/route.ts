import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Esperamos a la promesa del ID
    const body = await req.json();
    
    const updated = await prisma.space.update({
      where: { id },
      data: body
    });
    
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // Esperamos a la promesa del ID
    await prisma.space.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error al eliminar" }, { status: 500 });
  }
}
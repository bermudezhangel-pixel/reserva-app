import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// EDITAR ESPACIO
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updatedSpace = await prisma.space.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        capacity: parseInt(body.capacity),
        pricePerHour: parseFloat(body.pricePerHour),
        // CORRECCIÓN CRÍTICA:
        // Si viene 'images' (array) lo usamos.
        // Si viene 'image' (string del admin viejo), lo convertimos en array [body.image]
        images: body.images ? body.images : (body.image ? [body.image] : []), 
        equipment: body.equipment
      }
    });

    return NextResponse.json(updatedSpace);
  } catch (error) {
    return NextResponse.json({ error: "Error actualizando espacio" }, { status: 500 });
  }
}

// BORRAR ESPACIO (Este no cambia, pero te lo dejo completo por si acaso)
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.reservation.deleteMany({ where: { spaceId: id }});
    await prisma.space.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error eliminando espacio" }, { status: 500 });
  }
}
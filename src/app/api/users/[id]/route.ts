import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client'; // Importante para TS

// EDITAR USUARIO
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Validamos que el rol sea válido (si se envía)
    let roleToUpdate = undefined;
    if (body.role && Object.values(Role).includes(body.role as Role)) {
      roleToUpdate = body.role as Role;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        role: roleToUpdate, // Solo actualiza si es válido
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error actualizando" }, { status: 500 });
  }
}

// ELIMINAR USUARIO
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    // Primero borramos sus reservas para evitar errores de llave foránea
    await prisma.reservation.deleteMany({ where: { userId: id }});
    
    // Luego el usuario
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error eliminando" }, { status: 500 });
  }
}
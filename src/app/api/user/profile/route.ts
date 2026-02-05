import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    return NextResponse.json(user || {});
  } catch (error) {
    return NextResponse.json({ error: "Error obteniendo perfil" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { email, name, phone, address } = body;

    if (!email) {
      return NextResponse.json({ error: "Email requerido para actualizar" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: {
        name,
        phone,
        address // Ahora que corriste 'prisma generate', esto ya no dará error
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    return NextResponse.json({ error: "Error actualizando perfil" }, { status: 500 });
  }
}
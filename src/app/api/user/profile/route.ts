import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// OBTENER PERFIL
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  if (!email) return NextResponse.json({ error: "Email requerido" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email } });
  return NextResponse.json(user);
}

// ACTUALIZAR PERFIL
export async function PUT(req: Request) {
  const body = await req.json();
  const { email, ...data } = body;
  
  const updatedUser = await prisma.user.update({
    where: { email },
    data: data
  });

  return NextResponse.json(updatedUser);
}
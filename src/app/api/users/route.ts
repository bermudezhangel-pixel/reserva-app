import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client'; // <--- IMPORTANTE: Importar el Enum

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: { reservations: true }
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const existing = await prisma.user.findUnique({ where: { email: body.email }});
    if (existing) return NextResponse.json({ error: "El email ya existe" }, { status: 400 });

    // Convertimos el string que llega (ej: "ADMIN") al tipo Role
    const userRole = (body.role && Object.values(Role).includes(body.role as Role)) 
      ? (body.role as Role) 
      : Role.USER;

    const newUser = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        role: userRole, // Ahora TypeScript sabe que esto es seguro
      }
    });
    return NextResponse.json(newUser);
  } catch (error) {
    console.error(error); // Agregamos log para ver el error real si falla
    return NextResponse.json({ error: "Error creando usuario" }, { status: 500 });
  }
}
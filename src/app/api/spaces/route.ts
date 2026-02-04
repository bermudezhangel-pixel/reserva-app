import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Obtener todos los espacios
export async function GET() {
  const spaces = await prisma.space.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(spaces);
}

// Crear un nuevo espacio
export async function POST(req: Request) {
  const body = await req.json();
  const space = await prisma.space.create({
    data: {
      name: body.name,
      description: body.description,
      capacity: parseInt(body.capacity),
      pricePerHour: parseFloat(body.pricePerHour),
    }
  });
  return NextResponse.json(space);
}

// Editar y Eliminar (Usaremos un endpoint dinámico abajo)
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const spaces = await prisma.space.findMany();
  return NextResponse.json(spaces);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const newSpace = await prisma.space.create({
      data: {
        name: body.name,
        description: body.description || "",
        // Aseguramos conversión de números
        capacity: parseInt(body.capacity),
        pricePerHour: parseFloat(body.pricePerHour),
        image: body.image || "",      
        equipment: body.equipment || "" 
      }
    });
    return NextResponse.json(newSpace);
  } catch (error) {
    console.error("Error creando espacio:", error);
    return NextResponse.json({ error: "Error creando espacio" }, { status: 500 });
  }
}
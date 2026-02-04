import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// [SECCIÓN: CREAR NUEVA RESERVA POR RANGO]
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { spaceId, userEmail, startDate, endDate } = body;

    // 1. Validación estricta para TypeScript
    if (!spaceId || !userEmail || !startDate || !endDate) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    // 2. Buscamos al usuario (Protección contra null)
    let user = await prisma.user.findUnique({ 
      where: { email: userEmail } 
    });

    // 3. Si no existe (por el reset), lo creamos para evitar errores de relación
    if (!user) {
      user = await prisma.user.create({
        data: { 
          email: userEmail, 
          name: "Usuario Temporal" 
        }
      });
    }

    // 4. Creamos la reserva asegurando que los tipos coincidan con el Schema
    const newReservation = await prisma.reservation.create({
      data: {
        spaceId: spaceId,
        userId: user.id, // Ahora estamos seguros de que existe
        userEmail: userEmail,
        userName: user.name || "Cliente Nuevo",
        userPhone: user.phone || "Sin teléfono",
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: 'PENDING',
        startTime: "09:00", 
        endTime: "18:00"
      }
    });

    return NextResponse.json(newReservation);
  } catch (error) {
    console.error("ERROR CRÍTICO AL RESERVAR:", error);
    return NextResponse.json(
      { error: "No se pudo procesar la reserva." }, 
      { status: 500 }
    );
  }
}

// [SECCIÓN: OBTENER TODAS LAS RESERVAS (PARA ADMIN)]
export async function GET() {
  try {
    const reservations = await prisma.reservation.findMany({
      include: { 
        space: true, 
        user: true 
      },
      orderBy: { 
        startDate: 'desc' 
      }
    });
    
    return NextResponse.json(reservations || []);
  } catch (error) {
    console.error("ERROR GET RESERVATIONS:", error);
    return NextResponse.json({ error: "Error al obtener reservas" }, { status: 500 });
  }
}
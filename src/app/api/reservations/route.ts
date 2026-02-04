import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// [SECCIÓN: CREAR NUEVA RESERVA POR RANGO]
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { spaceId, userEmail, startDate, endDate } = body;

    // VALIDACIÓN BÁSICA DE ENTRADA
    if (!spaceId || !userEmail || !startDate || !endDate) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
    }

    // 1. Buscamos al usuario (Protección contra null)
    const user = await prisma.user.findUnique({ 
      where: { email: userEmail } 
    });

    // Si el usuario no existe en la DB (por el reset), lo creamos mínimo con su email
    // para que la reserva no falle
    let finalUserId = user?.id;
    let finalUserName = user?.name || "Cliente Nuevo";
    let finalUserPhone = user?.phone || "Sin teléfono";

    if (!user) {
      const newUser = await prisma.user.create({
        data: { email: userEmail, name: "Usuario Temporal" }
      });
      finalUserId = newUser.id;
    }

    // 2. Creamos la reserva con el nuevo esquema de fechas
    const newReservation = await prisma.reservation.create({
      data: {
        spaceId: spaceId,
        userId: finalUserId,
        userEmail: userEmail,
        userName: finalUserName,
        userPhone: finalUserPhone,
        // Forzamos las fechas a formato ISO para evitar errores de zona horaria
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
      { error: "No se pudo procesar la reserva. Revisa la consola del servidor." }, 
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
    
    // Si no hay nada, devolvemos array vacío en lugar de null para no romper el frontend
    return NextResponse.json(reservations || []);
  } catch (error) {
    console.error("ERROR GET RESERVATIONS:", error);
    return NextResponse.json({ error: "Error al obtener reservas" }, { status: 500 });
  }
}
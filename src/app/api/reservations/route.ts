import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // 1. Recibimos los datos del formulario
    const body = await req.json();
    const { userName, userEmail, userPhone, date } = body;

    // 2. Primero, necesitamos asegurarnos de que exista al menos un "Espacio" en la DB
    // para poder asociar la reserva. Si no hay ninguno, creamos uno por defecto.
    let space = await prisma.space.findFirst();
    
    if (!space) {
      space = await prisma.space.create({
        data: {
          name: "Espacio Principal",
          description: "Sala de reuniones estándar",
          capacity: 10,
          pricePerHour: 25.0
        }
      });
    }

    // 3. Guardamos la reserva en la base de datos de Neon
    const newReservation = await prisma.reservation.create({
      data: {
        spaceId: space.id,
        userName: userName,
        userEmail: userEmail,
        userPhone: userPhone,
        date: new Date(date),
        startTime: "09:00", // Valor por defecto para esta prueba
        endTime: "10:00",   // Valor por defecto para esta prueba
        status: "PENDING"
      }
    });

    // 4. Respondemos al frontend que todo salió bien
    return NextResponse.json(newReservation, { status: 201 });

  } catch (error) {
    console.error("Error en la API:", error);
    return NextResponse.json(
      { error: "Error interno al crear la reserva" }, 
      { status: 500 }
    );
  }
}

// También agregamos un método GET por si quieres listar las reservas luego
export async function GET() {
  try {
    const reservations = await prisma.reservation.findMany({
      include: { space: true }
    });
    return NextResponse.json(reservations);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener reservas" }, { status: 500 });
  }
}
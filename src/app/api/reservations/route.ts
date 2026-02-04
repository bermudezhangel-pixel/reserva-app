import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userName, userEmail, userPhone, date, spaceId } = body;

    // 1. Buscamos al usuario que ya se logueó con el código
    const user = await prisma.user.findUnique({
      where: { email: userEmail }
    });

    // 2. Creamos la reserva vinculada al espacio y al usuario
    const newReservation = await prisma.reservation.create({
      data: {
        spaceId: spaceId,
        userId: user?.id, // Vinculamos el ID del usuario
        userName: userName,
        userEmail: userEmail,
        userPhone: userPhone,
        date: new Date(date),
        startTime: "09:00", 
        endTime: "10:00",
        status: "PENDING"
      }
    });

    return NextResponse.json(newReservation, { status: 201 });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Error al crear reserva" }, { status: 500 });
  }
}

export async function GET() {
  const reservations = await prisma.reservation.findMany({
    include: { space: true, user: true },
    orderBy: { date: 'desc' }
  });
  return NextResponse.json(reservations);
}
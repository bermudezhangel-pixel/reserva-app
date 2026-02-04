import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// [SECCIÓN: OBTENER DÍAS OCUPADOS POR RANGO]
export async function GET(
  req: Request, 
  { params }: { params: Promise<{ spaceId: string }> }
) {
  try {
    const { spaceId } = await params;

    // 1. Buscamos todas las reservas de este espacio que no estén canceladas
    const reservations = await prisma.reservation.findMany({
      where: { 
        spaceId: spaceId,
        status: { not: "CANCELLED" }
      },
      select: { 
        startDate: true, 
        endDate: true 
      }
    });

    // 2. Lógica para expandir los rangos a días individuales para el calendario
    const blockedDates: string[] = [];

    reservations.forEach(res => {
      let current = new Date(res.startDate);
      const end = new Date(res.endDate);

      while (current <= end) {
        const dateString = current.toISOString().split('T')[0];
        if (!blockedDates.includes(dateString)) {
          blockedDates.push(dateString);
        }
        current.setDate(current.getDate() + 1);
      }
    });

    return NextResponse.json(blockedDates);

  } catch (error) {
    console.error("Error en disponibilidad:", error);
    return NextResponse.json([], { status: 500 });
  }
}
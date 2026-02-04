import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ spaceId: string }> }) {
  try {
    const { spaceId } = await params;
    
    const reservations = await prisma.reservation.findMany({
      where: { 
        spaceId: spaceId,
        status: { not: "CANCELLED" } // No bloqueamos si la reserva fue cancelada
      },
      select: { date: true }
    });
    
    // Devolvemos un array de fechas ocupadas: ["2026-02-10", "2026-02-15"]
    const dates = reservations.map(r => r.date.toISOString().split('T')[0]);
    return NextResponse.json(dates);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}
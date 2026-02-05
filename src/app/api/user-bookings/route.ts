import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    const history = await prisma.reservation.findMany({
      where: { userEmail: email },
      include: { space: true },
      orderBy: { startDate: 'desc' }
    });

    // SANITIZACIÓN: Convertimos las fechas a ISO string para evitar "Invalid Date"
    const safeHistory = history.map(res => ({
      ...res,
      startDate: res.startDate ? new Date(res.startDate).toISOString() : null,
      endDate: res.endDate ? new Date(res.endDate).toISOString() : null,
    }));

    return NextResponse.json(safeHistory);
  } catch (error) {
    console.error("Error historial:", error);
    return NextResponse.json([], { status: 500 });
  }
}
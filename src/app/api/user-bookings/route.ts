import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) return NextResponse.json({ error: "No email" }, { status: 400 });

    const history = await prisma.reservation.findMany({
      where: { userEmail: email },
      include: { space: true },
      // SECCIÓN CORREGIDA: Cambiamos 'date' por 'startDate'
      orderBy: { startDate: 'desc' } 
    });

    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}
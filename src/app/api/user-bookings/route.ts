import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) return NextResponse.json({ error: "Email requerido" }, { status: 400 });

  const history = await prisma.reservation.findMany({
    where: { userEmail: email },
    include: { space: true },
    orderBy: { date: 'desc' }
  });

  return NextResponse.json(history);
}
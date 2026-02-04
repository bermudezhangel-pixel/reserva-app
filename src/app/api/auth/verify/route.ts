import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const { email, otp } = await req.json();

  const user = await prisma.user.findFirst({
    where: { email, otp, otpExpires: { gt: new Date() } }
  });

  if (!user) return NextResponse.json({ error: "Código inválido o expirado" }, { status: 401 });

  // Limpiar el código tras éxito
  await prisma.user.update({ where: { email }, data: { otp: null } });

  return NextResponse.json({ success: true, user: { email: user.email } });
}
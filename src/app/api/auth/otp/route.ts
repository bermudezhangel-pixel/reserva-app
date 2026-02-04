import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Código de 6 dígitos

    // Guardamos o actualizamos el código para este email (válido por 10 min)
    await prisma.user.upsert({
      where: { email },
      update: { otp, otpExpires: new Date(Date.now() + 10 * 60000) },
      create: { email, otp, otpExpires: new Date(Date.now() + 10 * 60000), password: "" }
    });

    // Enviar el correo
    await resend.emails.send({
      from: 'Reservas <onboarding@resend.dev>',
      to: email,
      subject: 'Tu código de acceso',
      html: `<p>Tu código para reservar es: <strong>${otp}</strong></p>`
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Error enviando código" }, { status: 500 });
  }
}
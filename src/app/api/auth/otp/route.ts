import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// Si tienes configurado Resend o Nodemailer, impórtalo aquí.
// Si no, este código imprimirá el OTP en los logs de Vercel.

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    // Generar OTP de 6 dígitos
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Guardar OTP en base de datos
    await prisma.user.upsert({
      where: { email },
      update: { 
        otp, 
        otpExpires: new Date(Date.now() + 10 * 60000) // 10 minutos
      },
      create: { 
        email, 
        otp, 
        otpExpires: new Date(Date.now() + 10 * 60000)
        // password: ""  <-- ESTA ERA LA LÍNEA QUE CAUSABA EL ERROR, YA LA QUITÉ
      }
    });

    // AQUÍ IRÍA TU LÓGICA DE ENVÍO DE EMAIL
    // Por ahora lo dejamos en consola para que no falle el build si no tienes API Key de email
    console.log(`🔐 OTP para ${email}: ${otp}`); 

    /* // Ejemplo si usaras Resend:
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: email,
      subject: 'Tu código de acceso',
      html: `<p>Tu código es: <strong>${otp}</strong></p>`
    });
    */

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error generando OTP:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
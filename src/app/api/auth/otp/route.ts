import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

// Inicializamos Resend con la clave que pusiste en .env
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    // Generar OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Guardar OTP en BD
    await prisma.user.upsert({
      where: { email },
      update: { 
        otp, 
        otpExpires: new Date(Date.now() + 10 * 60000) 
      },
      create: { 
        email, 
        otp, 
        otpExpires: new Date(Date.now() + 10 * 60000),
        role: 'USER' // Por defecto
      }
    });

    // --- ENVIAR EMAIL REAL CON RESEND ---
    try {
      const data = await resend.emails.send({
        // 'onboarding@resend.dev' es el correo de prueba gratis.
        // Solo funciona si envías al MISMO email con el que te registraste en Resend
        // O si verificas tu dominio en Resend (ej: hola@tuempresa.com)
        from: 'onboarding@resend.dev', 
        to: email,
        subject: `Tu código de acceso: ${otp}`,
        html: `
          <div style="font-family: sans-serif; text-align: center; padding: 20px;">
            <h1>🔐 Código de verificación</h1>
            <p>Usa el siguiente código para ingresar:</p>
            <p style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2563eb;">${otp}</p>
            <p>Este código expira en 10 minutos.</p>
          </div>
        `
      });

      console.log("Email enviado ID:", data.data?.id);
    } catch (emailError) {
      console.error("Error enviando email:", emailError);
      // No fallamos la petición para poder ver el log en Vercel si algo sale mal
    }

    // Dejamos el console.log por si acaso necesitas verlo en los logs de Vercel
    console.log(`🔑 OTP BACKUP (Ver en Logs): ${otp}`); 

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error interno:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
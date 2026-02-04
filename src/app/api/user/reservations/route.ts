import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// [SECCIÓN: OBTENER HISTORIAL DE RESERVAS POR USUARIO]
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    // 1. Verificación de seguridad
    if (!email) {
      return NextResponse.json({ error: "Email es requerido" }, { status: 400 });
    }

    // 2. Consulta a la base de datos con los nuevos campos
    const history = await prisma.reservation.findMany({
      where: { 
        userEmail: email 
      },
      include: { 
        space: true // Incluimos info del espacio (nombre, precio, etc.)
      },
      // Usamos startDate porque 'date' fue eliminado en la migración
      orderBy: { 
        startDate: 'desc' 
      }
    });

    // 3. Retornamos los datos (si no hay reservas, history será [])
    return NextResponse.json(history || []);

  } catch (error) {
    console.error("Error crítico en user-bookings API:", error);
    // Retornamos un array vacío en lugar de un error para que el perfil no se rompa
    return NextResponse.json([], { status: 500 });
  }
}
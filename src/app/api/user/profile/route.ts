import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { email, name, phone, company, taxId, billingAddress, billingCity } = body;
    
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { 
        name, 
        phone, 
        company, 
        taxId, 
        billingAddress, 
        billingCity 
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "Error al actualizar perfil" }, { status: 500 });
  }
}
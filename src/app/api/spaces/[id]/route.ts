import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const updated = await prisma.space.update({
    where: { id: params.id },
    data: body
  });
  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await prisma.space.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
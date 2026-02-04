import { prisma } from './prisma.ts';

async function main() {
  // Limpiar datos anteriores (Opcional)
  await prisma.reservation.deleteMany({});
  await prisma.space.deleteMany({});

  // 1. Oficinas (18)
  for (let i = 1; i <= 18; i++) {
    await prisma.space.create({
      data: {
        name: `Oficina ${i}`,
        description: "Espacio privado y profesional",
        capacity: 4,
        pricePerHour: 15.0
      }
    });
  }

  // 2. Sala de Conferencias
  await prisma.space.create({
    data: {
      name: "Sala de Conferencias",
      description: "Sala amplia para eventos y reuniones grandes",
      capacity: 30,
      pricePerHour: 50.0
    }
  });

  // 3. Hot Desks (12)
  for (let i = 1; i <= 12; i++) {
    await prisma.space.create({
      data: {
        name: `Hot Desk ${i}`,
        description: "Puesto de trabajo flexible",
        capacity: 1,
        pricePerHour: 5.0
      }
    });
  }
}

main();
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log("🧹 Limpiando base de datos...");
  await prisma.reservation.deleteMany({});
  await prisma.space.deleteMany({});

  console.log("🏢 Creando 18 Oficinas...");
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

  console.log("🎤 Creando Sala de Conferencias...");
  await prisma.space.create({
    data: {
      name: "Sala de Conferencias",
      description: "Sala amplia para eventos y reuniones grandes",
      capacity: 30,
      pricePerHour: 50.0
    }
  });

  console.log("💻 Creando 12 Hot Desks...");
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
  console.log("✅ ¡Todo creado con éxito!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
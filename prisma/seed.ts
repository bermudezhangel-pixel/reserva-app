const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Limpiando base de datos ---');
  // Borramos reservas y espacios existentes para evitar conflictos
  await prisma.reservation.deleteMany({});
  await prisma.space.deleteMany({});

  const spaces = [
    {
      name: "Salón Principal",
      description: "Espacio amplio para eventos corporativos y conferencias.",
      capacity: 50,
      pricePerHour: 150.0,
    },
    {
      name: "Sala de Juntas A",
      description: "Ideal para reuniones de equipo y presentaciones privadas.",
      capacity: 12,
      pricePerHour: 45.0,
    },
    {
      name: "Espacio Coworking",
      description: "Puestos individuales en área compartida con café incluido.",
      capacity: 20,
      pricePerHour: 15.0,
    },
    {
      name: "Oficina Privada",
      description: "Privacidad total para trabajo enfocado.",
      capacity: 4,
      pricePerHour: 30.0,
    }
  ];

  console.log('--- Cargando Inventario ---');

  for (const space of spaces) {
    const created = await prisma.space.create({
      data: space,
    });
    console.log(`✅ Creado: ${created.name} con ID: ${created.id}`);
  }

  console.log('--- ¡Inventario cargado con éxito! ---');
}

main()
  .catch((e) => {
    console.error("Error en el seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
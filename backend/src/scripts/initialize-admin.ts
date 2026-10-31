import "dotenv/config";
import prisma from "../config/db";

async function initializeAdmin(): Promise<void> {
  const emailArgument = process.argv[2];

  if (!emailArgument || process.argv.length !== 3) {
    throw new Error(
      "Uso: npm run admin:init -- correo@ejemplo.com"
    );
  }

  const email = emailArgument.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("El correo electrónico no es válido");
  }

  const result = await prisma.$transaction(async (tx) => {
    // Serializa las inicializaciones administrativas.
    await tx.$queryRaw`
      SELECT 1 AS locked
      FROM (
        SELECT pg_advisory_xact_lock(7242026, 1)
      ) AS advisory_lock
    `;

    const user = await tx.usuarios.findUnique({
      where: { email },
      select: {
        id_usuario: true,
        rol: true,
      },
    });

    if (!user) {
      throw new Error("El usuario indicado no existe");
    }

    if (user.rol !== "cliente") {
      throw new Error(
        "Solo se permite promover usuarios con rol cliente"
      );
    }

    const adminCount = await tx.usuarios.count({
      where: { rol: "admin" },
    });

    if (adminCount > 0) {
      throw new Error(
        "Ya existe un administrador. Inicialización cancelada"
      );
    }

    return tx.usuarios.update({
      where: { id_usuario: user.id_usuario },
      data: { rol: "admin" },
      select: {
        id_usuario: true,
        email: true,
        rol: true,
      },
    });
  });

  console.log("Administrador inicializado correctamente:");
  console.log(`Usuario: ${result.email}`);
  console.log(`Rol: ${result.rol}`);
}

initializeAdmin()
  .catch((error: unknown) => {
    console.error(
      "No se pudo inicializar el administrador:",
      error instanceof Error ? error.message : error
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import getpass
import json
import os
import subprocess
import sys

password = getpass.getpass("Nueva contraseña para cliente.prueba@example.com: ")

if len(password) < 8:
    print("La contraseña debe tener al menos 8 caracteres. No se hizo ningún cambio.")
    sys.exit(1)

env = os.environ.copy()
env["RESET_USER_ID"] = "23"
env["RESET_PASSWORD"] = password

script = r'''
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

(async () => {
  const id = Number(process.env.RESET_USER_ID);
  const password = process.env.RESET_PASSWORD;
  const hash = await bcrypt.hash(password, 10);
  const result = await prisma.usuarios.updateMany({
    where: { id_usuario: id, email: "cliente.prueba@example.com" },
    data: { password_hash: hash }
  });
  if (result.count !== 1) {
    console.log("No se actualizó ninguna cuenta. Verifica el resultado antes de continuar.");
    process.exitCode = 1;
  } else {
    console.log("Contraseña restablecida para el usuario autorizado.");
  }
})().catch(() => {
  console.log("Falló el restablecimiento. No se pudo confirmar el cambio.");
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
'''

try:
    result = subprocess.run(
        ["node", "-e", script],
        env=env,
        check=False,
    )
    sys.exit(result.returncode)
finally:
    password = None
    env.pop("RESET_PASSWORD", None)

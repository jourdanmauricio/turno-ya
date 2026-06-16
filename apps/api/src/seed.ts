import "reflect-metadata";
import { DataSource } from "typeorm";
import * as bcrypt from "bcrypt";
import * as dotenv from "dotenv";
import { User } from "./entities/user.entity";
import { Servicio } from "./entities/servicio.entity";
import { Caja } from "./entities/caja.entity";
import { Turno } from "./entities/turno.entity";

dotenv.config();

const dataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  synchronize: true,
  entities: [User, Servicio, Caja, Turno],
});

async function seed() {
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error("Error: SEED_ADMIN_PASSWORD env var no está definida.");
    process.exit(1);
  }

  await dataSource.initialize();
  console.log("Conexión establecida");

  const userRepo = dataSource.getRepository(User);
  const servicioRepo = dataSource.getRepository(Servicio);
  const cajaRepo = dataSource.getRepository(Caja);

  // Admin
  const existingAdmin = await userRepo.findOneBy({
    email: "admin@turnoya.com",
  });
  if (!existingAdmin) {
    const hash = await bcrypt.hash(adminPassword, 10);
    await userRepo.save({
      nombre: "Administrador",
      email: "admin@turnoya.com",
      password: hash,
      role: "admin",
      cajaAsignada: null,
      activo: true,
    });
    console.log("✓ Admin creado");
  } else {
    console.log("- Admin ya existe, omitido");
  }

  // Servicios
  const servicios = [
    { nombre: "Pagar Servicios", prefijo: "A", tiempoEstimadoSegundos: 300 },
    { nombre: "Retirar Dinero", prefijo: "B", tiempoEstimadoSegundos: 480 },
    { nombre: "Enviar Dinero", prefijo: "C", tiempoEstimadoSegundos: 600 },
  ] as const;

  for (const data of servicios) {
    const exists = await servicioRepo.findOneBy({ prefijo: data.prefijo });
    if (!exists) {
      await servicioRepo.save({ ...data, activo: true });
      console.log(`✓ Servicio "${data.nombre}" creado`);
    } else {
      console.log(`- Servicio "${data.nombre}" ya existe, omitido`);
    }
  }

  // Cajas
  for (const numero of [1, 2, 3]) {
    const exists = await cajaRepo.findOneBy({ numero });
    if (!exists) {
      await cajaRepo.save({ numero, activo: true });
      console.log(`✓ Caja ${numero} creada`);
    } else {
      console.log(`- Caja ${numero} ya existe, omitida`);
    }
  }

  await dataSource.destroy();
  console.log("\nSeed completado.");
}

seed().catch((err) => {
  console.error("Error en seed:", err);
  process.exit(1);
});

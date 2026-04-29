import sql from '../config/db.js';

async function migrate() {
  try {
    console.log("Migrando base de datos...");
    await sql`
      ALTER TABLE usuarios 
      ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255), 
      ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;
    `;
    console.log("Migración exitosa: columnas reset_token y reset_token_expires añadidas.");
    process.exit(0);
  } catch (error) {
    console.error("Error en migración:", error);
    process.exit(1);
  }
}

migrate();

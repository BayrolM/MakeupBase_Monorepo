import sql from './config/db.js';

async function alterDb() {
  try {
    await sql`ALTER TABLE proveedores ALTER COLUMN nombre TYPE varchar(100);`;
    console.log("DB altered successfully");
    process.exit(0);
  } catch(e) {
    console.error("Error modifying DB", e);
    process.exit(1);
  }
}

alterDb();

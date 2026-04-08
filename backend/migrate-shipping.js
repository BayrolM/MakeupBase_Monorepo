import sql from './config/db.js';

async function migrate() {
  try {
    console.log('🚀 Altering pedidos table to add shipping info columns...');
    
    await sql`ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS transportadora VARCHAR(100)`;
    await sql`ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS numero_guia VARCHAR(100)`;
    await sql`ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS tracking_link TEXT`;
    await sql`ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS fecha_envio DATE`;
    await sql`ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS fecha_estimada TEXT`;
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();

import sql from './config/db.js';
async function test() {
  try {
    const res = await sql`
      SELECT column_name, data_type, character_maximum_length 
      FROM information_schema.columns 
      WHERE table_name = 'proveedores';
    `;
    console.log(JSON.stringify(res, null, 2));
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
test();

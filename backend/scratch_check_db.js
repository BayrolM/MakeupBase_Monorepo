import sql from '../config/db.js';
async function run() {
  const res = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'usuarios';`;
  console.log(res);
  process.exit();
}
run();

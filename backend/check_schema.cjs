const p = require('postgres');
const sql = p('postgresql://postgres.rjrafmgjtuuqtprmfhwc:1033488906b@aws-1-us-east-2.pooler.supabase.com:6543/postgres');
async function main() {
  try {
    const devCols = await sql`SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name='devoluciones' ORDER BY ordinal_position`;
    console.log('=== DEVOLUCIONES COLUMNS ===');
    devCols.forEach(c => console.log(`  ${c.column_name} (${c.data_type}) nullable=${c.is_nullable} default=${c.column_default}`));

    const detCols = await sql`SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name='detalle_devoluciones' ORDER BY ordinal_position`;
    console.log('\n=== DETALLE_DEVOLUCIONES COLUMNS ===');
    detCols.forEach(c => console.log(`  ${c.column_name} (${c.data_type}) nullable=${c.is_nullable} default=${c.column_default}`));

    // Check ventas sample
    const ventas = await sql`SELECT id_venta, id_usuario_cliente, fecha_venta, total, estado FROM ventas LIMIT 3`;
    console.log('\n=== SAMPLE VENTAS ===');
    console.log(JSON.stringify(ventas, null, 2));

    // Check detalle_ventas columns
    const dvCols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='detalle_ventas' ORDER BY ordinal_position`;
    console.log('\n=== DETALLE_VENTAS COLUMNS ===');
    dvCols.forEach(c => console.log(`  ${c.column_name} (${c.data_type})`));

    // Check existing devoluciones
    const devs = await sql`SELECT * FROM devoluciones LIMIT 3`;
    console.log('\n=== EXISTING DEVOLUCIONES ===');
    console.log(JSON.stringify(devs, null, 2));

    // Check FKs on devoluciones
    const fks = await sql`
      SELECT tc.constraint_name, kcu.column_name, ccu.table_name AS foreign_table_name, ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc 
      JOIN information_schema.key_column_usage AS kcu ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu ON ccu.constraint_name = tc.constraint_name
      WHERE tc.table_name = 'devoluciones' AND tc.constraint_type = 'FOREIGN KEY'
    `;
    console.log('\n=== DEVOLUCIONES FKs ===');
    console.log(JSON.stringify(fks, null, 2));

  } catch(e) { console.error(e.message); }
  finally { await sql.end(); }
}
main();

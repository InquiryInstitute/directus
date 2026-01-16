/**
 * Test Supabase connection using the same format Directus would use
 * This helps diagnose connection issues
 */

import pg from 'pg';
const { Client } = pg;

const PROJECT_REF = 'xougqdomkoisrxdnagcj';
const PASSWORD = 'QZTzbxbx688sAWfS';

async function testDirectConnection() {
  console.log('🔍 Testing Direct Connection (port 5432)...');
  const client = new Client({
    host: `db.${PROJECT_REF}.supabase.co`,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: PASSWORD,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ Direct connection successful!');
    
    const result = await client.query('SELECT version(), current_database(), current_user');
    console.log('Database info:', {
      version: result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1],
      database: result.rows[0].current_database,
      user: result.rows[0].current_user,
    });
    
    // Check if Commonplace tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('persons', 'works', 'sources', 'citations')
      ORDER BY table_name
    `);
    console.log('Commonplace tables found:', tablesResult.rows.map(r => r.table_name));
    
    await client.end();
    return true;
  } catch (error: any) {
    console.error('❌ Direct connection failed:', error.message);
    return false;
  }
}

async function testPoolerConnection() {
  console.log('\n🔍 Testing Pooler Connection (port 6543)...');
  const client = new Client({
    host: 'aws-0-us-east-1.pooler.supabase.com',
    port: 6543,
    database: 'postgres',
    user: `postgres.${PROJECT_REF}`,
    password: PASSWORD,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log('✅ Pooler connection successful!');
    
    const result = await client.query('SELECT version(), current_database(), current_user');
    console.log('Database info:', {
      version: result.rows[0].version.split(' ')[0] + ' ' + result.rows[0].version.split(' ')[1],
      database: result.rows[0].current_database,
      user: result.rows[0].current_user,
    });
    
    await client.end();
    return true;
  } catch (error: any) {
    console.error('❌ Pooler connection failed:', error.message);
    return false;
  }
}

async function main() {
  console.log('🧪 Testing Supabase Connections\n');
  console.log('Password:', PASSWORD.substring(0, 4) + '...');
  console.log('Project:', PROJECT_REF);
  console.log('');
  
  const directOk = await testDirectConnection();
  const poolerOk = await testPoolerConnection();
  
  console.log('\n📊 Summary:');
  console.log('  Direct connection (5432):', directOk ? '✅' : '❌');
  console.log('  Pooler connection (6543):', poolerOk ? '✅' : '❌');
  
  if (directOk || poolerOk) {
    console.log('\n✅ At least one connection method works!');
    console.log('   Use the working method for Directus.');
  } else {
    console.log('\n❌ Both connection methods failed.');
    console.log('   Check: password, project status, network restrictions');
  }
}

main().catch(console.error);

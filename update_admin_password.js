const bcrypt = require('bcrypt');
const { Pool } = require('pg');

async function updateAdminPassword() {
  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'secure_email',
    password: 'harsh@postsql',
    port: 5432,
  });

  try {
    // Generate a fresh hash
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);
    console.log('Generated hash:', hash);
    
    // Update the database
    const result = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2',
      [hash, 'admin@localhost']
    );
    
    console.log('Updated rows:', result.rowCount);
    
    // Verify the update
    const verify = await pool.query(
      'SELECT email, password_hash FROM users WHERE email = $1',
      ['admin@localhost']
    );
    
    console.log('Stored hash:', verify.rows[0].password_hash);
    
    // Test the hash
    const isValid = await bcrypt.compare(password, verify.rows[0].password_hash);
    console.log('Hash validation:', isValid);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await pool.end();
  }
}

updateAdminPassword();

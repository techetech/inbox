const bcrypt = require('bcrypt');

async function testPassword() {
  const password = 'admin123';
  
  // This is the hash that was previously working
  const workingHash = '$2b$10$mcJxxhxiLfiP8/EtWATJOej3K/3aCjAh7PJMNHqXmEcWiLdHvxajm';
  
  // This is the hash from the original schema
  const schemaHash = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewTdl78OlT6.Gzv6';
  
  console.log('Testing password: admin123');
  console.log('Against working hash:', await bcrypt.compare(password, workingHash));
  console.log('Against schema hash:', await bcrypt.compare(password, schemaHash));
  
  // Generate a fresh hash
  const newHash = await bcrypt.hash(password, 10);
  console.log('New hash:', newHash);
  console.log('New hash validates:', await bcrypt.compare(password, newHash));
}

testPassword().catch(console.error);

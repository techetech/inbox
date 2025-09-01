const bcrypt = require('bcrypt');

async function generateAndTestHash() {
  try {
    console.log('Generating hash for admin123...');
    const hash = await bcrypt.hash('admin123', 10);
    console.log('Generated hash:', hash);
    
    console.log('Testing hash...');
    const isValid = await bcrypt.compare('admin123', hash);
    console.log('Hash validation:', isValid);
    
    if (isValid) {
      console.log('SUCCESS: Hash works correctly');
      console.log('Use this hash in database:', hash);
    } else {
      console.log('ERROR: Hash validation failed');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

generateAndTestHash();

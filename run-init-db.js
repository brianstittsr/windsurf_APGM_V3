const { initializeDatabase } = require('./dist/scripts/initializeDatabase.js');

async function runInit() {
  try {
    console.log('Starting database initialization...');
    await initializeDatabase();
    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

runInit();

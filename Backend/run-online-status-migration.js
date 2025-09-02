import { sequelize } from './models/index.js';

const runMigration = async () => {
  try {
    console.log('Running online status migration...');

    // Add columns
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN is_online BOOLEAN DEFAULT FALSE,
      ADD COLUMN last_seen TIMESTAMP NULL
    `);

    // Update existing users
    await sequelize.query(`
      UPDATE users SET last_seen = last_login WHERE last_login IS NOT NULL
    `);

    console.log('Online status migration completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

runMigration();
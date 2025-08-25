import sequelize from './config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runReviewsMigration = async () => {
  try {
    console.log('Running reviews table migration...');

    // Read the SQL file
    const sqlFile = path.join(__dirname, 'migrations', '20250825-create-reviews-table.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Execute the SQL
    await sequelize.query(sql);

    console.log('✅ Reviews table created successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error running migration:', error);
    process.exit(1);
  }
};

runReviewsMigration();
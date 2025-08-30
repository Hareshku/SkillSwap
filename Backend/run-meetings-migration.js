import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'SkillSwap'
};

async function runMigration() {
  let connection;

  try {
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to database');

    // Read migration file
    const migrationPath = path.join(__dirname, 'migrations', '20250830-update-meetings-table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split by semicolon and execute each statement
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.trim().substring(0, 50) + '...');
        await connection.execute(statement);
      }
    }

    console.log('✅ Migration completed successfully');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

const runMigration = async () => {
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '@arti12@',
      database: 'GrowTogather'
    });

    console.log('Connected to MySQL database');

    // Read migration file
    const migrationPath = path.join(process.cwd(), 'migrations', '20250729-add-admin-fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split by semicolon and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('\n--'));

    console.log(`Executing ${statements.length} migration statements...`);
    console.log('Statements to execute:');
    statements.forEach((stmt, i) => {
      console.log(`${i + 1}: ${stmt.substring(0, 100)}...`);
    });

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`);
          await connection.execute(statement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          if (error.code === 'ER_DUP_FIELDNAME') {
            console.log(`⚠️  Field already exists, skipping: ${error.message}`);
          } else if (error.code === 'ER_DUP_KEYNAME') {
            console.log(`⚠️  Index already exists, skipping: ${error.message}`);
          } else {
            console.error(`❌ Error executing statement ${i + 1}:`, error.message);
            console.error('Statement:', statement);
          }
        }
      }
    }

    await connection.end();
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
};

runMigration();

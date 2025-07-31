import mysql from 'mysql2/promise';

const runAlterTables = async () => {
  try {
    // Create connection
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '@arti12@',
      database: 'GrowTogather'
    });

    console.log('Connected to MySQL database');

    // Define ALTER TABLE statements
    const alterStatements = [
      // Add admin-related fields to users table
      `ALTER TABLE users 
       ADD COLUMN verified_by INT NULL,
       ADD COLUMN verified_at DATETIME NULL,
       ADD COLUMN verification_notes TEXT NULL,
       ADD COLUMN blocked_by INT NULL,
       ADD COLUMN blocked_at DATETIME NULL,
       ADD COLUMN blocked_reason TEXT NULL,
       ADD COLUMN rejected_by INT NULL,
       ADD COLUMN rejected_at DATETIME NULL,
       ADD COLUMN rejection_reason TEXT NULL,
       ADD COLUMN role_changed_by INT NULL,
       ADD COLUMN role_changed_at DATETIME NULL,
       ADD COLUMN role_change_reason TEXT NULL`,

      // Add admin-related fields to posts table
      `ALTER TABLE posts 
       ADD COLUMN approval_notes TEXT NULL,
       ADD COLUMN removed_by INT NULL,
       ADD COLUMN removed_at DATETIME NULL,
       ADD COLUMN removed_reason TEXT NULL`,

      // Add missing field to reports table
      `ALTER TABLE reports 
       ADD COLUMN resolved_at DATETIME NULL`
    ];

    console.log(`Executing ${alterStatements.length} ALTER TABLE statements...`);

    for (let i = 0; i < alterStatements.length; i++) {
      const statement = alterStatements[i];
      try {
        console.log(`Executing ALTER statement ${i + 1}/${alterStatements.length}...`);
        await connection.execute(statement);
        console.log(`✅ ALTER statement ${i + 1} executed successfully`);
      } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️  Field already exists, skipping: ${error.message}`);
        } else {
          console.error(`❌ Error executing ALTER statement ${i + 1}:`, error.message);
          console.error('Statement:', statement);
        }
      }
    }

    await connection.end();
    console.log('✅ ALTER TABLE statements completed successfully!');
  } catch (error) {
    console.error('❌ ALTER TABLE failed:', error.message);
    process.exit(1);
  }
};

runAlterTables();

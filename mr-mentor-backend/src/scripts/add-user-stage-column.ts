import { DatabaseService } from '../config/database';

async function addUserStageColumn() {
  try {
    const dbService = DatabaseService.getInstance();
    await dbService.initialize();
    console.log('Database connection initialized');

    const queryRunner = dbService.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      // Check if table exists
      const tableExists = await queryRunner.hasTable('users');
      if (!tableExists) {
        console.log('Users table does not exist');
        return;
      }

      // Add stage column if it doesn't exist
      const hasStage = await queryRunner.hasColumn('users', 'stage');
      if (hasStage) {
        console.log('stage column already exists');
      } else {
        await queryRunner.query(`
          ALTER TABLE users ADD COLUMN stage INT NOT NULL DEFAULT 1
        `);
        console.log('Added stage column with default value 1 (SIGNUP)');
      }

      console.log('User stage column migration completed successfully');
    } finally {
      await queryRunner.release();
    }

    await dbService.close();
  } catch (error) {
    console.error('Error adding user stage column:', error);
    process.exit(1);
  }
}

addUserStageColumn();

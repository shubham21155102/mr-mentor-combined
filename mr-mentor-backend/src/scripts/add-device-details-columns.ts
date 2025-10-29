import { DatabaseService } from '../config/database';

async function addDeviceDetailsColumns() {
  try {
    const dbService = DatabaseService.getInstance();
    await dbService.initialize();
    console.log('Database connection initialized');

    const queryRunner = dbService.dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      // Check if columns exist before adding
      const tableExists = await queryRunner.hasTable('users');
      if (!tableExists) {
        console.log('Users table does not exist');
        return;
      }

      // Add deviceInfo column if it doesn't exist
      const hasDeviceInfo = await queryRunner.hasColumn('users', 'deviceInfo');
      if (!hasDeviceInfo) {
        await queryRunner.query(`
          ALTER TABLE users ADD COLUMN deviceInfo TEXT NULL
        `);
        console.log('Added deviceInfo column');
      } else {
        console.log('deviceInfo column already exists');
      }

      // Add ipAddress column if it doesn't exist
      const hasIpAddress = await queryRunner.hasColumn('users', 'ipAddress');
      if (!hasIpAddress) {
        await queryRunner.query(`
          ALTER TABLE users ADD COLUMN ipAddress VARCHAR(45) NULL
        `);
        console.log('Added ipAddress column');
      } else {
        console.log('ipAddress column already exists');
      }

      // Add userAgent column if it doesn't exist
      const hasUserAgent = await queryRunner.hasColumn('users', 'userAgent');
      if (!hasUserAgent) {
        await queryRunner.query(`
          ALTER TABLE users ADD COLUMN userAgent TEXT NULL
        `);
        console.log('Added userAgent column');
      } else {
        console.log('userAgent column already exists');
      }

      console.log('Device details columns migration completed successfully');
    } finally {
      await queryRunner.release();
    }

    await dbService.close();
  } catch (error) {
    console.error('Error adding device details columns:', error);
    process.exit(1);
  }
}

addDeviceDetailsColumns();

import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables
config({ path: path.join(__dirname, '../../.env') });

const addIsAvailableColumn = async () => {
  const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: true,
  });

  try {
    await AppDataSource.initialize();
    console.log('Database connection established');

    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();

    // Check if column already exists
    const checkColumnQuery = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='slots' AND column_name='isAvailable';
    `;
    
    const columnExists = await queryRunner.query(checkColumnQuery);

    if (columnExists.length === 0) {
      console.log('Adding isAvailable column to slots table...');
      
      // Add the column with default value false
      await queryRunner.query(`
        ALTER TABLE slots 
        ADD COLUMN "isAvailable" boolean NOT NULL DEFAULT false;
      `);
      
      console.log('Column added successfully');
    } else {
      console.log('Column isAvailable already exists');
    }

    // Make studentId nullable if it isn't already
    const studentIdQuery = `
      SELECT is_nullable 
      FROM information_schema.columns 
      WHERE table_name='slots' AND column_name='studentId';
    `;
    
    const studentIdInfo = await queryRunner.query(studentIdQuery);
    
    if (studentIdInfo.length > 0 && studentIdInfo[0].is_nullable === 'NO') {
      console.log('Making studentId nullable...');
      
      await queryRunner.query(`
        ALTER TABLE slots 
        ALTER COLUMN "studentId" DROP NOT NULL;
      `);
      
      console.log('studentId is now nullable');
    } else {
      console.log('studentId is already nullable or column does not exist');
    }

    await queryRunner.release();
    await AppDataSource.destroy();
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
};

addIsAvailableColumn();

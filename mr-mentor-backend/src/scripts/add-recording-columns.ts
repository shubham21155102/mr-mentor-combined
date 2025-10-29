import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Token } from '../entities/Tokens';
import { GoogleMeet } from '../entities/GoogleMeet';
import { GoogleMeetAttendee } from '../entities/GoogleMeetAttendee';
import { GoogleMeetConferenceData } from '../entities/GoogleMeetConferenceData';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'shubham',
  password: process.env.DB_PASSWORD || 'shubham',
  database: process.env.DB_NAME || 'template',
  entities: [User, Token, GoogleMeet, GoogleMeetAttendee, GoogleMeetConferenceData],
  synchronize: false,
  logging: true,
  ssl: false
});

async function addRecordingColumns() {
  try {
    console.log('🔄 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Database connected successfully');

    console.log('🔄 Adding recording columns to google_meets table...');
    
    // Add recording-related columns
    await dataSource.query(`
      ALTER TABLE google_meets 
      ADD COLUMN IF NOT EXISTS enable_recording BOOLEAN DEFAULT false;
    `);

    await dataSource.query(`
      ALTER TABLE google_meets 
      ADD COLUMN IF NOT EXISTS recording_instructions TEXT;
    `);

    await dataSource.query(`
      ALTER TABLE google_meets 
      ADD COLUMN IF NOT EXISTS drive_file_id VARCHAR(500);
    `);

    await dataSource.query(`
      ALTER TABLE google_meets 
      ADD COLUMN IF NOT EXISTS recording_url VARCHAR(500);
    `);

    await dataSource.query(`
      ALTER TABLE google_meets 
      ADD COLUMN IF NOT EXISTS recording_status VARCHAR(50) DEFAULT 'not_recorded';
    `);

    await dataSource.query(`
      ALTER TABLE google_meets 
      ADD COLUMN IF NOT EXISTS recording_duration BIGINT;
    `);

    await dataSource.query(`
      ALTER TABLE google_meets 
      ADD COLUMN IF NOT EXISTS recording_file_size BIGINT;
    `);

    await dataSource.query(`
      ALTER TABLE google_meets 
      ADD COLUMN IF NOT EXISTS recording_created_at TIMESTAMP;
    `);

    console.log('✅ Recording columns added successfully');
    console.log('📊 Columns added:');
    console.log('   - enable_recording (BOOLEAN)');
    console.log('   - recording_instructions (TEXT)');
    console.log('   - drive_file_id (VARCHAR)');
    console.log('   - recording_url (VARCHAR)');
    console.log('   - recording_status (VARCHAR)');
    console.log('   - recording_duration (BIGINT)');
    console.log('   - recording_file_size (BIGINT)');
    console.log('   - recording_created_at (TIMESTAMP)');

  } catch (error) {
    console.error('❌ Error adding recording columns:', error);
    throw error;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🗄️  Database connection closed');
    }
  }
}

// Run the script
addRecordingColumns()
  .then(() => {
    console.log('🎉 Recording columns added successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Failed to add recording columns:', error);
    process.exit(1);
  });

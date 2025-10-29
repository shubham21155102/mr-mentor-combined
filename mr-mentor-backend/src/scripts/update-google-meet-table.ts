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

async function updateGoogleMeetTable() {
  try {
    console.log('🔄 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Database connected successfully');

    console.log('🔄 Updating google_meets table to make created_by nullable...');
    
    // Make created_by column nullable
    await dataSource.query(`
      ALTER TABLE google_meets 
      ALTER COLUMN created_by DROP NOT NULL;
    `);

    console.log('✅ google_meets table updated successfully');
    console.log('📊 Changes made:');
    console.log('   - created_by column is now nullable');

  } catch (error) {
    console.error('❌ Error updating google_meets table:', error);
    throw error;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🗄️  Database connection closed');
    }
  }
}

// Run the script
updateGoogleMeetTable()
  .then(() => {
    console.log('🎉 Google Meet table update completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Google Meet table update failed:', error);
    process.exit(1);
  });

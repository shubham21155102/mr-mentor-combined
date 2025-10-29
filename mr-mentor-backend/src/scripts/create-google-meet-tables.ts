import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { GoogleMeet } from '../entities/GoogleMeet';
import { GoogleMeetAttendee } from '../entities/GoogleMeetAttendee';
import { GoogleMeetConferenceData } from '../entities/GoogleMeetConferenceData';
import { User } from '../entities/User';
import { Token } from '../entities/Tokens';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'shubham',
  password: process.env.DB_PASSWORD || 'shubham',
  database: process.env.DB_NAME || 'template',
  entities: [User, Token, GoogleMeet, GoogleMeetAttendee, GoogleMeetConferenceData],
  synchronize: false, // We'll create tables manually
  logging: true,
  ssl: false
});

async function createGoogleMeetTables() {
  try {
    console.log('🔄 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Database connected successfully');

    console.log('🔄 Creating Google Meet tables...');
    
    // Create GoogleMeet table
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS google_meets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        google_event_id VARCHAR(255) UNIQUE NOT NULL,
        summary VARCHAR(500) NOT NULL,
        description TEXT,
        start_date_time TIMESTAMP NOT NULL,
        start_time_zone VARCHAR(100) DEFAULT 'UTC',
        end_date_time TIMESTAMP NOT NULL,
        end_time_zone VARCHAR(100) DEFAULT 'UTC',
        location VARCHAR(500),
        hangout_link VARCHAR(500),
        meet_link VARCHAR(500),
        html_link VARCHAR(500),
        status VARCHAR(50) DEFAULT 'confirmed',
        is_recurring BOOLEAN DEFAULT false,
        recurrence_rule VARCHAR(500),
        send_notifications BOOLEAN DEFAULT true,
        send_updates VARCHAR(50) DEFAULT 'all',
        notes TEXT,
        is_deleted BOOLEAN DEFAULT false,
        deleted_at TIMESTAMP,
        created_by UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    // Create GoogleMeetAttendee table
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS google_meet_attendees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) NOT NULL,
        display_name VARCHAR(255),
        is_optional BOOLEAN DEFAULT false,
        is_resource BOOLEAN DEFAULT false,
        is_organizer BOOLEAN DEFAULT false,
        is_self BOOLEAN DEFAULT false,
        response_status VARCHAR(50) DEFAULT 'needsAction',
        comment VARCHAR(500),
        additional_guests INTEGER DEFAULT 0,
        is_deleted BOOLEAN DEFAULT false,
        deleted_at TIMESTAMP,
        meeting_id UUID NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (meeting_id) REFERENCES google_meets(id) ON DELETE CASCADE
      );
    `);

    // Create GoogleMeetConferenceData table
    await dataSource.query(`
      CREATE TABLE IF NOT EXISTS google_meet_conference_data (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        entry_point_type VARCHAR(50) NOT NULL,
        uri VARCHAR(1000) NOT NULL,
        label VARCHAR(500),
        pin VARCHAR(100),
        access_code VARCHAR(100),
        meeting_code VARCHAR(100),
        passcode VARCHAR(100),
        password VARCHAR(100),
        region VARCHAR(100),
        is_deleted BOOLEAN DEFAULT false,
        deleted_at TIMESTAMP,
        meeting_id UUID NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (meeting_id) REFERENCES google_meets(id) ON DELETE CASCADE
      );
    `);

    // Create indexes for better performance
    await dataSource.query(`
      CREATE INDEX IF NOT EXISTS idx_google_meets_google_event_id ON google_meets(google_event_id);
    `);

    await dataSource.query(`
      CREATE INDEX IF NOT EXISTS idx_google_meets_created_by ON google_meets(created_by);
    `);

    await dataSource.query(`
      CREATE INDEX IF NOT EXISTS idx_google_meets_start_date_time ON google_meets(start_date_time);
    `);

    await dataSource.query(`
      CREATE INDEX IF NOT EXISTS idx_google_meet_attendees_email ON google_meet_attendees(email);
    `);

    await dataSource.query(`
      CREATE INDEX IF NOT EXISTS idx_google_meet_attendees_meeting_id ON google_meet_attendees(meeting_id);
    `);

    await dataSource.query(`
      CREATE INDEX IF NOT EXISTS idx_google_meet_conference_data_meeting_id ON google_meet_conference_data(meeting_id);
    `);

    console.log('✅ Google Meet tables created successfully');
    console.log('📊 Tables created:');
    console.log('   - google_meets');
    console.log('   - google_meet_attendees');
    console.log('   - google_meet_conference_data');
    console.log('   - Indexes for performance optimization');

  } catch (error) {
    console.error('❌ Error creating Google Meet tables:', error);
    throw error;
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🗄️  Database connection closed');
    }
  }
}

// Run the script
createGoogleMeetTables()
  .then(() => {
    console.log('🎉 Google Meet database setup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Google Meet database setup failed:', error);
    process.exit(1);
  });

import 'reflect-metadata';
import { DatabaseService } from '../config/database';

async function createTables() {
  try {
    console.log('Creating database tables...');
    const database = DatabaseService.getInstance();
    await database.initialize();
    
    // Force synchronization
    await database.dataSource.synchronize(true); // true = drop existing tables
    console.log('✅ Database tables created successfully');
    
    await database.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    process.exit(1);
  }
}

createTables();

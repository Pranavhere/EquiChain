import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from './env';
import { User } from '../entities/User';
import { Position } from '../entities/Position';
import { Transaction } from '../entities/Transaction';

// Support both PostgreSQL and SQLite
const dbUrl = config.database.url;
const isPostgres = dbUrl.startsWith('postgres://');

const dataSourceOptions: DataSourceOptions = isPostgres
  ? {
      type: 'postgres',
      url: dbUrl,
      synchronize: true, // Auto-create tables (disable in production)
      logging: config.nodeEnv === 'development',
      entities: [User, Position, Transaction],
      migrations: [],
      subscribers: [],
    }
  : {
      type: 'better-sqlite3',
      database: dbUrl.replace('sqlite://', ''),
      synchronize: true,
      logging: config.nodeEnv === 'development',
      entities: [User, Position, Transaction],
      migrations: [],
      subscribers: [],
    };

export const AppDataSource = new DataSource(dataSourceOptions);

export async function initializeDatabase() {
  try {
    console.log(`   Connecting to database (${isPostgres ? 'PostgreSQL' : 'SQLite'})...`);
    await AppDataSource.initialize();
    console.log('✅ Database connection established');
    console.log(`   Database type: ${isPostgres ? 'PostgreSQL' : 'SQLite'}`);
    return AppDataSource;
  } catch (error: any) {
    console.error('❌ Database connection failed:');
    console.error(`   Error: ${error.message}`);
    console.error(`   Database URL: ${dbUrl.substring(0, 30)}...`);
    throw error;
  }
}

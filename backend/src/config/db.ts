import { DataSource } from 'typeorm';
import { config } from './env';
import { User } from '../entities/User';
import { Position } from '../entities/Position';
import { Transaction } from '../entities/Transaction';

// Support both PostgreSQL and SQLite
const dbUrl = config.database.url;
const isPostgres = dbUrl.startsWith('postgres://');

export const AppDataSource = new DataSource({
  type: isPostgres ? 'postgres' : 'better-sqlite3',
  ...(isPostgres ? { url: dbUrl } : { database: dbUrl.replace('sqlite://', '') }),
  synchronize: true, // Auto-create tables (disable in production)
  logging: config.nodeEnv === 'development',
  entities: [User, Position, Transaction],
  migrations: [],
  subscribers: [],
});

export async function initializeDatabase() {
  try {
    await AppDataSource.initialize();
    console.log('✅ Database connection established');
    return AppDataSource;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

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
    await AppDataSource.initialize();
    console.log('✅ Database connection established');
    return AppDataSource;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

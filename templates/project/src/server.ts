import 'reflect-metadata';
import dotenv from 'dotenv';
import { createServer } from 'http';
import app from './app';
import { container } from './infrastructure/container';
import { TYPES, ILogger } from './infrastructure/types';
import { UserRepository } from './infrastructure/repositories/user.repository';

// Load environment variables
dotenv.config();

const port = process.env.PORT || 3000;
const server = createServer(app);
const logger = container.get<ILogger>(TYPES.Logger);

// Seed initial data (for development)
async function seedData() {
  try {
    const userRepository = container.get<UserRepository>(TYPES.UserRepository);
    await userRepository.seed();
    logger.info('Initial data seeded successfully');
  } catch (error) {
    logger.error('Failed to seed initial data', error as Error);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

// Start server
server.listen(port, async () => {
  logger.info(`🚀 Server running on port ${port}`, {
    port,
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });

  // Seed data in development
  if (process.env.NODE_ENV !== 'production') {
    await seedData();
  }

  logger.info('📋 Available endpoints:', {
    health: `http://localhost:${port}/health`,
    users: `http://localhost:${port}/api/users`,
    docs: `http://localhost:${port}/api-docs`
  });
});

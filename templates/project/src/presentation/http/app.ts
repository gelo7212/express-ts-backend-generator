import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { container } from '../../infrastructure/container';
import { TYPES, ILogger } from '../../infrastructure/types';
import { RouteRegistry } from './routes';
import { errorHandler } from './middleware/error-handler.middleware';

const app = express();
const logger = container.get<ILogger>(TYPES.Logger);

// Security middleware
app.use(helmet());
app.use(cors());
app.use(compression());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, { 
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });
  next();
});

// API Routes - Auto-registered from RouteRegistry
const routes = RouteRegistry.getRoutes();
routes.forEach(route => {
  app.use('/api', route.router);
  logger.info(`📍 Registered route: ${route.path} -> ${route.name}`);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: '<%= projectName %>'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to <%= projectName %>!',
    version: '1.0.0',
    documentation: '/api-docs'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;

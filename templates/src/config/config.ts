export interface Config {
  port: number;
  nodeEnv: string;
  apiVersion: string;
  apiPrefix: string;
  logLevel: string;
  logFilePath: string;
  jwtSecret: string;
  apiKey: string;
}

export const config: Config = {
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  apiVersion: process.env.API_VERSION || 'v1',
  apiPrefix: process.env.API_PREFIX || '/api',
  logLevel: process.env.LOG_LEVEL || 'info',
  logFilePath: process.env.LOG_FILE_PATH || './logs',
  jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-here',
  apiKey: process.env.API_KEY || 'your-api-key-here'
};

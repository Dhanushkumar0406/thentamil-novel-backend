import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable global validation with transformation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      whitelist: true,
    }),
  );

  // Set global API prefix (exclude health endpoint)
  app.setGlobalPrefix('api', {
    exclude: ['health', 'health/detailed'],
  });

  // CORS Configuration - Allow both localhost and 127.0.0.1
  const allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://[::1]:5173',  // IPv6 localhost
    'http://[::1]:5174',  // IPv6 localhost
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc)
      if (!origin) return callback(null, true);

      // In development, allow all localhost variants
      if (process.env.NODE_ENV === 'development' && origin) {
        const isLocalhost = origin.includes('localhost') ||
                          origin.includes('127.0.0.1') ||
                          origin.includes('[::1]');
        if (isLocalhost) {
          console.log(`✅ CORS allowed for development origin: ${origin}`);
          return callback(null, true);
        }
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Type', 'Authorization', 'ETag', 'Cache-Control'],
  });

  console.log('🔐 CORS Configuration:');
  console.log('   Allowed Origins:', allowedOrigins);
  console.log('   Credentials:', true);
  console.log('   Methods:', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');

  // HTTP Request Logging Middleware
  app.use((req, res, next) => {
    const startTime = Date.now();
    const { method, originalUrl, headers } = req;

    // Log incoming request
    console.log(`📥 ${method} ${originalUrl}`, {
      timestamp: new Date().toISOString(),
      headers: {
        origin: headers.origin,
        authorization: headers.authorization ? '[PRESENT]' : '[MISSING]',
      },
    });

    // Log response
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const statusEmoji = res.statusCode >= 400 ? '❌' : '✅';
      console.log(`${statusEmoji} ${method} ${originalUrl} - ${res.statusCode} (${duration}ms)`);
    });

    next();
  });

  // Disable caching to prevent 304 Not Modified responses
  app.use((req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  });

  const port = process.env.PORT || 4000;

  await app.listen(port);

  console.log('\n' + '='.repeat(60));
  console.log(`🚀 ThenTamil Novel Backend - STARTED`);
  console.log('='.repeat(60));
  console.log(`📍 Server URL: http://localhost:${port}`);
  console.log(`📍 API Base URL: http://localhost:${port}/api`);
  console.log(`🔐 CORS Origins: localhost:5173, 127.0.0.1:5173, localhost:5174, 127.0.0.1:5174`);
  console.log(`🗄️  Database: PostgreSQL (localhost:5432)`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`✅ Health Check: http://localhost:${port}/health`);
  console.log('='.repeat(60) + '\n');
}

bootstrap();

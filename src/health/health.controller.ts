import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'thentamil-novel-backend',
      port: process.env.PORT || 4000,
    };
  }

  @Get('detailed')
  detailed() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'thentamil-novel-backend',
      port: process.env.PORT || 4000,
      environment: process.env.NODE_ENV,
      database: 'PostgreSQL',
      cors: {
        origins: ['http://localhost:5173', 'http://127.0.0.1:5173'],
        credentials: true,
      },
      endpoints: {
        auth: '/auth/*',
        novels: '/novels/*',
        chapters: '/chapters/*',
        admin: '/admin/*',
        subscriptions: '/subscriptions/*',
        notifications: '/notifications/*',
        reading: '/reading/*',
        user: '/user/*',
      },
    };
  }
}

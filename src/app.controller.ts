import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt.guard';
import { RolesGuard } from './auth/roles.guard';
import { Roles } from './auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return {
      message: 'Your profile information',
      user: req.user,
    };
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  getAdminOnly() {
    return {
      message: 'Welcome to Admin Dashboard',
      access: 'ADMIN only',
    };
  }

  @Get('content')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  getContentManagement() {
    return {
      message: 'Content Management Area',
      access: 'ADMIN and EDITOR only',
    };
  }

  @Get('public')
  getPublic() {
    return {
      message: 'This is a public endpoint',
      access: 'Everyone',
    };
  }
}

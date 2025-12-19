import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ReadingProgressService } from './reading-progress.service';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';

@Controller('reading')
@UseGuards(JwtAuthGuard)
export class ReadingProgressController {
  constructor(private readonly readingProgressService: ReadingProgressService) {}

  @Get('progress')
  async getProgress(@Request() req) {
    return this.readingProgressService.getProgress(req.user.id);
  }

  @Post('progress')
  async updateProgress(@Request() req, @Body() updateProgressDto: UpdateProgressDto) {
    return this.readingProgressService.updateProgress(req.user.id, updateProgressDto);
  }

  @Delete('progress/:novelId')
  async deleteProgress(@Request() req, @Param('novelId') novelId: string) {
    return this.readingProgressService.deleteProgress(req.user.id, novelId);
  }
}

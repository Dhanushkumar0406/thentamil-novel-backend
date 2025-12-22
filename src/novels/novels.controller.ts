import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { NovelsService } from './novels.service';
import { CreateNovelDto } from './dto/create-novel.dto';
import { UpdateNovelDto } from './dto/update-novel.dto';
import { NovelQueryDto } from './dto/novel-query.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';

@Controller('novels')
export class NovelsController {
  constructor(private readonly novelsService: NovelsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  create(@Body() createNovelDto: CreateNovelDto, @Request() req) {
    return this.novelsService.create(createNovelDto, req.user.id);
  }

  @Get()
  findAll(@Query() query: NovelQueryDto) {
    return this.novelsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.novelsService.findOne(id);
  }

  @Get(':id/stats')
  getStats(@Param('id') id: string) {
    return this.novelsService.getNovelStats(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  update(
    @Param('id') id: string,
    @Body() updateNovelDto: UpdateNovelDto,
    @Request() req,
  ) {
    return this.novelsService.update(
      id,
      updateNovelDto,
      req.user.id,
      req.user.role,
    );
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.EDITOR)
  remove(@Param('id') id: string, @Request() req) {
    return this.novelsService.remove(id, req.user.id, req.user.role);
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  likeNovel(@Param('id') id: string, @Request() req) {
    return this.novelsService.likeNovel(id, req.user.id);
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  unlikeNovel(@Param('id') id: string, @Request() req) {
    return this.novelsService.unlikeNovel(id, req.user.id);
  }

  @Post(':id/bookmark')
  @UseGuards(JwtAuthGuard)
  bookmarkNovel(@Param('id') id: string, @Request() req) {
    return this.novelsService.bookmarkNovel(id, req.user.id);
  }

  @Delete(':id/bookmark')
  @UseGuards(JwtAuthGuard)
  unbookmarkNovel(@Param('id') id: string, @Request() req) {
    return this.novelsService.unbookmarkNovel(id, req.user.id);
  }
}

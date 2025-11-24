import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BookmarksService } from './bookmarks.service';

@ApiTags('Bookmarks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Post()
  @ApiOperation({ summary: 'Add a video to bookmarks' })
  async addBookmark(
    @Request() req,
    @Body()
    body: {
      videoId: string;
      note?: string;
      timestampSeconds?: number;
      collection?: string;
    },
  ) {
    return this.bookmarksService.addBookmark(req.user.id, body);
  }

  @Get()
  @ApiOperation({ summary: 'Get user bookmarks' })
  async getBookmarks(
    @Request() req,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
    @Query('collection') collection?: string,
  ) {
    return this.bookmarksService.getBookmarks(req.user.id, {
      limit,
      offset,
      collection,
    });
  }

  @Get('collections')
  @ApiOperation({ summary: 'Get all bookmark collections' })
  async getCollections(@Request() req) {
    const collections = await this.bookmarksService.getCollections(req.user.id);
    return { collections };
  }

  @Get(':videoId/status')
  @ApiOperation({ summary: 'Check if video is bookmarked' })
  async isBookmarked(@Request() req, @Param('videoId') videoId: string) {
    const bookmarked = await this.bookmarksService.isBookmarked(
      req.user.id,
      videoId,
    );
    return { bookmarked };
  }

  @Put(':videoId')
  @ApiOperation({ summary: 'Update bookmark' })
  async updateBookmark(
    @Request() req,
    @Param('videoId') videoId: string,
    @Body() body: { note?: string; collection?: string },
  ) {
    return this.bookmarksService.updateBookmark(req.user.id, videoId, body);
  }

  @Put(':videoId/collection')
  @ApiOperation({ summary: 'Move bookmark to collection' })
  async moveToCollection(
    @Request() req,
    @Param('videoId') videoId: string,
    @Body() body: { collection: string },
  ) {
    return this.bookmarksService.moveToCollection(
      req.user.id,
      videoId,
      body.collection,
    );
  }

  @Delete(':videoId')
  @ApiOperation({ summary: 'Remove video from bookmarks' })
  async removeBookmark(@Request() req, @Param('videoId') videoId: string) {
    await this.bookmarksService.removeBookmark(req.user.id, videoId);
    return { message: 'Bookmark removed' };
  }
}

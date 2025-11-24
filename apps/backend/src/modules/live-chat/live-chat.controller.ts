import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { LiveChatService } from './live-chat.service';
import { ChatMessageType } from '../../database/entities/live-chat-message.entity';

@ApiTags('Live Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('streams/:streamId/chat')
export class LiveChatController {
  constructor(private readonly liveChatService: LiveChatService) {}

  @Post('messages')
  @ApiOperation({ summary: 'Send a chat message' })
  async sendMessage(
    @Request() req,
    @Param('streamId') streamId: string,
    @Body()
    body: {
      message: string;
      type?: ChatMessageType;
      replyToId?: string;
    },
  ) {
    return this.liveChatService.sendMessage(streamId, req.user.id, body);
  }

  @Get('messages')
  @ApiOperation({ summary: 'Get chat messages' })
  async getMessages(
    @Param('streamId') streamId: string,
    @Query('limit') limit?: number,
    @Query('before') before?: string,
    @Query('after') after?: string,
  ) {
    return this.liveChatService.getMessages(streamId, { limit, before, after });
  }

  @Get('messages/pinned')
  @ApiOperation({ summary: 'Get pinned message' })
  async getPinnedMessage(@Param('streamId') streamId: string) {
    return this.liveChatService.getPinnedMessage(streamId);
  }

  @Post('messages/:messageId/pin')
  @ApiOperation({ summary: 'Pin a message' })
  async pinMessage(
    @Request() req,
    @Param('streamId') streamId: string,
    @Param('messageId') messageId: string,
  ) {
    return this.liveChatService.pinMessage(streamId, messageId, req.user.id);
  }

  @Delete('messages/:messageId/pin')
  @ApiOperation({ summary: 'Unpin a message' })
  async unpinMessage(
    @Param('streamId') streamId: string,
    @Param('messageId') messageId: string,
  ) {
    await this.liveChatService.unpinMessage(streamId, messageId);
    return { message: 'Message unpinned' };
  }

  @Post('messages/:messageId/highlight')
  @ApiOperation({ summary: 'Highlight a message' })
  async highlightMessage(@Param('messageId') messageId: string) {
    return this.liveChatService.highlightMessage(messageId);
  }

  @Delete('messages/:messageId')
  @ApiOperation({ summary: 'Delete a message' })
  async deleteMessage(
    @Request() req,
    @Param('messageId') messageId: string,
  ) {
    const isAdmin = req.user.role === 'admin' || req.user.role === 'moderator';
    await this.liveChatService.deleteMessage(messageId, req.user.id, isAdmin);
    return { message: 'Message deleted' };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get chat statistics' })
  async getStats(@Param('streamId') streamId: string) {
    const messageCount = await this.liveChatService.getMessageCount(streamId);
    return { messageCount };
  }
}

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiveChatMessage } from '../../database/entities/live-chat-message.entity';
import { LiveStream } from '../../database/entities/live-stream.entity';
import { LiveChatService } from './live-chat.service';
import { LiveChatController } from './live-chat.controller';
import { LiveChatGateway } from './live-chat.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([LiveChatMessage, LiveStream])],
  controllers: [LiveChatController],
  providers: [LiveChatService, LiveChatGateway],
  exports: [LiveChatService],
})
export class LiveChatModule {}

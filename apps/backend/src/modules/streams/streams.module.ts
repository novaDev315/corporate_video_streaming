import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LiveStream } from '../../database/entities';
import { StreamsController } from './streams.controller';
import { StreamsService } from './streams.service';
import { StreamsGateway } from './streams.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([LiveStream])],
  controllers: [StreamsController],
  providers: [StreamsService, StreamsGateway],
  exports: [StreamsService],
})
export class StreamsModule {}

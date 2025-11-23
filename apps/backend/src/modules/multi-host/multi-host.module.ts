import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StreamHost } from '../../database/entities/stream-host.entity';
import { LiveStream } from '../../database/entities/live-stream.entity';
import { User } from '../../database/entities/user.entity';
import { MultiHostService } from './multi-host.service';
import { MultiHostController } from './multi-host.controller';
import { MultiHostGateway } from './multi-host.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([StreamHost, LiveStream, User])],
  controllers: [MultiHostController],
  providers: [MultiHostService, MultiHostGateway],
  exports: [MultiHostService],
})
export class MultiHostModule {}

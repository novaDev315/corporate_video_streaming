import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccessLink } from '../../database/entities';
import { AccessLinksController } from './access-links.controller';
import { AccessLinksService } from './access-links.service';

@Module({
  imports: [TypeOrmModule.forFeature([AccessLink])],
  controllers: [AccessLinksController],
  providers: [AccessLinksService],
  exports: [AccessLinksService],
})
export class AccessLinksModule {}

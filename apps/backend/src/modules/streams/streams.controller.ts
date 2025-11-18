import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StreamsService } from './streams.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { User } from '../../database/entities';

@ApiTags('Live Streams')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('streams')
export class StreamsController {
  constructor(private readonly streamsService: StreamsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all streams for organization' })
  async getStreams(@CurrentUser() user: User) {
    return this.streamsService.findAll(user.orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get stream by ID' })
  async getStream(@Param('id') id: string) {
    return this.streamsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new live stream' })
  async createStream(@CurrentUser() user: User, @Body() createData: any) {
    return this.streamsService.create({
      ...createData,
      orgId: user.orgId,
    });
  }

  @Put(':id/start')
  @ApiOperation({ summary: 'Start live stream' })
  async startStream(@Param('id') id: string) {
    return this.streamsService.startStream(id);
  }

  @Put(':id/end')
  @ApiOperation({ summary: 'End live stream' })
  async endStream(@Param('id') id: string) {
    return this.streamsService.endStream(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete stream' })
  async deleteStream(@Param('id') id: string) {
    return this.streamsService.delete(id);
  }
}

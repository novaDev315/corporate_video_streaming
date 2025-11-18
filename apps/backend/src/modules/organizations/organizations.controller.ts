import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Organizations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get organization by ID' })
  async getOrganization(@Param('id') id: string) {
    return this.organizationsService.findById(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get organization statistics' })
  async getStats(@Param('id') id: string) {
    return this.organizationsService.getStats(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new organization' })
  async create(@Body() createData: any) {
    return this.organizationsService.create(createData);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update organization' })
  async update(@Param('id') id: string, @Body() updateData: any) {
    return this.organizationsService.update(id, updateData);
  }
}

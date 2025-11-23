import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MultiHostService } from './multi-host.service';
import { HostRole } from '../../database/entities/stream-host.entity';

@ApiTags('Multi-Host')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('streams/:streamId/hosts')
export class MultiHostController {
  constructor(private readonly multiHostService: MultiHostService) {}

  @Post('invite')
  @ApiOperation({ summary: 'Invite a host to stream' })
  async inviteHost(
    @Request() req,
    @Param('streamId') streamId: string,
    @Body()
    body: {
      userId: string;
      role: HostRole;
      displayName?: string;
      permissions?: {
        canSpeak?: boolean;
        canShareScreen?: boolean;
        canManageParticipants?: boolean;
        canManageChat?: boolean;
        canCreatePolls?: boolean;
      };
    },
  ) {
    return this.multiHostService.inviteHost(streamId, req.user.id, body);
  }

  @Get()
  @ApiOperation({ summary: 'Get all hosts for a stream' })
  async getHosts(@Param('streamId') streamId: string) {
    return this.multiHostService.getStreamHosts(streamId);
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active hosts' })
  async getActiveHosts(@Param('streamId') streamId: string) {
    return this.multiHostService.getActiveHosts(streamId);
  }

  @Post(':hostId/accept')
  @ApiOperation({ summary: 'Accept host invitation' })
  async acceptInvitation(@Request() req, @Param('hostId') hostId: string) {
    return this.multiHostService.respondToInvitation(hostId, req.user.id, true);
  }

  @Post(':hostId/decline')
  @ApiOperation({ summary: 'Decline host invitation' })
  async declineInvitation(@Request() req, @Param('hostId') hostId: string) {
    return this.multiHostService.respondToInvitation(hostId, req.user.id, false);
  }

  @Post(':hostId/join')
  @ApiOperation({ summary: 'Join stream as host' })
  async joinStream(@Request() req, @Param('hostId') hostId: string) {
    return this.multiHostService.joinStream(hostId, req.user.id);
  }

  @Post(':hostId/leave')
  @ApiOperation({ summary: 'Leave stream as host' })
  async leaveStream(@Request() req, @Param('hostId') hostId: string) {
    return this.multiHostService.leaveStream(hostId, req.user.id);
  }

  @Put(':hostId/permissions')
  @ApiOperation({ summary: 'Update host permissions' })
  async updatePermissions(
    @Param('hostId') hostId: string,
    @Body()
    body: {
      canSpeak?: boolean;
      canShareScreen?: boolean;
      canManageParticipants?: boolean;
      canManageChat?: boolean;
      canCreatePolls?: boolean;
    },
  ) {
    return this.multiHostService.updateHostPermissions(hostId, body);
  }

  @Put(':hostId/role')
  @ApiOperation({ summary: 'Update host role' })
  async updateRole(
    @Param('hostId') hostId: string,
    @Body() body: { role: HostRole },
  ) {
    return this.multiHostService.updateHostRole(hostId, body.role);
  }

  @Delete(':hostId')
  @ApiOperation({ summary: 'Remove host from stream' })
  async removeHost(@Param('hostId') hostId: string) {
    await this.multiHostService.removeHost(hostId);
    return { message: 'Host removed' };
  }
}

@Controller('invitations')
@ApiTags('Host Invitations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class HostInvitationsController {
  constructor(private readonly multiHostService: MultiHostService) {}

  @Get()
  @ApiOperation({ summary: 'Get pending invitations for current user' })
  async getInvitations(@Request() req) {
    return this.multiHostService.getUserInvitations(req.user.id);
  }
}

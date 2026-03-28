import {
  applyDecorators,
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { SessionService } from 'src/session/services/session.service';
import { UserService } from 'src/users/services/users.service';
import { AuthService } from '../services/auth.service';
import { RequestWithUser } from '../types/request-with-user';
import { RolesGuard } from '../../roles/guards/roles.guard';
import { Role } from '../../roles/decorators/roles.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { RoleType } from '@prisma/client';

@Injectable()
class AuthGuard implements CanActivate {
  constructor(
    private readonly sessionService: SessionService,
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const tokenFromHeader = request.headers.authorization;
    if (!tokenFromHeader) throw new UnauthorizedException();

    const token = this.authService.getToken(tokenFromHeader);
    if (!token) throw new UnauthorizedException();

    try {
      const payload = await this.authService.getJWTPayload(token);
      const validSession = await this.sessionService.findOne(payload.sessionId);
      if (!validSession) throw new UnauthorizedException();

      const userDetails = await this.userService.findById(validSession.userId);
      if (!userDetails) throw new UnauthorizedException();

      if (!userDetails.active) throw new UnauthorizedException();

      request.user = userDetails;
      request.session = validSession;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      Logger.error(errorMessage);
      throw new UnauthorizedException();
    }
    return true;
  }
}

export function ProtectRoute(roleNames: RoleType[] = []) {
  return applyDecorators(
    UseGuards(AuthGuard, RolesGuard),
    ApiBearerAuth(),
    Role(...roleNames),
  );
}

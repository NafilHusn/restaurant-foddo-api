import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RequestWithUser } from '../../auth/types/request-with-user';
import { RoleType } from '@prisma/client';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<RoleType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no roles are strictly required, allow access
    if (!requiredRoles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User is not authenticated');
    }

    const hasRole = requiredRoles.some((role) =>
      user.Role.some((r) => r.name === (role as string)),
    );
    if (!hasRole) {
      throw new ForbiddenException(
        'You do not have the required role to perform this action',
      );
    }

    return true;
  }
}

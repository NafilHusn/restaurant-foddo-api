import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  createParamDecorator,
  applyDecorators,
  UseInterceptors,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestWithUser } from '../../auth/types/request-with-user';
import { RoleType } from '@prisma/client';

@Injectable()
export class CountryScopeHandler implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context
      .switchToHttp()
      .getRequest<RequestWithUser & { countryScope?: string }>();
    const user = request.user;

    if (
      user.Role.every(
        (role) =>
          role.name !== RoleType.ADMIN && role.name !== RoleType.SUPER_ADMIN,
      )
    ) {
      request.countryScope = user.country!;
    }

    return next.handle();
  }
}

export const WithCountryScope = () =>
  applyDecorators(UseInterceptors(CountryScopeHandler));

export const CountryScope = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx
      .switchToHttp()
      .getRequest<RequestWithUser & { countryScope?: string }>();
    return request.countryScope;
  },
);

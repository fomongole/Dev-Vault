import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Override handleRequest so it doesn't throw 401
  handleRequest(err, user, info) {
    // If error or no user, just return null (Guest mode)
    // The controller will decide what to do with a null user
    if (err || !user) {
      return null;
    }
    return user;
  }
}
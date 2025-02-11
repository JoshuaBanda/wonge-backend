import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1]; // Extract token from the 'Authorization' header

    if (!token) {
      throw new ForbiddenException('Authorization token is missing');
    }

    try {
      const decoded = await this.jwtService.verifyAsync(token); // Verify the JWT token
      request.user = decoded; // Attach decoded user info to the request object
      return true; // Allow the request to proceed
    } catch (error) {
      throw new ForbiddenException('Invalid or expired token');
    }
  }
}

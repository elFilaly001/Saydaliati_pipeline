import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../interfaces/auth.interfaces';
import { FirebaseService } from '../../firebase/firebase.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private firebaseService: FirebaseService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user || !user.uid) {
      return false;
    }

    try {
      const userDoc = await this.firebaseService
        .doc('users', user.uid)
        .get();
        
      if (!userDoc.exists) {
        return false;
      }

      const userData = userDoc.data();
      return requiredRoles.includes(userData?.role);
    } catch (error) {
      console.error('Role verification failed:', error);
      return false;
    }
  }
}
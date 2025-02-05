import {
  Injectable,
  UnauthorizedException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { JwtService } from '@nestjs/jwt';
import {
  UserCredentials,
  AuthResponse,
  UserRole,
  TokenData,
  RegisterResponse,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './interfaces/auth.interfaces';
import * as admin from 'firebase-admin';
import { MailService } from '@/mail/mail.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private firebaseService: FirebaseService,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async register(credentials: UserCredentials): Promise<RegisterResponse> {
    try {
      // Create user in Firebase Auth
      const userRecord = await this.firebaseService.auth.createUser({
        email: credentials.email,
        password: credentials.password,
        displayName: credentials.name,
      });

      // Create user document in Firestore
      await this.firebaseService.collection('users').doc(userRecord.uid).set({
        email: userRecord.email,
        role: UserRole.USER,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Generate verification link
      const actionCodeSettings = {
        url: `${process.env.CLIENT_URL}/verify-email`,
        handleCodeInApp: true,
      };

      const emailVerificationLink = await admin
        .auth()
        .generateEmailVerificationLink(userRecord.email!, actionCodeSettings);

      // Send verification email
      await this.mailService.sendVerificationEmail(
        userRecord.email!,
        emailVerificationLink,
        credentials.name,
      );

      return {
        message:
          'Registration successful! Please check your email for verification.',
      };
    } catch (error) {
      this.logger.error('Registration failed:', error);
      throw new BadRequestException(error.message);
    }
  }

  // Login an existing user
  async login(credentials: UserCredentials): Promise<AuthResponse> {
    try {
      // Get user record to check if user exists
      const userRecord = await this.firebaseService.auth.getUserByEmail(credentials.email)
        .catch(() => {
          throw new UnauthorizedException('Invalid credentials');
        });
  
      // Check if email is verified
      if (!userRecord.emailVerified) {
        throw new UnauthorizedException('Email is not verified');
      }
  
      // Get user data from Firestore
      const userDocRef = this.firebaseService.collection('users').doc(userRecord.uid);
      const userDoc = await userDocRef.get();
      if (!userDoc.exists) {
        throw new UnauthorizedException('User not found');
      }
      const userData = userDoc.data();
  
      // Generate JWT token
      const token = this.jwtService.sign({
        sub: userRecord.uid,
        email: userRecord.email,
        role: userData.role,
      } as TokenData);
  
      return {
        token: token ,
        User: {
          name: userRecord.displayName,
          email: userRecord.email,
          role: userData.role,
        },
      };
    } catch (error) {
      this.logger.error('Login failed:', error);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async forgotPassword(data: ForgotPasswordDto): Promise<{ message: string }> {
    try {
      // Verify if user exists
      const userRecord = await this.firebaseService.auth.getUserByEmail(
        data.email,
      );

      // Generate password reset link
      const actionCodeSettings = {
        url: `${process.env.CLIENT_URL}/reset-password`,
        handleCodeInApp: true,
      };

      const resetLink = await admin
        .auth()
        .generatePasswordResetLink(data.email, actionCodeSettings);

      // Send password reset email
      await this.mailService.sendPasswordResetEmail(
        data.email,
        resetLink,
        userRecord.displayName || '',
      );

      return {
        message: 'Password reset instructions have been sent to your email.',
      };
    } catch (error) {
      this.logger.error('Forgot password failed:', error);
      // Don't expose whether the email exists or not for security
      return {
        message:
          'If an account exists, password reset instructions will be sent.',
      };
    }
  }
  async resetPassword(data: ResetPasswordDto): Promise<{ message: string }> {
    try {
      // The token will be a JWT containing the user's email
      const email = await this.extractEmailFromToken(data.token);
      
      // Get user record
      const userRecord = await this.firebaseService.auth.getUserByEmail(email);

      // Update the password
      await this.firebaseService.auth.updateUser(userRecord.uid, {
        password: data.newPassword,
      });

      // Log the password change in Firestore
      await this.firebaseService.collection('users').doc(userRecord.uid).update({
        lastPasswordReset: admin.firestore.FieldValue.serverTimestamp(),
      });

      return {
        message: 'Password has been successfully reset. You can now login.',
      };
    } catch (error) {
      this.logger.error('Reset password failed:', error);
      throw new BadRequestException(
        'Failed to reset password. Please try again.',
      );
    }
  }

  async extractEmailFromToken(token: string): Promise<string> {
    try {
      const decoded = this.jwtService.verify(token);

      if (!decoded.email) {
        throw new Error('Invalid token format');
      }
      
      return decoded.email;
    } catch (error) {
      this.logger.error('Token verification failed:', error);
      throw new BadRequestException('Invalid or expired reset token');
    }
  }

}

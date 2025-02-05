import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { FirebaseService } from '../firebase/firebase.service';
import { JwtService } from '@nestjs/jwt';
import { MailService } from '@/mail/mail.service';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserRole } from './interfaces/auth.interfaces';
import * as admin from 'firebase-admin';

// Mock Firebase Admin
jest.mock('firebase-admin', () => ({
  firestore: {
    FieldValue: {
      serverTimestamp: jest.fn(),
    },
  },
  auth: () => ({
    generateEmailVerificationLink: jest.fn(),
  }),
}));

describe('AuthService', () => {
  let service: AuthService;
  let firebaseService: jest.Mocked<FirebaseService>;
  let jwtService: jest.Mocked<JwtService>;
  let mailService: jest.Mocked<MailService>;

  const mockFirebaseService = {
    auth: {
      createUser: jest.fn(),
      getUserByEmail: jest.fn(),
    },
    collection: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockMailService = {
    sendVerificationEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    firebaseService = module.get(FirebaseService);
    jwtService = module.get(JwtService);
    mailService = module.get(MailService);
  });

  describe('register', () => {
    const mockCredentials = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    const mockUserRecord = {
      uid: 'test-uid',
      email: 'test@example.com',
    };

    const mockDocRef = {
      set: jest.fn(),
    };

    beforeEach(() => {
      mockFirebaseService.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue(mockDocRef),
      });
      mockFirebaseService.auth.createUser.mockResolvedValue(mockUserRecord);
      (admin.auth().generateEmailVerificationLink as jest.Mock).mockResolvedValue('mock-verification-link');
    });

    it('should successfully register a new user', async () => {
      const result = await service.register(mockCredentials);

      expect(mockFirebaseService.auth.createUser).toHaveBeenCalledWith({
        email: mockCredentials.email,
        password: mockCredentials.password,
        displayName: mockCredentials.name,
      });

      expect(mockDocRef.set).toHaveBeenCalledWith({
        email: mockUserRecord.email,
        role: UserRole.USER,
      });

      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(
        mockCredentials.email,
        undefined,
        mockCredentials.name
      );

      expect(result).toEqual({
        message: 'Registration successful! Please check your email for verification.',
      });
    });

    it('should throw BadRequestException when registration fails', async () => {
      const error = new Error('Firebase error');
      mockFirebaseService.auth.createUser.mockRejectedValue(error);

      await expect(service.register(mockCredentials)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('login', () => {
    const mockCredentials = {
      email: 'test@example.com',
      password: 'password123',
    };

    const mockUserRecord = {
      uid: 'test-uid',
      email: 'test@example.com',
      emailVerified: true,
      displayName: 'Test User',
    };

    const mockUserDoc = {
      exists: true,
      data: () => ({
        role: UserRole.USER,
      }),
    };

    beforeEach(() => {
      mockFirebaseService.auth.getUserByEmail.mockResolvedValue(mockUserRecord);
      mockFirebaseService.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockUserDoc),
        }),
      });
      mockJwtService.sign.mockReturnValue('mock-jwt-token');
    });

    it('should successfully login a user', async () => {
      const result = await service.login(mockCredentials);

      expect(mockFirebaseService.auth.getUserByEmail).toHaveBeenCalledWith(
        mockCredentials.email,
      );

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUserRecord.uid,
        email: mockUserRecord.email,
        role: UserRole.USER,
      });

      expect(result).toEqual({
        token: 'mock-jwt-token' ,
        User: {
          name: mockUserRecord.displayName,
          email: mockUserRecord.email,
          role: UserRole.USER,
        },
      });
    });

    it('should throw UnauthorizedException when email is not verified', async () => {
      const unverifiedUser = { ...mockUserRecord, emailVerified: false };
      mockFirebaseService.auth.getUserByEmail.mockResolvedValue(unverifiedUser);

      await expect(service.login(mockCredentials)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when user document does not exist', async () => {
      const mockNonExistentDoc = {
        exists: false,
        data: () => null,
      };

      mockFirebaseService.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue(mockNonExistentDoc),
        }),
      });

      await expect(service.login(mockCredentials)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when login fails', async () => {
      mockFirebaseService.auth.getUserByEmail.mockRejectedValue(
        new Error('Firebase error'),
      );

      await expect(service.login(mockCredentials)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
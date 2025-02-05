import { Test, TestingModule } from '@nestjs/testing';
import { FavoritService } from './favorit.service';
import { FirebaseService } from '@/firebase/firebase.service';
import { AuthService } from '@/auth/auth.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('FavoritService', () => {
  let service: FavoritService;
  let firebaseService: jest.Mocked<FirebaseService>;
  let authService: jest.Mocked<AuthService>;

  const mockFirebaseService = {
    auth: {
      getUserByEmail: jest.fn(),
    },
    collection: jest.fn(),
  };

  const mockAuthService = {
    extractEmailFromToken: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    service = module.get<FavoritService>(FavoritService);
    firebaseService = module.get(FirebaseService);
    authService = module.get(AuthService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('addFavorit', () => {
    it('should successfully add a favorite', async () => {
      const mockToken = 'Bearer token123';
      const mockEmail = 'test@example.com';
      const mockUserId = 'user123';
      const mockFavoritDto = { favorites: ['pharmacy123'] };

      authService.extractEmailFromToken.mockResolvedValue(mockEmail);
      mockFirebaseService.auth.getUserByEmail.mockResolvedValue({ uid: mockUserId });
      mockFirebaseService.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({ favorites: [] }),
          }),
          update: jest.fn().mockResolvedValue(undefined),
        }),
      });

      await service.addFavorit(mockFavoritDto, mockToken);

      expect(authService.extractEmailFromToken).toHaveBeenCalledWith('token123');
      expect(mockFirebaseService.auth.getUserByEmail).toHaveBeenCalledWith(mockEmail);
    });

    it('should throw BadRequestException when user not found', async () => {
      const mockToken = 'Bearer token123';
      const mockEmail = 'test@example.com';
      const mockFavoritDto = { favorites: ['pharmacy123'] };

      authService.extractEmailFromToken.mockResolvedValue(mockEmail);
      mockFirebaseService.auth.getUserByEmail.mockRejectedValue(new Error('User not found'));

      await expect(service.addFavorit(mockFavoritDto, mockToken))
        .rejects
        .toThrow(BadRequestException);
    });

    it('should throw BadRequestException when item already in favorites', async () => {
      const mockToken = 'Bearer token123';
      const mockEmail = 'test@example.com';
      const mockUserId = 'user123';
      const mockFavoritDto = { favorites: ['pharmacy123'] };

      authService.extractEmailFromToken.mockResolvedValue(mockEmail);
      mockFirebaseService.auth.getUserByEmail.mockResolvedValue({ uid: mockUserId });
      mockFirebaseService.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: () => ({ favorites: ['pharmacy123'] }),
          }),
          update: jest.fn().mockRejectedValue(new Error('Item already in favorites')),
        }),
      });

      await expect(service.addFavorit(mockFavoritDto, mockToken))
        .rejects
        .toThrow(BadRequestException);
    });
  });
});

describe('removeFavorit', () => {

  const mockFirebaseService = {
    auth: {
      getUserByEmail: jest.fn(),
    },
    collection: jest.fn(),
  };

  const mockAuthService = {
    extractEmailFromToken: jest.fn(),
  };

  let service: FavoritService;
  let firebaseService: jest.Mocked<FirebaseService>;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    service = module.get<FavoritService>(FavoritService);
    firebaseService = module.get(FirebaseService);
    authService = module.get(AuthService);
  })  

  it('should successfully remove a favorite', async () => {
    const mockToken = 'Bearer token123';
    const mockEmail = 'test@example.com';
    const mockUserId = 'user123';
    const mockFavoritDto = { favorites: ['pharmacy123'] };

    authService.extractEmailFromToken.mockResolvedValue(mockEmail);
    mockFirebaseService.auth.getUserByEmail.mockResolvedValue({ uid: mockUserId });
    mockFirebaseService.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({ favorites: ['pharmacy123'] }),
        }),
      }),
    });
  })


  it('should throw BadRequestException when user not found', async () => {
    const mockToken = 'Bearer token123';
    const mockEmail = 'test@example.com';
    const mockFavoritDto = { favorites: ['pharmacy123'] };

    authService.extractEmailFromToken.mockResolvedValue(mockEmail);
    mockFirebaseService.auth.getUserByEmail.mockRejectedValue(new Error('User not found'));
  })


  it('should throw BadRequestException when item not in favorites', async () => {
    const mockToken = 'Bearer token123';
    const mockUserId = 'user123';
    const mockEmail = 'test@example.com';
    const mockFavoritDto = { favorites: ['pharmacy123'] };

    authService.extractEmailFromToken.mockResolvedValue(mockEmail);
    mockFirebaseService.auth.getUserByEmail.mockResolvedValue({ uid: mockUserId });
    mockFirebaseService.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({ favorites: [] }),
        }),
      }),
    });

    await expect(service.removeFavorit(mockFavoritDto, mockToken))
      .rejects
      .toThrow(BadRequestException);
  })
})

describe('getFavorites', () => {

  const mockFirebaseService = {
    auth: {
      getUserByEmail: jest.fn(),
    },
    collection: jest.fn(),
  };

  const mockAuthService = {
    extractEmailFromToken: jest.fn(),
  };

  let service: FavoritService;
  let firebaseService: jest.Mocked<FirebaseService>;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritService,
        {
          provide: FirebaseService,
          useValue: mockFirebaseService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    service = module.get<FavoritService>(FavoritService);
    firebaseService = module.get(FirebaseService);
    authService = module.get(AuthService);
  })

  it('should successfully get favorites', async () => {
    const mockToken = 'Bearer token123';
    const mockEmail = 'test@example.com';
    const mockUserId = 'user123';
    const mockFavoritDto = { favorites: ['pharmacy123'] };

    authService.extractEmailFromToken.mockResolvedValue(mockEmail);
    mockFirebaseService.auth.getUserByEmail.mockResolvedValue({ uid: mockUserId });
    mockFirebaseService.collection.mockReturnValue({
      doc: jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({ favorites: ['pharmacy123'] }),
        }),
      }),
    });
  })
})


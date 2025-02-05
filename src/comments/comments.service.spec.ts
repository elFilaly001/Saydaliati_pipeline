import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { FirebaseService } from '@/firebase/firebase.service';
import { AuthService } from '@/auth/auth.service';
import { NotFoundException } from '@nestjs/common';

describe('CommentsService', () => {
  let service: CommentsService;
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
        CommentsService,
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

    service = module.get<CommentsService>(CommentsService);
    firebaseService = module.get(FirebaseService);
    authService = module.get(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createComment', () => {
    it('should successfully create a comment', async () => {
      const mockToken = 'Bearer token123';
      const mockEmail = 'test@example.com';
      const mockUserId = 'user123';
      const mockCommentDto = {
        pharmacyId: 'pharmacy123',
        comment: 'Great service!',
        stars: 5,
        createdAt: new Date()
      };

      authService.extractEmailFromToken.mockResolvedValue(mockEmail);
      mockFirebaseService.auth.getUserByEmail.mockResolvedValue({ uid: mockUserId });
      mockFirebaseService.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: true,
          }),
          collection: jest.fn().mockReturnValue({
            add: jest.fn().mockResolvedValue({ id: 'comment123' }),
          }),
        }),
      });

      const result = await service.createComment(mockCommentDto, mockToken);
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when pharmacy not found', async () => {
      const mockToken = 'Bearer token123';
      const mockEmail = 'test@example.com';
      const mockCommentDto = {
        pharmacyId: 'nonexistent',
        comment: 'Test',
        stars: 5,
        createdAt: new Date()
      };

      authService.extractEmailFromToken.mockResolvedValue(mockEmail);
      mockFirebaseService.auth.getUserByEmail.mockResolvedValue({ uid: 'user123' });
      mockFirebaseService.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: false,
          }),
        }),
      });

      await expect(service.createComment(mockCommentDto, mockToken))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('getComments', () => {
    it('should successfully get comments', async () => {
      const mockPharmacyId = 'pharmacy123';
      const mockComments = [
        { id: 'comment123', text: 'Great service!', stars: 5 }
      ];

      mockFirebaseService.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: true,
          }),
          collection: jest.fn().mockReturnValue({
            get: jest.fn().mockResolvedValue({
              docs: mockComments.map(comment => ({
                data: () => comment
              }))
            })
          })
        })
      });

      const result = await service.getComments(mockPharmacyId);
      expect(result).toEqual(mockComments);
    });

    it('should throw NotFoundException when pharmacy not found', async () => {
      const mockPharmacyId = 'nonexistent';

      mockFirebaseService.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: false,
          }),
        }),
      });
      await expect(service.getComments(mockPharmacyId))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('deleteComment', () => {
    it('should successfully delete a comment', async () => {
      const mockPharmacyId = 'pharmacy123';
      const mockCommentId = 'comment123';
      const mockToken = 'Bearer token123';
      const mockEmail = 'test@example.com';
      const mockUserId = 'user123';

      authService.extractEmailFromToken.mockResolvedValue(mockEmail);
      mockFirebaseService.auth.getUserByEmail.mockResolvedValue({ uid: mockUserId });

      const mockCommentData = {
        exists: true,
        data: () => ({
          userId: mockUserId,
          comment: 'Test comment',
          stars: 5
        }),
        ref: {
          delete: jest.fn().mockResolvedValue(undefined)
        }
      };

      mockFirebaseService.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            doc: jest.fn().mockReturnValue({
              get: jest.fn().mockResolvedValue(mockCommentData),
              delete: jest.fn().mockResolvedValue(undefined),
            })
          })
        })
      });

      await service.deleteComment(mockPharmacyId, mockCommentId, mockToken);

      expect(mockFirebaseService.collection).toHaveBeenCalledWith('pharmacies');
    });

    it('should throw NotFoundException when comment not found', async () => {
      const mockPharmacyId = 'pharmacy123';
      const mockCommentId = 'nonexistent';
      const mockToken = 'Bearer token123';
      const mockEmail = 'test@example.com';
      const mockUserId = 'user123';

      authService.extractEmailFromToken.mockResolvedValue(mockEmail);
      mockFirebaseService.auth.getUserByEmail.mockResolvedValue({ uid: mockUserId });
      mockFirebaseService.collection.mockReturnValue({
        doc: jest.fn().mockReturnValue({
          collection: jest.fn().mockReturnValue({
            doc: jest.fn().mockReturnValue({
              get: jest.fn().mockResolvedValue({
                exists: false
              })
            })
          })
        })
      });

      await expect(service.deleteComment(mockPharmacyId, mockCommentId, mockToken))
        .rejects
        .toThrow(NotFoundException);
    });

    it('should throw NotFoundException when user not found', async () => {
      const mockPharmacyId = 'pharmacy123';
      const mockCommentId = 'comment123';
      const mockToken = 'Bearer token123';
      const mockEmail = 'test@example.com';

      authService.extractEmailFromToken.mockResolvedValue(mockEmail);
      mockFirebaseService.auth.getUserByEmail.mockRejectedValue(new Error('User not found'));

      await expect(service.deleteComment(mockPharmacyId, mockCommentId, mockToken))
        .rejects
        .toThrow(NotFoundException);
    });
  });
});


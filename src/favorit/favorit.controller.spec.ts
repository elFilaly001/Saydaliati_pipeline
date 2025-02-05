import { Test, TestingModule } from '@nestjs/testing';
import { FavoritController } from './favorit.controller';
import { FavoritService } from './favorit.service';
import { FirebaseService } from '@/firebase/firebase.service';
import { AuthService } from '@/auth/auth.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FavoritDto } from './dto/favorit.dto';

describe('FavoritController', () => {
  let controller: FavoritController;
  let favoritService: jest.Mocked<FavoritService>;

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
      controllers: [FavoritController],
      providers: [
        {
          provide: FavoritService,
          useValue: {
            addFavorit: jest.fn(),
            removeFavorit: jest.fn(),
            getFavorites: jest.fn(),
          }
        },
        {
          provide: FirebaseService,
          useValue: mockFirebaseService
        },
        {
          provide: AuthService,
          useValue: mockAuthService
        }
      ],
    }).compile();

    controller = module.get<FavoritController>(FavoritController);
    favoritService = module.get(FavoritService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('addFavorit', () => {
    it('should call favoritService.addFavorit', async () => {
      const dto: FavoritDto = { favorites: ['123'] };
      const token = 'Bearer token';

      await controller.addFavorit(dto, token);
      expect(favoritService.addFavorit).toHaveBeenCalledWith(dto, token);
    });

    it('should call favoritService.removeFavorit', async () => {
      const dto: FavoritDto = { favorites: ['123'] };
      const token = 'Bearer token';

      await controller.removeFavorit(dto, token);
      expect(favoritService.removeFavorit).toHaveBeenCalledWith(dto, token);
    });

    it('should call favoritService.getFavorites', async () => {
      const token = 'Bearer token';

      await controller.getFavorites(token);
      expect(favoritService.getFavorites).toHaveBeenCalledWith(token);
    });

  });
});

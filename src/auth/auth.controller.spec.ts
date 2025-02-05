import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserCredentials } from './interfaces/auth.interfaces';
import { RegisterDto } from './dto/auth.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register with credentials', async () => {
      const credentials: RegisterDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      await controller.register(credentials);
      expect(authService.register).toHaveBeenCalledWith(credentials);
    });
  });

  describe('login', () => {
    it('should call authService.login with credentials', async () => {
      const credentials: UserCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      await controller.login(credentials);
      expect(authService.login).toHaveBeenCalledWith(credentials);
    });
  });
});
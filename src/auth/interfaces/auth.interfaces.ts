export interface UserCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface RegisterResponse {
  message: string;
}
export interface AuthResponse {
  User: Omit<UserData, 'isVerified' | 'uid'>;
  token: string;
}

export interface UserData {
  uid: string;
  email: string;
  role: UserRole;
  name: string;
  isVerified: boolean;
}

export interface TokenData {
  sub: string;
  email: string;
  role: UserRole;
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

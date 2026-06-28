export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  fullName: string;
}

export interface RequestUser {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
}

import type { JwtPayload } from 'jsonwebtoken';

import type {
  UserRole,
} from '#/types/domain/user'

export interface RefreshTokenPayload extends JwtPayload {
  sub: string;
  jti: string;
}

export interface AccessTokenPayload extends JwtPayload {
  sub: string;
  role: UserRole
}

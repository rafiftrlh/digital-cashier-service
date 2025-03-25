import { Role } from '@prisma/client';

declare module 'express-session' {
  interface SessionData {
    user?: {
      id: number;
      username: string;
      role: Role;
    };
  }
}

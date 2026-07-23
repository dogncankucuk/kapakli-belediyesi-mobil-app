import 'express-session';

import { AdminRole } from '../../modules/admin-users/admin-role.enum';

declare module 'express-session' {
  interface SessionData {
    adminUser?: {
      email: string;
      role: AdminRole;
    };
  }
}

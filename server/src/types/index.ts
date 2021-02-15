import { EntityManager } from "@mikro-orm/core";
import { Request, Response } from 'express';
import session from 'express-session';

declare module "express-session" {
  interface Session {
    userId?: number;
  }
}

export type MyContext = {
  em:  EntityManager<any> & EntityManager;
  req: Request & { session: session.Session };
  res: Response;
}

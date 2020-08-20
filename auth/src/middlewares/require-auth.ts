import { Request, Response, NextFunction } from 'express';

import { NotAuthorizedError } from '../errors/not-authorized-error';

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /*
   let's assume that we always call this middleware at 
   some point after current-user middleware, so by 
   the time we are here, we've already checked the validity of the JWT:
   - if it's valid then there will be req.currentUser field on the Request object
   - if it's NOT valid then req.currentUser will be undefined
  */
  if (!req.currentUser) throw new NotAuthorizedError();

  // if no error go next middleware function
  next();
};
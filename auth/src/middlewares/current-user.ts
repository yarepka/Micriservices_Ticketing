import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// check if user logged in

// does this user have a 'req.session.jwt' set?

// if it is not set, or if the JWT is invalid go to the
// next middleware function

// if yes, and JWT is valid, set new field on the 
// request object req.currentUser 

interface UserPayload {
  id: string;
  email: string;
}

// modifying existing interface
declare global {
  namespace Express {
    // inside express find Request interface which
    // is already created and add the new optional 
    // field "currentUser"
    interface Request {
      currentUser?: UserPayload;
    }
  }
}

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction) => {
  // check if jwt exists
  // same as !req.session || !res.session.jwt
  if (!req.session?.jwt) {
    return next();
  }

  try {
    // TS thinks that JWT_KEY might be undefined, but
    // we've already checked it in the app.ts file in
    // the start() function, so add "!" symbol in the 
    // end of process.env.JWT_KEY
    const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!) as UserPayload;
    req.currentUser = payload;
  } catch (err) { }

  next();
}
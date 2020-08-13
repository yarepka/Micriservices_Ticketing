import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../errors/custom-error';

// Common Response Structure
/*
  {
    errors {
      message: string, field?: string
    }[]
  }
*/

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction) => {
  if (err instanceof CustomError) {
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  res.status(400).send({
    errors: [{ message: 'Something went wrong' }]
  });
}
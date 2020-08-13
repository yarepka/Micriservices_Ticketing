export abstract class CustomError extends Error {
  // by writing abstract here we mean subclasses must
  // implement this field
  abstract statusCode: number;

  constructor(message: string) {
    super(message);

    // Only because we are extending a build in class
    Object.setPrototypeOf(this, CustomError.prototype);
  }

  abstract serializeErrors(): { message: string; field?: string }[];
};
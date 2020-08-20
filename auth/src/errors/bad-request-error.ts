import { CustomError } from './custom-error';

// - 'Invalid credentials' were entered to the 
// Sign In form
// - 'Email in use' wheneve trying to sign up
export class BadRequestError extends CustomError {
  statusCode = 400;

  constructor(public message: string) {
    super(message);

    // Only because we are extending a build in class
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
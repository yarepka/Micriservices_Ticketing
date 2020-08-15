import { scrypt, randomBytes } from 'crypto';
// turns scrypt (callback base function) and turn it
// into promise based implementation, so it'll be
// possible to use it with async&await
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export class Password {
  static async toHash(password: string) {
    // generate salt
    const salt = randomBytes(8).toString('hex');
    // 64 means string will be 64 bytes, it'll be 
    // converted to hex, so it'll be 64*2=128 characters long
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;

    return `${buf.toString('hex')}.${salt}`;
  }

  static async compare(storedPassword: string, suppliedPassword: string) {
    const [hashedPassword, salt] = storedPassword.split('.');
    const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;

    return buf.toString('hex') === hashedPassword;
  }
}
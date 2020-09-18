import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import request from 'supertest';

// tell ts we has global property "signin"
declare global {
  namespace NodeJS {
    interface Global {
      signin(): Promise<string[]>
    }
  }
}

// this function will be assigned to global scope
// so we can easily use it from our different test files
// but it'll not be available in NOT testing environment

global.signin = async () => {
  jest.setTimeout(30000);
  const email = 'test@test.com';
  const password = 'password';

  // sign up
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email, password
    })
    .expect(201)

  // extract the cookie
  const cookie = response.get('Set-Cookie');

  return cookie;
};

let mongo: any;
// will run before all test executed
beforeAll(async () => {
  process.env.JWT_KEY = 'asdfasdf';
  // creating an instance of mongodb in memory
  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

// will run before each of test
beforeEach(async () => {
  // reach to mongodb database and reset/remove
  // the data there, so each test will have empty
  // db data to start with
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

// will run after all test complete
afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});
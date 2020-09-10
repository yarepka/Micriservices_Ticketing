import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';


// tell ts we has global property "signin"
declare global {
  namespace NodeJS {
    interface Global {
      signin(): string[];
    }
  }
}

// Mocking(Facking) imports with Jest
// so if any file is trying to import a real 
// nats-wrapper file, the import will be redirected
// to the mock file
jest.mock('../nats-wrapper');

// this function will be assigned to global scope
// so we can easily use it from our different test files
// but it'll not be available in NOT testing environment

global.signin = () => {
  // Build a JWT payload. { id, email }
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com'
  };

  // Create the JWT! 
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build a session object { jwt: MY_JWT }
  const session = { jwt: token };

  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // return an array with a string thats the cookie with the encoded data
  return [`express:sess=${base64}`];
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
  // clear Mocks data before each test
  jest.clearAllMocks();

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
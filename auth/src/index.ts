import express from 'express';
// makes it available to throw errors in async functions
import 'express-async-errors';
import { json } from 'body-parser';
import mongoose from 'mongoose';
import cookieSession from 'cookie-session';

import { currentUserRouter } from './routes/current-user';
import { signinRouter } from './routes/signin';
import { signoutRouter } from './routes/signout';
import { signupRouter } from './routes/signup';
import { errorHandler } from './middlewares/error-handler';
import { NotFoundError } from './errors/not-found-error';

const app = express();
app.use(json());
// truffic being proxied through ingress and express
// will see that and by default it will not trust this
// http connection, here we make express to be aware of
// proxy 
app.set('trust proxy', true);

/*
A user session can be stored in two main ways with cookies: on the server or on the client. This module stores the session data on the client within a cookie, while a module like express-session stores only a session identifier on the client within a cookie and stores the session data on the server, typically in a database.
 */
app.use(
  cookieSession({
    signed: false, // disable enryption because we use JWT
    // cookies will only be used if user visiting our app over
    // https connection
    secure: true
  })
)

app.use(currentUserRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(signupRouter);

// if user entered the route which is not specified at 
// the top, then throw the NotFoundError, so errorHandler
// will process it.
app.all('*', async (req, res, next) => {
  throw new NotFoundError();
})

app.use(errorHandler);

const start = async () => {
  // check if environment variable defined
  if (!process.env.JWT_KEY) {
    throw new Error('JWT_KEY must be defined');
  }

  try {
    // connecting to database
    await mongoose.connect('mongodb://auth-mongo-srv:27017/auth', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    });

    console.log('Connected to MongoDb');
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => {
    console.log('Listening on port 3000');
  });
}

start();


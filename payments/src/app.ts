import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { errorHandler, NotFoundError, currentUser } from '@yarepkatickets/common';
import { createChargeRouter } from './routes/new';

const app = express();

// traffic being proxied through ingress and express
// will see that and by default it will not trust this
// http connection, here we make express to be aware of
// proxy 
app.set('trust proxy', true);
app.use(json());

/*
A user session can be stored in two main ways with cookies: on the server or on the client. This module stores the session data on the client within a cookie, while a module like express-session stores only a session identifier on the client within a cookie and stores the session data on the server, typically in a database.
 */
app.use(
  cookieSession({
    signed: false, // disable enryption because we use JWT
    // cookies will only be shared if user visiting our app over
    // https connection
    //secure: process.env.NODE_ENV !== 'test',
    secure: false,
  })
);
app.use(currentUser);

// Add routes
app.use(createChargeRouter);

// if user entered the route which is not specified at 
// the top, then throw the NotFoundError, so errorHandler
// will process it.
app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };

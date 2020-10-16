import express from 'express';
// makes it available to throw errors in async functions
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';

import { currentUser } from '@yarepkatickets/common';
import { errorHandler, NotFoundError } from '@yarepkatickets/common';

import { deleteOrderRouter } from './routes/delete';
import { indexOrderRouter } from './routes/index';
import { newOrderRouter } from './routes/new';
import { showOrderRouter } from './routes/show';

const app = express();
app.use(json());
// traffic being proxied through ingress and express
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
    // cookies will only be shared if user visiting our app over
    // https connection
    //secure: process.env.NODE_ENV !== 'test'
    secure: false,
  })
)

app.use(currentUser);

app.use(deleteOrderRouter);
app.use(indexOrderRouter);
app.use(newOrderRouter);
app.use(showOrderRouter);

// if user entered the route which is not specified at 
// the top, then throw the NotFoundError, so errorHandler
// will process it.
app.all('*', async (req, res, next) => {
  throw new NotFoundError();
})

app.use(errorHandler);

export { app };
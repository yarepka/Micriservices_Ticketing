import request from 'supertest';
import { app } from '../../app';

it('returns a 201 on successful signup', async () => {
  return request(app)
    .post('/api/users/signup')
    // provide body
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);
});

it('returns a 400 with invalid email', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'gdsfhgdhf',
      password: 'password'
    })
    .expect(400);
});


it('returns a 400 with invalid password', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'p'
    })
    .expect(400);
});


it('returns a 400 with missing email and password', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com'
    })
    .expect(400);

  await request(app)
    .post('/api/users/signup')
    .send({
      password: 'password'
    })
    .expect(400);
});

it('disallows duplicate emails', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);

  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(400);
});

it('sets a cookie after successful signup', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);

  // inspect the header of the response

  // we need to change 'secure: true' to 
  // 'secure: process.env.NODE_ENV !== 'test''
  // in the 'cookie-session' set up in app.ts
  expect(response.get('Set-Cookie')).toBeDefined();
});
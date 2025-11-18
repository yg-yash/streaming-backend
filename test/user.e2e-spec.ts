import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { USERS_COLLECTION } from '../src/config';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let dbConnection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    dbConnection = moduleFixture.get<Connection>(getConnectionToken());

    // Log routes for debugging
    console.log('Registered routes in UserController (e2e):');
    const server = app.getHttpServer();
    const router = server._events.request._router;
    if (router && router.stack) {
      router.stack.forEach(function(r: any) {
        if (r.route && r.route.path) {
          console.log(`${Object.keys(r.route.methods)[0].toUpperCase()} ${r.route.path}`);
        }
      });
    }
  });

  afterAll(async () => {
    await app.close();
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  beforeEach(async () => {
  });

  describe('/user (POST)', () => {
    it('should create a new user', async () => {
      const uniqueUsername = `testuser-${Date.now()}`;
      const response = await request.default(app.getHttpServer())
        .post('/user')
        .send({ username: uniqueUsername, favoriteGenres: ['Action'], dislikedGenres: ['Romance'] })
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.username).toEqual(uniqueUsername);
      expect(response.body.favoriteGenres).toEqual(['Action']);
      expect(response.body.dislikedGenres).toEqual(['Romance']);
      expect(response.body).toHaveProperty('watchHistory');
      expect(response.body.watchHistory).toEqual([]);
    });

    it('should return 409 if username already exists', async () => {
      const existingUsername = `existinguser-${Date.now()}`;
      await request.default(app.getHttpServer())
        .post('/user')
        .send({ username: existingUsername })
        .expect(201);

      await request.default(app.getHttpServer())
        .post('/user')
        .send({ username: existingUsername })
        .expect(409)
        .expect({ statusCode: 409, message: 'Username already exists', error: 'Conflict' });
    });
  });

  describe('/user (GET)', () => {
    it('should retrieve user details by username', async () => {
      const usernameToFetch = `fetchuser-${Date.now()}`;
      await request.default(app.getHttpServer())
        .post('/user')
        .send({ username: usernameToFetch, favoriteGenres: ['SciFi'], dislikedGenres: [], watchHistory: [] })
        .expect(201);

      const response = await request.default(app.getHttpServer())
        .get('/user')
        .query({ username: usernameToFetch })
        .expect(200);

      expect(response.body).toHaveProperty('_id');
      expect(response.body).toHaveProperty('username');
      expect(response.body.username).toEqual(usernameToFetch);
      expect(response.body).toHaveProperty('favoriteGenres');
      expect(Array.isArray(response.body.favoriteGenres)).toBe(true);
      expect(response.body).toHaveProperty('dislikedGenres');
      expect(Array.isArray(response.body.dislikedGenres)).toBe(true);
      expect(response.body).toHaveProperty('watchHistory');
      expect(Array.isArray(response.body.watchHistory)).toBe(true);
    });

    it('should return 404 if user not found', async () => {
      const nonExistentUsername = `nonexistent-${Date.now()}`;
      await request.default(app.getHttpServer())
        .get('/user')
        .query({ username: nonExistentUsername })
        .expect(404)
        .expect({ statusCode: 404, message: 'User not found', error: 'Not Found' });
    });
  });

  describe('DELETE /user/:username', () => {
    it('should delete a user by username', async () => {
      const usernameToDelete = `deleteme-${Date.now()}`;
      await request.default(app.getHttpServer())
        .post('/user')
        .send({ username: usernameToDelete })
        .expect(201);

      await request.default(app.getHttpServer())
        .delete(`/user/${usernameToDelete}`)
        .expect(200)
        .expect({ message: 'User deleted successfully' });

      expect(await request.default(app.getHttpServer())
        .get('/user')
        .query({ username: usernameToDelete })
        .expect(404));
    });

    it('should return 404 if user to delete not found', async () => {
      const nonExistentUsername = `nonexistentdelete-${Date.now()}`;
      await request.default(app.getHttpServer())
        .delete(`/user/${nonExistentUsername}`)
        .expect(404)
        .expect({ statusCode: 404, message: 'User not found', error: 'Not Found' });
    });
  });
});

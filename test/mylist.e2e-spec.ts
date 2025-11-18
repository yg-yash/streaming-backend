import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { MOVIES_COLLECTION, TVSHOWS_COLLECTION, USERS_COLLECTION, MYLISTITEMS_COLLECTION } from '../src/config';

describe('MyListController (e2e)', () => {
  let app: INestApplication;
  let dbConnection: Connection;
  let testUser: any;
  let testMovie: any;
  let testTvShow: any;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    dbConnection = moduleFixture.get<Connection>(getConnectionToken());

    console.log('Registered routes in MyListController (e2e):');
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
    const uniqueUsername = `testuser-${Date.now()}`;
    const userResponse = await request.default(app.getHttpServer())
      .post('/user')
      .send({ username: uniqueUsername, favoriteGenres: ['Action'], dislikedGenres: [] })
      .expect(201);
    testUser = userResponse.body;

    const contentResponse = await request.default(app.getHttpServer())
      .get('/content')
      .expect(200);

    const movies = contentResponse.body.data.filter((item: any) => item.director !== undefined);
    const tvShows = contentResponse.body.data.filter((item: any) => item.episodes !== undefined);

    movies.sort((a: any, b: any) => a.title.localeCompare(b.title));
    tvShows.sort((a: any, b: any) => a.title.localeCompare(b.title));

    testMovie = movies[0];
    testTvShow = tvShows[0];

    if (!testMovie) throw new Error('No movie found for testing. Run npm run seed.');
    if (!testTvShow) throw new Error('No TV show found for testing. Run npm run seed.');
  });

  describe('/mylist (POST)', () => {
    it('should add a movie to my list', async () => {
      const response = await request.default(app.getHttpServer())
        .post('/mylist')
        .send({ username: testUser.username, contentId: testMovie._id })
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.userId).toEqual(testUser._id);
      expect(response.body.contentId).toEqual(testMovie._id);
      expect(response.body.contentType).toEqual('Movie');
    });

    it('should add a TV show to my list', async () => {
      const response = await request.default(app.getHttpServer())
        .post('/mylist')
        .send({ username: testUser.username, contentId: testTvShow._id })
        .expect(201);

      expect(response.body).toHaveProperty('_id');
      expect(response.body.userId).toEqual(testUser._id);
      expect(response.body.contentId).toEqual(testTvShow._id);
      expect(response.body.contentType).toEqual('TVShow');
    });

    it('should return 404 if user not found', async () => {
      const nonExistentUsername = `nonexistent-${Date.now()}`;
      await request.default(app.getHttpServer())
        .post('/mylist')
        .send({ username: nonExistentUsername, contentId: testMovie._id })
        .expect(404)
        .expect({ statusCode: 404, message: 'User not found', error: 'Not Found' });
    });

    it('should return 404 if content not found', async () => {
      const nonExistentContentId = '60c72b2f9b1e8b0015b6d3d4'; // A valid-looking but non-existent ID
      await request.default(app.getHttpServer())
        .post('/mylist')
        .send({ username: testUser.username, contentId: nonExistentContentId })
        .expect(404)
        .expect({ statusCode: 404, message: 'Content not found (movie or tvshow)', error: 'Not Found' });
    });

    it('should return 409 if item already in list', async () => {
      await request.default(app.getHttpServer())
        .delete(`/mylist/${testUser.username}/${testMovie._id}`)
        .expect(404);

      await request.default(app.getHttpServer())
        .post('/mylist')
        .send({ username: testUser.username, contentId: testMovie._id })
        .expect(201);

      await request.default(app.getHttpServer())
        .post('/mylist')
        .send({ username: testUser.username, contentId: testMovie._id })
        .expect(409)
        .expect({ statusCode: 409, message: 'Item already in my list', error: 'Conflict' });
    });
  });

  describe('/mylist (GET)', () => {
    it('should retrieve all items in my list with pagination', async () => {
      await request.default(app.getHttpServer())
        .delete(`/mylist/${testUser.username}/${testMovie._id}`)
        .expect(404);
      await request.default(app.getHttpServer())
        .delete(`/mylist/${testUser.username}/${testTvShow._id}`)
        .expect(404);

      await request.default(app.getHttpServer())
        .post('/mylist')
        .send({ username: testUser.username, contentId: testMovie._id })
        .expect(201);

      await request.default(app.getHttpServer())
        .post('/mylist')
        .send({ username: testUser.username, contentId: testTvShow._id })
        .expect(201);

      const response = await request.default(app.getHttpServer())
        .get('/mylist')
        .query({ username: testUser.username, page: 1, limit: 1 })
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(response.body.total).toBeGreaterThanOrEqual(2);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(1);
      expect(response.body.totalPages).toBeGreaterThanOrEqual(1);
      expect(response.body.data[0]).toHaveProperty('contentDetails');
      expect(response.body.data[0].contentDetails).toHaveProperty('title');
    });

    it('should retrieve an empty list if no items are present', async () => {
      const newUserUsername = `emptytestuser-${Date.now()}`;
      await request.default(app.getHttpServer())
        .post('/user')
        .send({ username: newUserUsername, favoriteGenres: [], dislikedGenres: [] })
        .expect(201);

      const response = await request.default(app.getHttpServer())
        .get('/mylist')
        .query({ username: newUserUsername, page: 1, limit: 10 })
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
      expect(response.body.total).toBe(0);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(10);
      expect(response.body.totalPages).toBe(0);
    });

    it('should return 404 if user not found', async () => {
      const nonExistentUsername = `nonexistent-${Date.now()}`;
      await request.default(app.getHttpServer())
        .get('/mylist')
        .query({ username: nonExistentUsername, page: 1, limit: 10 })
        .expect(404)
        .expect({ statusCode: 404, message: 'User not found', error: 'Not Found' });
    });

    it('should handle pagination correctly for multiple pages', async () => {
      await request.default(app.getHttpServer())
        .delete(`/mylist/${testUser.username}/${testMovie._id}`)
        .expect(404);

      const allMoviesResponse = await request.default(app.getHttpServer()).get('/content?type=Movie&page=1&limit=3');
      const movies = allMoviesResponse.body.data;
      const movie2 = movies[1];
      const movie3 = movies[2];

      if (!movie2 || !movie3 || movie2._id === testMovie._id || movie3._id === testMovie._id) {
        throw new Error('Could not find distinct movies for pagination tests. Seed data or sorting might be an issue.');
      }

      await request.default(app.getHttpServer())
        .post('/mylist')
        .send({ username: testUser.username, contentId: testMovie._id })
        .expect(201);

      await request.default(app.getHttpServer())
        .post('/mylist')
        .send({ username: testUser.username, contentId: movie2._id })
        .expect(201);
      await request.default(app.getHttpServer())
        .post('/mylist')
        .send({ username: testUser.username, contentId: movie3._id })
        .expect(201);

      const responsePage1 = await request.default(app.getHttpServer())
        .get('/mylist')
        .query({ username: testUser.username, page: 1, limit: 2 })
        .expect(200);

      expect(Array.isArray(responsePage1.body.data)).toBe(true);
      expect(responsePage1.body.data.length).toBeGreaterThanOrEqual(2);
      expect(responsePage1.body.total).toBeGreaterThanOrEqual(3);
      expect(responsePage1.body.page).toBe(1);
      expect(responsePage1.body.limit).toBe(2);
      expect(responsePage1.body.totalPages).toBeGreaterThanOrEqual(2);

      const responsePage2 = await request.default(app.getHttpServer())
        .get('/mylist')
        .query({ username: testUser.username, page: 2, limit: 2 })
        .expect(200);

      expect(Array.isArray(responsePage2.body.data)).toBe(true);
      expect(responsePage2.body.data.length).toBeGreaterThanOrEqual(1);
      expect(responsePage2.body.total).toBeGreaterThanOrEqual(3);
      expect(responsePage2.body.page).toBe(2);
      expect(responsePage2.body.limit).toBe(2);
      expect(responsePage2.body.totalPages).toBeGreaterThanOrEqual(2);
    });
  });

  describe('DELETE /mylist/:username/:contentId', () => {
    it('should remove an item from my list', async () => {
      await request.default(app.getHttpServer())
        .post('/mylist')
        .send({ username: testUser.username, contentId: testMovie._id })
        .expect(201);

      let response = await request.default(app.getHttpServer())
        .get('/mylist')
        .query({ username: testUser.username })
        .expect(200);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data.some((item: any) => item.contentId === testMovie._id)).toBe(true);

      await request.default(app.getHttpServer())
        .delete(`/mylist/${testUser.username}/${testMovie._id}`)
        .expect(200)
        .expect({ message: 'Item removed successfully' });

      response = await request.default(app.getHttpServer())
        .get('/mylist')
        .query({ username: testUser.username })
        .expect(200);
      expect(response.body.data.some((item: any) => item.contentId === testMovie._id)).toBe(false);
    });

    it('should return 404 if item not found in list', async () => {
      const nonExistentContentId = '60c72b2f9b1e8b0015b6d3d4'; // A valid-looking but non-existent ID
      await request.default(app.getHttpServer())
        .delete(`/mylist/${testUser.username}/${nonExistentContentId}`)
        .expect(404)
        .expect({ statusCode: 404, message: 'Item not found in my list', error: 'Not Found' });
    });

    it('should return 404 if user not found', async () => {
      const nonExistentUsername = `nonexistentuser-${Date.now()}`;
      await request.default(app.getHttpServer())
        .delete(`/mylist/${nonExistentUsername}/${testMovie._id}`)
        .expect(404)
        .expect({ statusCode: 404, message: 'User not found', error: 'Not Found' });
    });
  });
});

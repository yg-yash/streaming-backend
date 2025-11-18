import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { MOVIES_COLLECTION, TVSHOWS_COLLECTION } from '../src/config';

describe('ContentController (e2e)', () => {
  let app: INestApplication;
  let dbConnection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    dbConnection = moduleFixture.get<Connection>(getConnectionToken());
  });

  afterAll(async () => {
    await app.close();
    await new Promise(resolve => setTimeout(resolve, 500));
  });

  describe('/content (GET)', () => {
    it('should retrieve all movies and TV shows if no type is specified', async () => {
      const response = await request.default(app.getHttpServer())
        .get('/content')
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(response.body.total).toBeGreaterThanOrEqual(4);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(10);
      expect(response.body.totalPages).toBeGreaterThanOrEqual(1);
      expect(response.body.data.map((item: any) => item.title)).toEqual(expect.arrayContaining([
        'The Shawshank Redemption', 'The Godfather', 'The Dark Knight', 'Inception'
      ]));
    });

    it('should return only movies if type is Movie', async () => {
      const response = await request.default(app.getHttpServer())
        .get('/content')
        .query({ type: 'Movie' })
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(4);
      expect(response.body.total).toBe(4);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(10);
      expect(response.body.totalPages).toBe(Math.ceil(4 / 10));
      expect(response.body.data.map((item: any) => item.title)).toEqual(expect.arrayContaining([
        'The Shawshank Redemption', 'The Godfather', 'The Dark Knight', 'Inception'
      ]));
    });

    it('should return only TV shows if type is TVShow', async () => {
      const response = await request.default(app.getHttpServer())
        .get('/content')
        .query({ type: 'TVShow' })
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(response.body.total).toBeGreaterThanOrEqual(4);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(10);
      expect(response.body.totalPages).toBeGreaterThanOrEqual(1);
      expect(response.body.data.map((item: any) => item.title)).toEqual(expect.arrayContaining([
        'Breaking Bad', 'Game of Thrones', 'Stranger Things', 'The Office'
      ]));
    });

    it('should apply pagination correctly', async () => {
      const response = await request.default(app.getHttpServer())
        .get('/content')
        .query({ page: 1, limit: 2 })
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.total).toBeGreaterThanOrEqual(8);
      expect(response.body.page).toBe("1");
      expect(response.body.limit).toBe("2");
      expect(response.body.totalPages).toBeGreaterThanOrEqual(1);
    });

    it('should apply pagination and type filter correctly', async () => {
      const allMoviesResponse = await request.default(app.getHttpServer())
        .get('/content')
        .query({ type: 'Movie' })
        .expect(200);
      const allMovies = allMoviesResponse.body.data.sort((a: any, b: any) => a.title.localeCompare(b.title));

      const response = await request.default(app.getHttpServer())
        .get('/content')
        .query({ type: 'Movie', page: 1, limit: 1 })
        .expect(200);

      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
      expect(response.body.total).toBe(4);
      expect(response.body.page).toBe("1");
      expect(response.body.limit).toBe("1");
      expect(response.body.totalPages).toBe(4);
      expect(response.body.data[0].title).toBe(allMovies[0].title);
    });
  });
});

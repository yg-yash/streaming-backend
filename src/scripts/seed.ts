import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { MOVIES_COLLECTION, TVSHOWS_COLLECTION, USERS_COLLECTION, MYLISTITEMS_COLLECTION } from '../config';
import { User } from '../app/schemas/user.schema';
import { Movie } from '../app/schemas/movie.schema';
import { TVShow } from '../app/schemas/tvshow.schema';
import { MyListItem } from '../app/schemas/mylist-item.schema';

// Popular movies to auto-populate
const popularMovies = [
  {
    title: 'The Shawshank Redemption',
    description: 'Two imprisoned men bond over a number of years.',
    genres: ['Drama'],
    releaseDate: new Date('1994-09-10'),
    director: 'Frank Darabont',
    actors: ['Tim Robbins', 'Morgan Freeman'],
  },
  {
    title: 'The Godfather',
    description: 'The aging patriarch of an organized crime dynasty transfers control...',
    genres: ['Crime', 'Drama'],
    releaseDate: new Date('1972-03-24'),
    director: 'Francis Ford Coppola',
    actors: ['Marlon Brando', 'Al Pacino'],
  },
  {
    title: 'The Dark Knight',
    description: 'Batman must accept one of the greatest psychological and physical tests.',
    genres: ['Action', 'Crime', 'Drama'],
    releaseDate: new Date('2008-07-18'),
    director: 'Christopher Nolan',
    actors: ['Christian Bale', 'Heath Ledger'],
  },
  {
    title: 'Inception',
    description: 'A thief who steals corporate secrets through dream-sharing technology.',
    genres: ['Action', 'Adventure', 'SciFi'],
    releaseDate: new Date('2010-07-16'),
    director: 'Christopher Nolan',
    actors: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt'],
  },
];

const popularTVShows = [
  {
    title: 'Breaking Bad',
    description: 'A high school chemistry teacher turned methamphetamine producer.',
    genres: ['Crime', 'Drama', 'Thriller'],
    episodes: [
      { episodeNumber: 1, seasonNumber: 1, releaseDate: new Date('2008-01-20'), director: 'Vince Gilligan', actors: ['Bryan Cranston', 'Aaron Paul'] },
    ],
  },
  {
    title: 'Game of Thrones',
    description: 'Nine noble families fight for control over the lands of Westeros.',
    genres: ['Action', 'Adventure', 'Drama', 'Fantasy'],
    episodes: [
      { episodeNumber: 1, seasonNumber: 1, releaseDate: new Date('2011-04-17'), director: 'Tim Van Patten', actors: ['Emilia Clarke', 'Sean Bean'] },
    ],
  },
  {
    title: 'Stranger Things',
    description: 'A group of young friends witness supernatural forces.',
    genres: ['Drama', 'Fantasy', 'Horror'],
    episodes: [
      { episodeNumber: 1, seasonNumber: 1, releaseDate: new Date('2016-07-15'), director: 'Duffer Brothers', actors: ['Millie Bobby Brown', 'Finn Wolfhard'] },
    ],
  },
  {
    title: 'The Office',
    description: 'A mockumentary on a group of typical office workers.',
    genres: ['Comedy'],
    episodes: [
      { episodeNumber: 1, seasonNumber: 1, releaseDate: new Date('2005-03-24'), director: 'Ken Kwapis', actors: ['Steve Carell', 'John Krasinski'] },
    ],
  },
];

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dbConnection = app.get<Connection>(getConnectionToken());

  // Clear existing data
  await dbConnection.collection(USERS_COLLECTION).deleteMany({});
  await dbConnection.collection(MOVIES_COLLECTION).deleteMany({});
  await dbConnection.collection(TVSHOWS_COLLECTION).deleteMany({});
  await dbConnection.collection(MYLISTITEMS_COLLECTION).deleteMany({});
  console.log('Cleared existing data.');

  // Create sample users
  const user1 = await dbConnection.collection(USERS_COLLECTION).insertOne({ username: 'user1', favoriteGenres: ['Action'], dislikedGenres: [], watchHistory: [] });
  const user2 = await dbConnection.collection(USERS_COLLECTION).insertOne({ username: 'user2', favoriteGenres: ['Comedy'], dislikedGenres: [], watchHistory: [] });
  console.log('Created sample users.');

  // Insert popular movies (bulk)
  const movieResult = await dbConnection.collection(MOVIES_COLLECTION).insertMany(popularMovies);
  console.log(`Inserted ${movieResult.insertedCount} popular movies.`);

  // Insert popular TV shows (bulk)
  const tvResult = await dbConnection.collection(TVSHOWS_COLLECTION).insertMany(popularTVShows);
  console.log(`Inserted ${tvResult.insertedCount} popular TV shows.`);

  // Add some items to user1's list (link to the first movie and TV show)
  const movieIds = Object.values(movieResult.insertedIds);
  const tvIds = Object.values(tvResult.insertedIds);

  if (movieIds.length && tvIds.length) {
    await dbConnection.collection(MYLISTITEMS_COLLECTION).insertOne({
      userId: user1.insertedId.toHexString(),
      contentId: movieIds[0].toString(),
      contentType: 'Movie',
    });
    await dbConnection.collection(MYLISTITEMS_COLLECTION).insertOne({
      userId: user1.insertedId.toHexString(),
      contentId: tvIds[0].toString(),
      contentType: 'TVShow',
    });
    console.log("Added sample items to user1's list.");
  }

  await app.close();
  console.log('Seeding completed.');
}

bootstrap();

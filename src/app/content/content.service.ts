import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Movie, MovieDocument } from '../schemas/movie.schema';
import { TVShow, TVShowDocument } from '../schemas/tvshow.schema';

@Injectable()
export class ContentService {
  constructor(
    @InjectModel(Movie.name) private movieModel: Model<MovieDocument>,
    @InjectModel(TVShow.name) private tvShowModel: Model<TVShowDocument>,
  ) {}

  async findAllContent(
    type?: 'Movie' | 'TVShow',
    page: number = 1,
    limit: number = 10,
  ): Promise<any> {
    const skip = (page - 1) * limit;
    let data: any[] = [];
    let total = 0;

    if (type === 'Movie') {
      const allMovies = await this.movieModel.find().lean().exec();
      allMovies.sort((a, b) => a.title.localeCompare(b.title));
      data = allMovies.slice(skip, skip + limit);
      total = allMovies.length;
    } else if (type === 'TVShow') {
      const allTvShows = await this.tvShowModel.find().lean().exec();
      allTvShows.sort((a, b) => a.title.localeCompare(b.title));
      data = allTvShows.slice(skip, skip + limit);
      total = allTvShows.length;
    } else {
      const allMovies = await this.movieModel.find().lean().exec();
      const allTvShows = await this.tvShowModel.find().lean().exec();

      const combined = [...allMovies, ...allTvShows];
      combined.sort((a, b) => a.title.localeCompare(b.title));
      data = combined.slice(skip, skip + limit);
      total = combined.length;
    }

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }
}

import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MyListItem, MyListItemDocument } from '../schemas/mylist-item.schema';
import { Movie, MovieDocument } from '../schemas/movie.schema';
import { TVShow, TVShowDocument } from '../schemas/tvshow.schema';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class MyListService {
  constructor(
    @InjectModel(MyListItem.name) private myListItemModel: Model<MyListItemDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Movie.name) private movieModel: Model<MovieDocument>,
    @InjectModel(TVShow.name) private tvShowModel: Model<TVShowDocument>,
  ) {}

  async addItem(username: string, contentId: string): Promise<MyListItem> {
    const user = await this.userModel.findOne({ username }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const userId = user._id.toString();

    let contentType: 'Movie' | 'TVShow' | undefined;
    const movie = await this.movieModel.findById(contentId).exec();
    if (movie) {
      contentType = 'Movie';
    } else {
      const tvShow = await this.tvShowModel.findById(contentId).exec();
      if (tvShow) {
        contentType = 'TVShow';
      }
    }
    if (!contentType) {
      throw new NotFoundException('Content not found (movie or tvshow)');
    }

    const existingItem = await this.myListItemModel.findOne({ userId, contentId }).exec();
    if (existingItem) {
      throw new ConflictException('Item already in my list');
    }
    const createdItem = new this.myListItemModel({ userId, contentId, contentType });
    return await createdItem.save(); // Await the save operation explicitly
  }

  async removeItem(username: string, contentId: string): Promise<any> {
    const user = await this.userModel.findOne({ username }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const userId = user._id.toString();

    const result = await this.myListItemModel.deleteOne({ userId, contentId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Item not found in my list');
    }
    return { message: 'Item removed successfully' };
  }

  async getPaginatedItems(username: string, page: number, limit: number): Promise<any> {
    const user = await this.userModel.findOne({ username }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userId = user._id.toString();
    const skip = (page - 1) * limit;
    const mylistItems = await this.myListItemModel.find({ userId }).skip(skip).limit(limit).lean().exec();

    const populatedItems = await Promise.all(mylistItems.map(async (item) => {
      let contentDetails;
      if (item.contentType === 'Movie') {
        contentDetails = await this.movieModel.findById(item.contentId).lean().exec();
      } else if (item.contentType === 'TVShow') {
        contentDetails = await this.tvShowModel.findById(item.contentId).lean().exec();
      }
      return { ...item, contentDetails };
    }));

    const totalItems = await this.myListItemModel.countDocuments({ userId }).exec();

    return {
      data: populatedItems,
      total: totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
    };
  }
}

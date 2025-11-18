import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>
  ) {}

  async createUser(
    username: string,
    favoriteGenres: string[] = [],
    dislikedGenres: string[] = [],
  ) {
    const existing = await this.userModel.findOne({ username }).exec();
    if (existing) {
      throw new ConflictException('Username already exists');
    }
    const user = new this.userModel({ username, favoriteGenres, dislikedGenres, watchHistory: [] });
    return user.save();
  }

  async getUser(username: string) {
    const user = await this.userModel.findOne({ username }).lean().exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async deleteUser(username: string) {
    const result = await this.userModel.deleteOne({ username }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('User not found');
    }
    return { message: 'User deleted successfully' };
  }
}

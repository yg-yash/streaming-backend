import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { USERS_COLLECTION } from '../../config';

export type UserDocument = User & Document;

@Schema({ collection: USERS_COLLECTION })
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ type: [{ type: String, enum: ['Action', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'SciFi'] }] })
  favoriteGenres: string[];

  @Prop({ type: [{ type: String, enum: ['Action', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'SciFi'] }] })
  dislikedGenres: string[];

  @Prop({ type: [{ contentId: String, watchedOn: Date, rating: Number }] })
  watchHistory: Array<{ contentId: string; watchedOn: Date; rating?: number }>;
}

export const UserSchema = SchemaFactory.createForClass(User);

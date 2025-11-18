import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { MYLISTITEMS_COLLECTION } from '../../config';

export type MyListItemDocument = MyListItem & Document;

@Schema({ collection: MYLISTITEMS_COLLECTION })
export class MyListItem {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ required: true })
  contentId: string;

  @Prop({ required: true })
  contentType: 'Movie' | 'TVShow';
}

export const MyListItemSchema = SchemaFactory.createForClass(MyListItem);

MyListItemSchema.index({ userId: 1, contentId: 1 }, { unique: true });

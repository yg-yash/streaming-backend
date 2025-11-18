import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { MOVIES_COLLECTION } from '../../config';

export type MovieDocument = Movie & Document;

@Schema({ collection: MOVIES_COLLECTION })
export class Movie {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: [{ type: String, enum: ['Action', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'SciFi'] }] })
  genres: string[];

  @Prop()
  releaseDate: Date;

  @Prop()
  director: string;

  @Prop({ type: [String] })
  actors: string[];
}

export const MovieSchema = SchemaFactory.createForClass(Movie);

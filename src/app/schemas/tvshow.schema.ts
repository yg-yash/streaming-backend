import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TVSHOWS_COLLECTION } from '../../config';

export type TVShowDocument = TVShow & Document;

@Schema({ collection: TVSHOWS_COLLECTION })
export class TVShow {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: [{ type: String, enum: ['Action', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Romance', 'SciFi'] }] })
  genres: string[];

  @Prop({ type: [{ episodeNumber: Number, seasonNumber: Number, releaseDate: Date, director: String, actors: [String] }] })
  episodes: Array<{ episodeNumber: number; seasonNumber: number; releaseDate: Date; director: string; actors: string[]; }>;
}

export const TVShowSchema = SchemaFactory.createForClass(TVShow);

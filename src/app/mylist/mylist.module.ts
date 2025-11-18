import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MyListItem, MyListItemSchema } from '../schemas/mylist-item.schema';
import { Movie, MovieSchema } from '../schemas/movie.schema';
import { TVShow, TVShowSchema } from '../schemas/tvshow.schema';
import { User, UserSchema } from '../schemas/user.schema';
import { MyListService } from './mylist.service';
import { MyListController } from './mylist.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MyListItem.name, schema: MyListItemSchema },
      { name: User.name, schema: UserSchema },
      { name: Movie.name, schema: MovieSchema },
      { name: TVShow.name, schema: TVShowSchema },
    ]),
  ],
  providers: [MyListService],
  controllers: [MyListController],
  exports: [MyListService]
})
export class MyListModule {}

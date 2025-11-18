import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MyListModule } from './app/mylist/mylist.module';
import { UserModule } from './app/user/user.module';
import { ContentModule } from './app/content/content.module';
import { MONGODB_URI } from './config';

@Module({
  imports: [
    MongooseModule.forRoot(MONGODB_URI),
    MyListModule,
    UserModule,
    ContentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

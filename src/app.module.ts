import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    MongooseModule,
    MongooseModule.forRoot(
      'mongodb+srv://arseniizarudniuk:abc123etc@cluster0.vkta6og.mongodb.net/?retryWrites=true&w=majority',
    ),
    UsersModule,
    AuthModule,
  ],
  providers: [AppService],
})
export class AppModule {}

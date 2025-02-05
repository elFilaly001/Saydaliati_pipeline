import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { FirebaseModule } from '@/firebase/firebase.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService],
  imports: [FirebaseModule , AuthModule]
})
export class CommentsModule {}

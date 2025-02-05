import { Module } from '@nestjs/common';
import { FavoritService } from './favorit.service';
import { FavoritController } from './favorit.controller';
import { FirebaseModule } from '@/firebase/firebase.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  controllers: [FavoritController],
  providers: [FavoritService],
  imports: [FirebaseModule , AuthModule],
})
export class FavoritModule {}

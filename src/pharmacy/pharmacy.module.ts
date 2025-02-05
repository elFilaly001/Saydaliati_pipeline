import { Module } from '@nestjs/common';
import { PharmacyService } from './pharmacy.service';
import { PharmacyController } from './pharmacy.controller';
import {FirebaseModule} from '../firebase/firebase.module'
import { S3Service } from '@/s3/s3.service';
import { S3Module } from '@/s3/s3.module';


@Module({
  imports: [FirebaseModule, S3Module],
  controllers: [PharmacyController],
  providers: [PharmacyService],
})
export class PharmacyModule {}

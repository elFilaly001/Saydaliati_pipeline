import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import s3Config from "src/config/s3.config";
import { S3Service } from "./s3.service";


@Module({
    imports: [ConfigModule.forFeature(s3Config)],
    providers: [S3Service],
    exports: [S3Service],
})

export class S3Module {}
import { Module } from "@nestjs/common";
import { FirebaseService } from "./firebase.service";
import { FirebaseController } from './firebase.controller';


@Module({
    imports: [],
    providers: [FirebaseService],
    exports: [FirebaseService],
    controllers: [FirebaseController]
})
export class FirebaseModule {}
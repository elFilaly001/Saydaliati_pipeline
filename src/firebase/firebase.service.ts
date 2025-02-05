import {
  Injectable,
  OnModuleInit,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  public firestore: admin.firestore.Firestore;
  public auth: admin.auth.Auth;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    try {
      const serviceAccount = {
        projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
        clientEmail: this.configService.get<string>('FIREBASE_CLIENT_EMAIL'),
        privateKey: this.configService
          .get<string>('FIREBASE_PRIVATE_KEY')
          ?.replace(/\\n/g, '\n'),
      };

      this.logger.log(
        `Initializing Firebase with project ID: ${serviceAccount.projectId}`,
      );

      admin.initializeApp({
        credential: admin.credential.cert(
          serviceAccount as admin.ServiceAccount,
        ),
      });

      this.firestore = admin.firestore();
      this.auth = admin.auth();

      this.logger.log('Firebase initialized successfully');
    } catch (error) {
      this.logger.error('Firebase initialization error:', error);
      throw error;
    }
  }

  collection(collectionName: string) {
    return this.firestore.collection(collectionName);
  }

  doc(collectionName: string, documentId: string) {
    return this.collection(collectionName).doc(documentId);
  }

  async verifyToken(token: string) {
    try {
      return await admin.auth().verifyIdToken(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}

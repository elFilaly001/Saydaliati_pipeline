import { Controller, Get } from '@nestjs/common';
import { FirebaseService } from './firebase.service';

@Controller('firebase')
export class FirebaseController {
  constructor(private readonly firebaseService: FirebaseService) {}
  @Get('test')
  async testConnection() {
    try {
      // Create a test document
      const testDoc = await this.firebaseService.collection('users').add({
        message: 'nice',
        timestamp: new Date(),
      });

      // Read it back to verify
      const doc = await testDoc.get();
      const data = doc.data();

      // Clean up by deleting the test document
      await testDoc.delete();

      return {
        success: true,
        message: 'Firebase connection is working!',
        testData: data,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

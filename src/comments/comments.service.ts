import { Injectable, NotFoundException , ForbiddenException , BadRequestException } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { FirebaseService } from '@/firebase/firebase.service';
import { AuthService } from '@/auth/auth.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class CommentsService {

  private logger = new Logger(CommentsService.name);
  
  constructor(private readonly firebaseService: FirebaseService , private readonly authService: AuthService){}

  async createComment(createCommentDto: CreateCommentDto , token: string){
    const vltoken = token.split(' ')[1];
    const email = await this.authService.extractEmailFromToken(vltoken);
    const userRecord = await this.firebaseService.auth.getUserByEmail(email)
          .catch(() => {
            throw new NotFoundException('User Not Found');
          });

    const pharmacyRef = this.firebaseService.collection('pharmacies').doc(createCommentDto.pharmacyId);
    const pharmacyDoc = await pharmacyRef.get();
    if(!pharmacyDoc.exists){
      throw new NotFoundException('Pharmacy Not Found');
    }

    const commentRef = pharmacyRef.collection('comments').add({
      userId: userRecord.uid,
      comment: createCommentDto.comment,
      stars: createCommentDto.stars,
      createdAt: new Date().toISOString(),
    });

    return {
      message: 'Comment added successfully',
      commentId: commentRef,
    };
  }

  async getComments(pharmacyId: string){
    const pharmacyRef = this.firebaseService.collection('pharmacies').doc(pharmacyId);
    const pharmacyDoc = await pharmacyRef.get();
    if(!pharmacyDoc.exists){
      throw new NotFoundException('Pharmacy Not Found');
    }
    const comments = await pharmacyRef.collection('comments').get();
    return comments.docs.map(doc => doc.data());
  }

  async deleteComment(pharmacyId: string, commentId: string, token: string) {
    try {
        
        const vltoken = token.split(' ')[1];
        const email = await this.authService.extractEmailFromToken(vltoken);
        
        const userRecord = await this.firebaseService.auth.getUserByEmail(email)
            .catch(() => {
                throw new NotFoundException('User Not Found');
            });

        // Get reference to the subcollection
        const commentRef = this.firebaseService
            .collection('pharmacies')
            .doc(pharmacyId)
            .collection('comments')
            .doc(commentId);

        const commentDoc = await commentRef.get();
        console.log('Comment reference path:', commentRef.path);

        if (!commentDoc.exists) {
            throw new NotFoundException(`Comment Not Found with ID: ${commentId}`);
        }

        const commentData = commentDoc.data();
        
        if (commentData.userId !== userRecord.uid) {
            throw new ForbiddenException('You are not allowed to delete this comment');
        }

        await commentRef.delete();

        return {
            message: 'Comment deleted successfully',
        };
    } catch (error) {
        console.error('Error in deleteComment:', error);
        throw error;
    }
}
}


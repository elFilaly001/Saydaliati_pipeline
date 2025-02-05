import { Controller, Get, Post, Body, Patch, Param, Delete , Headers} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post("add")
  async createComment(@Body() createCommentDto: CreateCommentDto , @Headers('authorization') token: string){
    return this.commentsService.createComment(createCommentDto , token)
  }

  @Get(":pharmacyId")
  async getComments(@Param('pharmacyId') pharmacyId: string){
    return this.commentsService.getComments(pharmacyId);
  }

  @Delete(":pharmacyId/:commentId")
  async deleteComment(@Param('pharmacyId') pharmacyId: string , @Param('commentId') commentId: string ,  @Headers('authorization') token: string){
    return this.commentsService.deleteComment(pharmacyId , commentId , token);
  }
}

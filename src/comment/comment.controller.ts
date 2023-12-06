import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateCommentDto } from './dto/createComment.dto';
import { Request } from 'express';
import { UpdateCommentDto } from './dto/updateComment.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Comments')
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createCommentDto: CreateCommentDto, @Req() request: Request) {
    const userId = request.user['userId'];
    return this.commentService.create(userId, createCommentDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('delete/:id')
  delete(
    @Param('id', ParseIntPipe) commentId: number,
    @Req() request: Request,
    @Body('postId') postId: number,
  ) {
    const userId = request.user['userId'];
    return this.commentService.delete(commentId, userId, postId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Put('update/:id')
  update(
    @Param('id', ParseIntPipe) commentId: number,
    @Req() request: Request,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    const userId = request.user['userId'];
    return this.commentService.update(commentId, userId, updateCommentDto);
  }
}

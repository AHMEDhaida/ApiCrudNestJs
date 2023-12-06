import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from './dto/createPost.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdatePostDto } from './dto/updatePost.dto';

@Injectable()
export class PostService {
  constructor(private readonly prismaService: PrismaService) {}
  async create(userId: any, createPostDto: CreatePostDto) {
    const { title, body } = createPostDto;
    await this.prismaService.post.create({ data: { title, body, userId } });
    return { data: 'Post created' };
  }

  async getAll() {
    return await this.prismaService.post.findMany({
      include: {
        user: {
          select: {
            username: true,
            email: true,
            password: false,
          },
        },
        Comments: {
          include: {
            user: {
              select: {
                username: true,
                email: true,
                password: false,
              },
            },
          },
        },
      },
    });
  }

  async delete(postId: number, userId: any) {
    const post = await this.prismaService.post.findUnique({
      where: { postId },
    });
    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId)
      throw new ForbiddenException('forbidden action');
    await this.prismaService.post.delete({ where: { postId } });
    return { data: 'Post deleted' };
  }

  async update(postId: number, userId: any, updatePostDto: UpdatePostDto) {
    const post = await this.prismaService.post.findUnique({
      where: { postId },
    });
    if (!post) throw new NotFoundException('Post not found');
    if (post.userId !== userId)
      throw new ForbiddenException('forbidden action');

    const updatedRecord = await this.prismaService.post.update({
      where: { postId },
      data: { ...updatePostDto },
    });

    return { data: 'Post Updated' };
  }
}

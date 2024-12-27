import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PostsTypeorm } from "../domain/post-typeorm.entity";
import { Repository } from "typeorm";
import { PaginatedResponse } from "src/base/types/pagination";
import { BlogPostOutputModel, BlogPostViewModel } from "../../blogs/api/models/output";
import { GetBlogPostsHelperResult } from "../../blogs/helper";
import { LikeCommentStatus } from "../../comments/api/models/output";
import { LikePostStatus } from "../api/output";
import { User } from "src/features/users/domain/users.entity";

@Injectable()
export class PostsTypeormQueryRepository {
  constructor (
    @InjectRepository(PostsTypeorm)
    protected readonly postsRepository: Repository<PostsTypeorm>
  ) {}

  public async getBlogPosts(
    pagination: GetBlogPostsHelperResult,
    userId?: string | null | undefined,
    postId?: string
  ): Promise<PaginatedResponse<BlogPostOutputModel>> {
    const {
      pageNumber = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortDirection = 'ASC',
    } = pagination

    const queryBuilder = this.postsRepository.createQueryBuilder('p')

    queryBuilder.select([
      'p.id',
      'p.title',
      'p.shortDescription',
      'p.content',
      'p.blogId',
      'p.blogName',
      'p.createdAt'
    ])

    queryBuilder.orderBy(`p.${sortBy}`, sortDirection?.toUpperCase() as 'ASC' | 'DESC')

    queryBuilder.skip((pageNumber - 1) * pageSize).take(pageSize)

    const [ posts, totalCount ] = await queryBuilder.getManyAndCount()

    const paginationResult = {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items: posts.map((p: BlogPostViewModel) => this.mapPostOutput(p, userId))
    }

    return paginationResult;
  }

  public async getPostsById(id: BlogPostViewModel['id'], userId?: User['id']): Promise<BlogPostOutputModel | null> {
    const queryBuilder = await this.postsRepository.createQueryBuilder('p')
      .select([
        'p.id',
        'p.title',
        'p.shortDescription',
        'p.content',
        'p.blogId',
        'p.blogName',
        'p.createdAt'
      ])
      .where('p.id = :id', { id })
      .getOne();
  
    return queryBuilder ? this.mapPostOutput(queryBuilder, userId) : null;
  }
  

  public mapPostOutput(post: BlogPostViewModel, userId?: string | null): BlogPostOutputModel {
    const postForOutput = {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikePostStatus.NONE,
        newestLikes: []
      }
    };
  
    return postForOutput;
  }
}
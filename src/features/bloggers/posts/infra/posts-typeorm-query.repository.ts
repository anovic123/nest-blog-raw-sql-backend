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
import { LikePosts } from "../domain/like-post.entity";

@Injectable()
export class PostsTypeormQueryRepository {
  constructor (
    @InjectRepository(PostsTypeorm)
    protected readonly postsRepository: Repository<PostsTypeorm>,
    @InjectRepository(LikePosts)
    protected readonly likePosts: Repository<LikePosts>
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
      items: posts.length > 0 ? await Promise.all(posts.map((p: PostsTypeorm) => this.mapPostOutput(p, userId))) : []
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
  

  public async mapPostOutput(post: BlogPostViewModel, userId?: string | null): Promise<BlogPostOutputModel> {
    const likes = await this.likePosts
      .createQueryBuilder("lp")
      .select([
        "lp.*",
        `(SELECT "users"."login" FROM "users" WHERE "users"."id" = lp."authorId") AS "login"`
      ])
      .where("lp.postId = :postId", { postId: post.id })
      .orderBy("lp.createdAt", "DESC")
      .getRawMany();

    const userLike = userId ? likes.find((l: LikePosts) => l.authorId === userId) : null;
    const likesCount = likes.filter((l: LikePosts) => l.status === LikePostStatus.LIKE).length;
    const dislikesCount = likes.filter((l: LikePosts) => l.status === LikePostStatus.DISLIKE).length;
    const myStatus = userLike?.status ?? LikePostStatus.NONE;

    const newestLikes = likes
      .filter((l: LikePosts) => l.status === LikePostStatus.LIKE)
      .slice(0, 3)
      .map(l => ({
        addedAt: l.createdAt.toISOString(),
        userId: l.authorId,
        login: l.login
    }));

    const postForOutput = {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount,
        dislikesCount,
        myStatus,
        newestLikes
      }
    };
  
    return postForOutput;
  }
}
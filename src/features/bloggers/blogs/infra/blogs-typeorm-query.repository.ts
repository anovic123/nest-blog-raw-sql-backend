import { PostsRepository } from "src/features/bloggers/posts/infra/posts.repository";
import { Inject, Injectable } from "@nestjs/common";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";

import { BlogTypeorm } from "../domain/blogs-typeorm.entity";
import { PostsTypeorm } from "../../posts/domain/post-typeorm.entity";
import { LikePosts } from "../../posts/domain/like-post.entity";

import { PaginationType } from "src/base/models/pagination.base.model";

import { PaginatedResponse } from "src/base/types/pagination";

import { BlogPostOutputModel, BlogPostViewModel, BlogViewModel, LikePostStatus } from "../api/models/output";

@Injectable()
export class BlogsTypeormQueryRepository {
  constructor(
    @InjectRepository(BlogTypeorm)
    protected readonly blogsRepository: Repository<BlogTypeorm>,
    @InjectRepository(PostsTypeorm)
    protected readonly postsRepository: Repository<PostsTypeorm>,
    @InjectRepository(LikePosts)
    protected readonly likePostsRepository: Repository<LikePosts>,
    @InjectDataSource()
    protected dataSource: DataSource
  ) {}

  public async getAllBlogs(
    pagination: PaginationType
  ): Promise<PaginatedResponse<any>> {
    const {
      pageNumber,
      pageSize,
      sortBy,
      searchNameTerm,
      sortDirection
    } = pagination

    const queryBuilder = this.blogsRepository.createQueryBuilder('b')

    queryBuilder.select([
      'b.id',
      'b.name',
      'b.description',
      'b.websiteUrl',
      'b.createdAt',
      'b.isMembership'
    ])

    if (searchNameTerm) {
      queryBuilder.andWhere('b.name ILIKE :name', {
        name: `%${searchNameTerm}%`
      })
    }

    queryBuilder.orderBy(`b.${sortBy}`, sortDirection.toUpperCase() as 'ASC' | 'DESC')

    queryBuilder.skip((pageNumber - 1) * pageSize).take(pageSize)

    const [ blogs, totalCount ] = await queryBuilder.getManyAndCount()

    const paginationResult = {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items: blogs
    }

    return paginationResult
  }

  public async findBlog(blogId: BlogViewModel['id']): Promise<any | null> {
    const res = await this.blogsRepository
      .createQueryBuilder('b')
      .select(['b.id', 'b.name', 'b.description', 'b.websiteUrl', 'b.createdAt', 'b.isMembership'])
      .where("b.id = :id", { id: blogId })
      .getOne()

    return res || null;
  }

  public async getBlogPosts(
    pagination: PaginationType,
    blogId: string,
    userId?: string | null | undefined
  ): Promise<PaginatedResponse<BlogPostOutputModel>> {
    const { 
      pageNumber,
      pageSize,
      sortBy, 
      searchNameTerm,
      sortDirection,
    } = pagination;

    const queryBuilder = this.postsRepository.createQueryBuilder('b');
    queryBuilder
      .select([
        'b.id',
        'b.title',
        'b.content',
        'b.shortDescription',
        'b.blogId',
        'b.blogName',
        'b.createdAt',
      ])
      .where('b."blogId" = :blogId', { blogId });
    
    if (searchNameTerm) {
      queryBuilder.andWhere('b.title ILIKE :title', { title: `%${searchNameTerm}%` })
    }

    queryBuilder.orderBy(`b.${sortBy}`, sortDirection.toUpperCase() as 'ASC' | 'DESC')

    queryBuilder.skip((pageNumber - 1) * pageSize).take(pageSize)
    const [ posts, totalCount ] = await queryBuilder.getManyAndCount()

    const paginationResult = {
      pagesCount: Math.ceil(totalCount / pageSize),
      page: pageNumber,
      pageSize,
      totalCount,
      items: posts.length > 0 ? await Promise.all(posts.map((p: BlogPostViewModel) => this.mapPostOutput(p, userId))) : []
    }

    return paginationResult
  } 

  public async mapPostOutput(post: any, userId?: string | null): Promise<BlogPostOutputModel> {
    // const likes = await this.likePostsRepository
    //   .createQueryBuilder('lp')
    //   .select([
    //     'lp.authorId',
    //     'lp.status',
    //     'lp.createdAt',
    //     '(SELECT "login" FROM "users" WHERE "users"."id" = lp."authorId") AS "login"',
    //   ])
    //   .where('lp."postId" = :postId', { postId: post.id })
    //   .orderBy('lp."createdAt"', 'DESC')
    //   .getRawMany();

    const likes = await this.dataSource.query(
      `
        SELECT lp.*, (
          SELECT "login" 
          FROM "users" 
          WHERE "users"."id" = lp."authorId"
        ) AS "login"
        FROM "like-posts" AS lp 
        WHERE lp."postId" = $1
        ORDER BY lp."createdAt" DESC
      `,
      [post.id]
    );
  
    const userLike = userId ? likes.find((l: any) => l.authorId === userId) : null;
  
    const likesCount = likes.filter((l: any) => l.status === LikePostStatus.LIKE).length;
    const dislikesCount = likes.filter((l: any) => l.status === LikePostStatus.DISLIKE).length;
  
    const myStatus = userLike?.status ?? LikePostStatus.NONE;
  
    const newestLikes = likes
      .filter((l: any) => l.status === LikePostStatus.LIKE)
      .slice(0, 3)
      .map((l: any) => ({
        addedAt: l.createdAt.toISOString(),
        userId: l.authorId,
        login: l.login,
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
        newestLikes,
      },
    };
  
    return postForOutput;
  }
  
}
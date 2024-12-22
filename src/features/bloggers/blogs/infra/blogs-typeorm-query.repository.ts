import { PostsRepository } from "src/features/bloggers/posts/infra/posts.repository";
import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { BlogTypeorm } from "../domain/blogs-typeorm.entity";
import { PostsTypeorm } from "../../posts/domain/post-typeorm.entity";

import { PaginationType } from "src/base/models/pagination.base.model";

import { PaginatedResponse } from "src/base/types/pagination";

import { BlogPostOutputModel, BlogPostViewModel, BlogViewModel, LikePostStatus } from "../api/models/output";

@Injectable()
export class BlogsTypeormQueryRepository {
  constructor(
    @InjectRepository(BlogTypeorm)
    protected readonly blogsRepository: Repository<BlogTypeorm>,
    @InjectRepository(PostsTypeorm)
    protected readonly postsRepository: Repository<PostsTypeorm>
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

    const queryBuilder = this.postsRepository.createQueryBuilder('b')

    queryBuilder.select(['b.id', 'b.title', 'b.shortDescription', 'b.content', 'b.blogId', 'b.blogName', 'b.createdAt'])

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
      items: posts.length > 0 ? posts.map((p: BlogPostViewModel) => this.mapPostOutput(p)) : []
    }

    return paginationResult
  } 


  public mapPostOutput(post: any, userId?: string | null): BlogPostOutputModel {
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
    }

    return postForOutput;
  }
}
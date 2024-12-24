import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { v4 as uuidv4 } from "uuid";

import { PostsTypeorm } from "../domain/post-typeorm.entity";
import { User } from "src/features/users/domain/users.entity";
import { LikePosts } from "../domain/like-post.entity";

import { BlogPostViewModel, BlogViewModel } from "../../blogs/api/models/output";
import { LikePostStatus, PostViewModel } from "../api/output";

import { UpdatePostInputModel } from "../../blogs/api/models/input/update-post.input.model";

@Injectable()
export class PostsTypeormRepository {
  constructor(
    @InjectRepository(PostsTypeorm)
    protected readonly postsRepository: Repository<PostsTypeorm>,
    @InjectRepository(LikePosts)
    protected readonly likePostsRepository: Repository<LikePosts>
  ) {}

  public async isPostExisted(id: BlogPostViewModel['id']): Promise<boolean> {
    const count = await this.postsRepository.count({
      where: { id }
    })

    return count > 0
  }

  public async updatePost(
    body: UpdatePostInputModel,
    postId: BlogPostViewModel['id'],
    blogId: BlogViewModel['id']
  ): Promise<boolean> {
    const {
      content,
      shortDescription,
      title
    } = body

    const res = await this.postsRepository.update(
      {
        id: postId
      },
      {
        blogId,
        content,
        shortDescription,
        title
      }
    )

    return res?.affected !== undefined && res.affected !== null && res.affected > 0;
  }

  public async deletePost(id:  BlogPostViewModel['id']): Promise<boolean> {
    const res = await this.postsRepository.softDelete(id)


    return res.affected !== undefined && res.affected !== null && res.affected > 0;
  }

  public async createPostBlog(newPost: BlogPostViewModel): Promise<BlogPostViewModel> {
    const res = await this.postsRepository.save(newPost)

    const newPostResult = {
      id: newPost.id,
      title: newPost.title,
      shortDescription: newPost.shortDescription,
      content: newPost.content,
      blogId: newPost.blogId,
      blogName: newPost.blogName,
      createdAt: newPost.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikePostStatus.NONE,
        newestLikes: []
      }
    }

    return newPostResult
  }

  public async findLikePostById (userId: User['id'], postId: PostsTypeorm['id']): Promise<LikePosts | null> {
    const postRes = await this.likePostsRepository.findOne({
      where: {
        authorId: userId,
        postId
      }
    })

    return postRes
  }

  public async likePost(userId: User['id'], postId: PostViewModel['id']): Promise<boolean> {
    const existingLike = await this.findLikePostById(userId, postId)
    const id = uuidv4()
    if (existingLike) {
      existingLike.status = LikePostStatus.LIKE;
      existingLike.createdAt = new Date();
      await this.likePostsRepository.save(existingLike);
    } else {
      const newLike = this.likePostsRepository.create({
        id,
        authorId: userId,
        postId,
        status: LikePostStatus.LIKE,
        createdAt: new Date()
      });

      await this.likePostsRepository.save(newLike);
    }

    return true;
  }

  public async dislikePost(userId: User['id'], postId: PostViewModel['id']): Promise<boolean> {
    const existingLike = await this.findLikePostById(userId, postId)
    const id = uuidv4()

    if (existingLike) {
      existingLike.status = LikePostStatus.DISLIKE;
      existingLike.createdAt = new Date();
      await this.likePostsRepository.save(existingLike);
    } else {
      const newLike = this.likePostsRepository.create({
        id,
        authorId: userId,
        postId,
        status: LikePostStatus.DISLIKE,
        createdAt: new Date(),
      });
      await this.likePostsRepository.save(newLike);
    }
  
    return true;
  }

  public async noneStatusPost(userId: string, postId: string): Promise<boolean> {
    const existingLike = await this.findLikePostById(userId, postId)
    const id = uuidv4()

    if (existingLike) {
      existingLike.status = LikePostStatus.NONE;
      existingLike.createdAt = new Date();
      await this.likePostsRepository.save(existingLike);
    } else {
      const newLike = this.likePostsRepository.create({
        id,
        authorId: userId,
        postId,
        status: LikePostStatus.NONE,
        createdAt: new Date(),
      });
      await this.likePostsRepository.save(newLike);
    }
  
    return true;
  }
  
}
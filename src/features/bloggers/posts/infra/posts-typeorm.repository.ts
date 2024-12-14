import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

import { PostsTypeorm } from "../domain/post-typeorm.entity";

import { BlogPostViewModel, BlogViewModel } from "../../blogs/api/models/output";
import { LikePostStatus } from "../api/output";

import { UpdatePostInputModel } from "../../blogs/api/models/input/update-post.input.model";

@Injectable()
export class PostsTypeormRepository {
  constructor(
    @InjectRepository(PostsTypeorm)
    protected readonly postsRepository: Repository<PostsTypeorm>
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
      ...newPost,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikePostStatus.NONE,
        newestLikes: []
      }
    }

    return newPostResult
  }
}
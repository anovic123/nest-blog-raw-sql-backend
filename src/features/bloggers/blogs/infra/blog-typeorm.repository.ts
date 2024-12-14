import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { BlogTypeorm } from "../domain/blogs-typeorm.entity";

import { BlogInputModel } from "../api/models/input/blog.input.model";

import { BlogViewModel } from "../api/models/output";

@Injectable()
export class BlogsTypeormRepository {
  constructor (
    @InjectRepository(BlogTypeorm)
    protected readonly blogsRepository: Repository<BlogTypeorm>
  ) {}

  public async createBlog(newBlog: BlogTypeorm) {
    const res = await this.blogsRepository.save(newBlog)

    const newBlogResult = {
      id: newBlog.id,
      name: newBlog.name,
      description: newBlog.description,
      websiteUrl: newBlog.websiteUrl,
      createdAt: newBlog.createdAt,
      isMembership: newBlog.isMembership
      // extendedLikesInfo: {
      //   likesCount: 0,
      //   dislikesCount: 0,
      //   myStatus: "None",
      //   newestLikes: []
      // }
    }

    return newBlogResult
  }

  public async updateBlog(
    blog: BlogInputModel,
    id: BlogViewModel['id']
  ): Promise<boolean> {
    const { name, description, websiteUrl } = blog

    const res = await this.blogsRepository.update(
      id,
      {
        name,
        description,
        websiteUrl
      }
    )

    return res.affected !== undefined && res.affected > 0;
  }

  public async blogIsExist(id: BlogTypeorm['id']): Promise<boolean> {
    const count = await this.blogsRepository.count({
      where: { id }
    })
    
    return count > 0
  }

  public async deleteBlog(id: BlogTypeorm['id']): Promise<boolean> {
    const res = await this.blogsRepository.softDelete(id)

    return res.affected !== undefined && res.affected !== null && res.affected > 0;
  }
}
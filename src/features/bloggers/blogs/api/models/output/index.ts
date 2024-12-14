import { ApiProperty } from "@nestjs/swagger";

export enum LikePostStatus {
  NONE = 'None',
  LIKE = 'Like',
  DISLIKE = 'Dislike',
}

export class PostLikesViewModel {
  @ApiProperty({ example: 105, description: "likes count" })
  likesCount: number;
  @ApiProperty({ example: 10, description: "dislikes count" })
  dislikesCount: number;
  @ApiProperty({ enum: LikePostStatus, description: "user like status" })
  myStatus: LikePostStatus;
  newestLikes: {
    addedAt: string;
    userId: string;
    login: string;
  }[];
}

export class BlogPostViewModel {
  @ApiProperty({ example: "31e93ff2-51c1-455d-ac56-a84b7689a134", description: "id" })
  id: string;
  @ApiProperty({ example: "some title", description: "blog post title" })
  title: string;
  @ApiProperty({ example: "some description", description: "blog post description" })
  shortDescription: string;
  @ApiProperty({ example: "some content", description: "blog post content" })
  content: string;
  @ApiProperty({ example: "31e93ff2-51c1-455d-ac56-a84b712389a134", description: "blog id" })
  blogId: string;
  @ApiProperty({ example: "blog 123", description: "blog name" })
  blogName: string;
  @ApiProperty({ example: "Fri Dec 13 2024 23:00:22 GMT+0200", description: "created date" })
  createdAt: Date;
  // extendedLikesInfo: PostLikesViewModel;
}

export class BlogPostOutputModel extends BlogPostViewModel {
  extendedLikesInfo: PostLikesViewModel;
}

export class BlogViewModel {
  @ApiProperty({ example: "31e93ff2-51c1-455d-ac56-a84b7689a134", description: "id" })
  id: string;
  @ApiProperty({ example: "blog", description: "blog name" })
  name: string;
  @ApiProperty({ example: "lorem text", description: "description" })
  description: string;
  @ApiProperty({ example: "https://www.google.com", description: "website url" })
  websiteUrl: string;
  @ApiProperty({ example: "Fri Dec 13 2024 23:00:22 GMT+0200", description: "created date" })
  createdAt: Date;
  @ApiProperty({ example: false, description: "is membership" })
  isMembership: boolean;
}
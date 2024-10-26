export enum LikePostStatus {
  NONE = 'None',
  LIKE = 'Like',
  DISLIKE = 'Dislike',
}

export class PostLikesViewModel {
  likesCount: number;
  dislikesCount: number;
  myStatus: LikePostStatus;
  newestLikes: {
    addedAt: string;
    userId: string;
    login: string;
  }[];
}

export class BlogPostViewModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
  // extendedLikesInfo: PostLikesViewModel;
}

export class BlogPostOutputModel extends BlogPostViewModel {
  extendedLikesInfo: PostLikesViewModel;
}

export class BlogViewModel {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
}
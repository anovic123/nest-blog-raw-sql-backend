export enum LikePostStatus {
  NONE = 'None',
  LIKE = 'Like',
  DISLIKE = 'Dislike',
}

export class PostViewModel {
  id: string;
  title: string; // max 30
  shortDescription: string; // max 100
  content: string; // max 1000
  blogId: string; // valid
  blogName: string;
  createdAt: string;
  extendedLikesInfo: PostLikesViewModel;
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
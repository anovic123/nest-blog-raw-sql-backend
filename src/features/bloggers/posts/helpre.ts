export interface GetAllPostsHelperResult {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  searchNameTerm?: string;
}

export const getAllPostsHelper = (query: GetAllPostsHelperResult) => {
  return {
    pageNumber: query.pageNumber ? +query.pageNumber : 1,
    pageSize: query.pageSize !== undefined ? +query.pageSize : 10,
    sortBy: query.sortBy ? query.sortBy : 'createdAt',
    sortDirection: query.sortDirection ? query.sortDirection : 'desc',
    searchNameTerm: query.searchNameTerm ? query.searchNameTerm : undefined,
  };
};
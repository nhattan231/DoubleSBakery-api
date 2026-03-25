export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginationResult<T> {
  list: T[];
  pagination: PaginationMeta;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

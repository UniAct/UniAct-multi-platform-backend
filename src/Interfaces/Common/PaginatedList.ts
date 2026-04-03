export interface IPage<T>{
  pageNumber : number,
  pageSize : number;
  totalPages : number;
  totalCount : number;
  items? : ReadonlyArray<T>;
};
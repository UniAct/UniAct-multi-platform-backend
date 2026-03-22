export interface CreateSemesterRequest {
  year: number;
  term: number;
  startDate: Date;
  endDate: Date;
}

export interface UpdateSemesterRequest {
  year?: number;
  term?: number;
  startDate?: Date;
  endDate?: Date;
}
export interface CreateSemesterRequest {
  year: number;
  number: number;
  startDate: Date;
  endDate: Date;
}

export interface UpdateSemesterRequest {
  year?: number;
  number?: number;
  startDate?: Date;
  endDate?: Date;
}
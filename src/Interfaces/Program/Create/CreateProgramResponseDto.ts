export type CreateProgramResponseDto = {
  id: number;
  description?: string;
  facultyName: string; 
  program: {
    name: string,
    description: string
  }
  headName: string,
  contact: string;
  creditHours: {
    university: number;
    faculty: number;
    program: number;
  };
  programType: string;
};
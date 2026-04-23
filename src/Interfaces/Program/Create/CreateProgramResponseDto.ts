export type CreateProgramResponseDto = {
  id: number;
  name: string;
  description: string;

  faculty: {
    name: string;
  };

  head?: {
    fullName: string;
  };

  contact: {
    phone?: string;
  };

  creditHours: {
    university: number;
    faculty: number;
    program: number;
  };

  programType: string;
};
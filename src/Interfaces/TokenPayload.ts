import { JwtPayload } from "jsonwebtoken";

export interface TokenPayload extends JwtPayload {
  id?: number;
  email?: string;
  university_name?: string;
  roles?: string[];
  permissions?: string[];

  isStaff?: boolean;
  isStudent?: boolean;

  program?: {
    id: number;
    programName: string;
  };

  programLevel?: {
    id: number;
    level: number;       
  };

  student?: {
    fullname: string;
    nationalId?: string;
    cgpa?: number;
    gender?: string;
    religion?: string;
    universityStudentId: string;
  };

  semester?: {
    id: number;
    year: number;
    type?: string;
    term?: string;
  };

  username?: string;
  schema_name?: string;
}
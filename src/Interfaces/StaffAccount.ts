export interface IStaffAccount {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  date_of_birth: string | Date;
  address?: string;
  city?: string;
  country?: string;
  national_id: string;
  position?: string;
  cv?: string | undefined; 
  hireDate: string | Date;
  salary?: number | string | null;
}

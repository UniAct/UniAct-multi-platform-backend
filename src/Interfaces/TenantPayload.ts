export interface TenantPayload {
  id: number;
  name: string;
  schema_name: string;
  subdomain: string;
  university_id: number;
}

export interface UniversityCreateData {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  established_date?: string;
  accreditation?: string;
}

export interface TenantCreateData {
  name: string;
  subdomain: string;
  db_schema: string;
  university_id?: number;
}

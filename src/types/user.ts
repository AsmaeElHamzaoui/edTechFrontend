export type Role = "APPRENANT" | "ADMINISTRATEUR";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: Role;
  max_documents: number;
  max_storage_bytes: number;
  used_storage_bytes: number;
  documents_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
}

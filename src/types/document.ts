export type DocumentStatus = "UPLOADED" | "PROCESSING" | "READY" | "FAILED";

export interface Document {
  id: number;
  title: string;
  status: DocumentStatus;
  file: string; // URL of the file
  uploaded_by: string; // email
  uploaded_at: string;
  updated_at: string;
}

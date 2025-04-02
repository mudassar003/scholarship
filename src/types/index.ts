// src/types/index.ts
export interface Professor {
  id?: string;
  name: string;
  email: string;
  country: string;
  scholarship?: string | null;
  emailScreenshot?: string | null;
  proposalPdf?: string | null;
  createdAt?: string | null;
}

export interface Country {
  id: string;
  name: string;
  code: string;
}

export interface Scholarship {
  id: string;
  name: string;
  country: string;
}
// src/types/types.ts

export interface Student {
  id: number;
  name: string;
  email: string;
  completion: number;
  assignments: number;
  avgScore: number;
  status: "completed" | "in-progress" | "at-risk";
  course: string;
}

export interface Assignment {
  id: number;
  name: string;
  total: number;
  submitted: number;
  notSubmitted: number;
  rate: number;
}

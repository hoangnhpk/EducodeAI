import type { Student } from "./Types";

export const sampleData: { students: Student[] } = {
  students: [
    {
      id: 1,
      name: "Nguyễn Văn A",
      email: "nguyenvana@example.com",
      completion: 95,
      assignments: 12,
      avgScore: 9.2,
      status: "completed",
      // course: "HTML & CSS Cơ bản",
    },
    {
      id: 2,
      name: "Trần Thị B",
      email: "tranthib@example.com",
      completion: 78,
      assignments: 10,
      avgScore: 8.5,
      status: "in-progress",
      // course: "JavaScript Nâng cao",
    },
    {
      id: 3,
      name: "Lê Văn C",
      email: "levanc@example.com",
      completion: 45,
      assignments: 5,
      avgScore: 6.8,
      status: "at-risk",
      // course: "Python cho Người mới",
    },
    // ...
  ],
};

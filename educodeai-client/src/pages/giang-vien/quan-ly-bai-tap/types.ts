// DTO cho AI Practice Exercise (Lecturer Side)
// Cấu trúc khớp hoàn toàn với Backend (JsonPropertyNames)

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// 1. Request gửi lên AI để sinh bài tập
export interface GenerateBaiTapThucHanhDTO {
  lessonId: number;       // map từ maBaiHoc (Backend JsonPropertyName)
  maBaiHoc?: number;      // fallback cho backend property name (camel)
  MaBaiHoc?: number;      // fallback cho backend property name (Pascal)
  difficulty?: string;
  language?: string;
  topicTags?: string[];   // backend: [JsonPropertyName("topicTags")]
  estimatedTime?: number;
  customInstructions?: string;
}

// 2. Cấu trúc chi tiết bài tập (Hệ thống Nested DTO)
export interface BaiTapThucHanhData {
  metadata: {
    title: string;
    difficulty: string;
    language: string;
  };
  problemContent: {
    description: string;
  };
  hints: {
    title: string;
    content: string;
    level: number;
  }[];
  solution: {
    code: string;
    explanation: string;
  };
  evaluation: {
    testCases: TestCaseDto[];
  };
  system: {
    version: string;
    generatedAt: string;
    generatedBy: string;
    validated: boolean;
  };
}

// 3. Test case item (Mapping EXACT names from Backend)
export interface TestCaseDto {
  maTestCase?: number;
  input: string;       // backend: [JsonPropertyName("input")]
  output: string;      // backend: [JsonPropertyName("output")]
  expectedOutput?: string; // fallback mapping
  isHidden: boolean;   // backend: [JsonPropertyName("isHidden")]
  score: number;       // backend: [JsonPropertyName("score")]
}

// 4. DTO khi lưu bài tập (kèm maBaiHoc)
export interface SaveBaiTapThucHanhDTO extends BaiTapThucHanhData {
  maBaiHoc: number;
  maBaiTap?: number;
}

// 5. Item trong danh sách bài tập (phẳng)
export interface DanhSachBaiTapDTO {
  maBaiTap: number;
  tenBaiTap: string;
  loaiBaiTap: string;
  tenKhoaHoc: string;
  tenChuong: string;
  tenBaiHoc: string;
  trangThai: string;
}

// ============================================================
// QUIZ AI DTOs
// ============================================================

// 6. Request gửi lên AI để sinh quiz (match backend GenerateQuizAIDTO)
export interface GenerateQuizAIDTO {
  MaBaiHoc: number;
  SoCauHoi: number;
  DoKho: string;        // "Dễ" | "Trung bình" | "Khó"
  TieuDe: string;
  NoiDungTomTat: string;
}

// 7. Câu hỏi trắc nghiệm (match backend output schema)
export interface CauHoiQuizDTO {
  Id: number;
  NoiDung: string;
  LuaChon: string[];    // Mảng 4 đáp án A, B, C, D
  DapAnDung: string;    // "A" | "B" | "C" | "D"
}

// 8. Kết quả AI trả về (match backend GenerateQuizByAIAsync output)
export interface QuizAIData {
  'Tiêu đề': string;
  'Độ khó': string;
  'Câu hỏi': CauHoiQuizDTO[];
}

// 9. DTO khi lưu quiz (match backend CreateQuizDTO)
export interface CreateQuizDTO {
  MaBaiHoc: number;
  ThoiGianLamBai: number;
  DiemCanDat: number;
  ChoPhepLamLai: boolean;
  DaoCauHoi: boolean;
  DuLieuCauHoi: string; // JSON string của mảng câu hỏi
}


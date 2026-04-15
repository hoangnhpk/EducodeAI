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

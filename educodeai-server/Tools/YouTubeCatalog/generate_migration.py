import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CATALOG_PATH = Path(__file__).with_name("catalog.json")
MIGRATION_PATH = ROOT / "educodeai-server" / "Migrations" / "20260819165309_ReplaceCourseCatalogWithVietnamesePlaylists.cs"

COURSE_METADATA = [
    ("Web Development", "Người mới", "HTML, CSS, Responsive Web"),
    ("Web Development", "Người mới", "JavaScript, DOM, ES6"),
    ("Web Development", "Người mới", "TypeScript, JavaScript"),
    ("Web Development", "Trung cấp", "Next.js, React, TypeScript"),
    ("Web Development", "Trung cấp", "React, Hooks, JavaScript"),
    ("Full-stack Development", "Trung cấp", "SQL, Express, React, Node.js"),
    ("Backend Development", "Trung cấp", "NestJS, TypeScript, API"),
    ("Web Development", "Trung cấp", "Angular, TypeScript"),
    ("Backend Development", "Trung cấp", "FastAPI, Python, REST API"),
    ("Backend Development", "Người mới", "Python, Lập trình cơ bản"),
    ("Backend Development", "Người mới", "Python, Lập trình cơ bản"),
    ("Desktop Development", "Người mới", "Python, Tkinter, GUI"),
    ("AI & Machine Learning", "Trung cấp", "Python, Machine Learning"),
    ("Backend Development", "Trung cấp", "Java, Spring Boot"),
    ("Backend Development", "Người mới", "Java, OOP"),
    ("Backend Development", "Người mới", "C#, .NET"),
    ("Backend Development", "Người mới", "Java Core, OOP"),
    ("Backend Development", "Trung cấp", "ASP.NET Core, MVC"),
    ("Backend Development", "Người mới", "C#, .NET"),
    ("Web Development", "Trung cấp", "Blazor, C#"),
    ("Systems Programming", "Người mới", "C++, OOP"),
    ("Database", "Người mới", "SQL Server, SQL"),
    ("Database", "Người mới", "MongoDB, NoSQL"),
    ("Mobile Development", "Trung cấp", "React Native, JavaScript"),
    ("Database", "Người mới", "SQL, Phân tích dữ liệu"),
    ("Developer Tools", "Người mới", "Git, GitHub"),
    ("DevOps & Cloud", "Người mới", "Docker, Container"),
    ("Backend Development", "Người mới", "Go, Golang"),
    ("DevOps & Cloud", "Trung cấp", "Kubernetes, Container"),
    ("Backend Development", "Trung cấp", "Go, Gin, REST API"),
    ("Mobile Development", "Người mới", "Flutter, Dart"),
    ("Mobile Development", "Trung cấp", "Android, Kotlin, Jetpack Compose"),
    ("Data Science", "Người mới", "Python, Data Science"),
    ("Algorithms", "Trung cấp", "Thuật toán, Cấu trúc dữ liệu"),
    ("AI & Machine Learning", "Người mới", "Machine Learning, Python"),
    ("Web Development", "Người mới", "PHP, MySQL"),
    ("Web Development", "Trung cấp", "Laravel, PHP"),
    ("Web Development", "Trung cấp", "Vue.js, JavaScript"),
]


def sql_string(value: str) -> str:
    return "'" + value.replace("'", "''").replace("\x00", "") + "'"


def batched_insert(table: str, columns: list[str], rows: list[list[str]], size: int = 250) -> list[str]:
    quoted_columns = ", ".join(f'"{column}"' for column in columns)
    statements = []
    for start in range(0, len(rows), size):
        values = ",\n".join("(" + ", ".join(row) + ")" for row in rows[start:start + size])
        statements.append(f'INSERT INTO "{table}" ({quoted_columns}) VALUES\n{values};')
    return statements


def main() -> None:
    catalog = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    course_rows = []
    chapter_rows = []
    lesson_rows = []
    chapter_id = 0
    lesson_id = 0

    for course_id, course in enumerate(catalog, 1):
        entries = course["entries"]
        total_seconds = sum(int(entry["duration"]) for entry in entries)
        domain, level, skills = COURSE_METADATA[course_id - 1]
        description = (
            f"Khóa học tiếng Việt từ playlist YouTube của kênh {course.get('channel') or 'tác giả'}. "
            f"Gồm {len(entries)} bài học theo đúng thứ tự của danh sách phát."
        )
        course_rows.append([
            str(course_id), "1", sql_string(course["title"][:200]), sql_string(description),
            sql_string(course["thumbnail"]), sql_string("Hoạt động"), "0", sql_string(domain),
            sql_string(level), str(max(1, -(-total_seconds // 3600))), sql_string(skills),
            "FALSE", "80", "20", "30",
            str(10000 + (course_id % 6) * 1000), sql_string("VND"), "TRUE",
            "TIMESTAMPTZ '2026-08-19 00:00:00+00'",
        ])

        chapter_count = min(10, max(1, -(-len(entries) // 12)))
        if len(entries) >= 5:
            chapter_count = max(5, chapter_count)
        base_size, remainder = divmod(len(entries), chapter_count)
        cursor = 0

        for chapter_order in range(1, chapter_count + 1):
            size = base_size + (1 if chapter_order <= remainder else 0)
            group = entries[cursor:cursor + size]
            cursor += size
            chapter_id += 1
            chapter_title = f"Phần {chapter_order}: {group[0]['title']}"[:200]
            chapter_rows.append([str(chapter_id), str(course_id), sql_string(chapter_title), str(chapter_order)])

            for lesson_order, entry in enumerate(group, 1):
                lesson_id += 1
                duration = int(entry["duration"])
                content = f"<p>Bài học từ playlist {course['title'][:120]}.</p>"
                lesson_rows.append([
                    str(lesson_id), str(chapter_id), sql_string(entry["title"][:200]),
                    sql_string("Video"), sql_string(content), str(duration), sql_string(entry["url"]),
                    str(lesson_order), "TRUE", sql_string("youtube"), str(duration), "FALSE", "TRUE",
                ])

    statements = [
        """DO $$
BEGIN
    IF (SELECT COUNT(*) FROM "KhoaHocs") <> 38
       OR (SELECT COUNT(*) FROM "ChuongHocs") <> 123
       OR (SELECT COUNT(*) FROM "BaiHocs") <> 615 THEN
        RAISE EXCEPTION 'Course catalog preflight failed: expected 38 courses, 123 chapters and 615 lessons.';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM "NguoiDungs" WHERE "MaNguoiDung" = 1) THEN
        RAISE EXCEPTION 'Course catalog preflight failed: instructor MaNguoiDung=1 does not exist.';
    END IF;
END
$$;""",
        """DELETE FROM "VideoQuizs";
DELETE FROM "VideoChapters";
DELETE FROM "TestCaseThucHanhs";
DELETE FROM "BaiTapThucHanhs";
DELETE FROM "BaiTap_Quizs";
DELETE FROM "KetQuaLamBais";
DELETE FROM "BaiTaps";
DELETE FROM "GhiChuAIs";
DELETE FROM "GhiChuBaiHocs";
DELETE FROM "TienDoBaiHocs";
DELETE FROM "BinhLuans";
DELETE FROM "ChungChiKhoaHocs";
DELETE FROM "KetQuaKiemTraChungChis";
DELETE FROM "DanhGias";
DELETE FROM "DangKyKhoaHocs";
DELETE FROM "ChiTietDonHangs";
DELETE FROM "MaGiamGiaKhoaHocs";
DELETE FROM "MaQuaTangHocViens";
DELETE FROM "QuaTangKhoaHocs";
DELETE FROM "BaiHocs";
DELETE FROM "ChuongHocs";
DELETE FROM "KhoaHocs";""",
    ]
    statements += batched_insert(
        "KhoaHocs",
        ["MaKhoaHoc", "MaGiangVien", "TenKhoaHoc", "MoTa", "HinhAnh", "TrangThai", "DiemDanhGiaTB", "LinhVuc", "TrinhDo", "ThoiLuongGio", "KyNangChinh", "CoChungChi", "DiemDatChungChi", "SoCauHoiChungChi", "ThoiGianLamBaiChungChi", "GiaKhoaHoc", "DonViTienTe", "ChoPhepMua", "NgayTao"],
        course_rows,
    )
    statements += batched_insert("ChuongHocs", ["MaChuong", "MaKhoaHoc", "TenChuong", "ThuTu"], chapter_rows)
    statements += batched_insert(
        "BaiHocs",
        ["MaBaiHoc", "MaChuong", "TieuDe", "LoaiBaiHoc", "NoiDung", "ThoiLuong", "LinkVideo", "ThuTu", "CoQuiz", "VideoSource", "VideoDurationS", "HasSubtitle", "AiFeaturesEnabled"],
        lesson_rows,
    )
    statements.append("""SELECT setval(pg_get_serial_sequence('"KhoaHocs"', 'MaKhoaHoc'), (SELECT MAX("MaKhoaHoc") FROM "KhoaHocs"), TRUE);
SELECT setval(pg_get_serial_sequence('"ChuongHocs"', 'MaChuong'), (SELECT MAX("MaChuong") FROM "ChuongHocs"), TRUE);
SELECT setval(pg_get_serial_sequence('"BaiHocs"', 'MaBaiHoc'), (SELECT MAX("MaBaiHoc") FROM "BaiHocs"), TRUE);

DO $$
BEGIN
    IF (SELECT COUNT(*) FROM "KhoaHocs") <> 38
       OR (SELECT COUNT(*) FROM "ChuongHocs") <> 235
       OR (SELECT COUNT(*) FROM "BaiHocs") <> 2233 THEN
        RAISE EXCEPTION 'Course catalog insert verification failed.';
    END IF;
END
$$;""")

    sql = "\n\n".join(statements)
    migration = f'''using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace educodeai_server.Migrations
{{
    public partial class ReplaceCourseCatalogWithVietnamesePlaylists : Migration
    {{
        protected override void Up(MigrationBuilder migrationBuilder)
        {{
            migrationBuilder.Sql(
"""""
{sql}
""""");
        }}

        protected override void Down(MigrationBuilder migrationBuilder)
        {{
            throw new NotSupportedException("Course catalog replacement deletes linked production data and cannot be reversed safely. Restore a database backup instead.");
        }}
    }}
}}
'''
    MIGRATION_PATH.write_text(migration, encoding="utf-8", newline="\n")
    print(f"wrote {MIGRATION_PATH.name}: courses={len(course_rows)} chapters={len(chapter_rows)} lessons={len(lesson_rows)}")


if __name__ == "__main__":
    main()

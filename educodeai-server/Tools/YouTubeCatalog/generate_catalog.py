import json
import math
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
SOURCE_MANIFEST = Path("/tmp/youtube-catalog-fast/manifest.json")
OUTPUT_MANIFEST = Path(__file__).with_name("catalog.json")
SEED_DIRECTORY = ROOT / "educodeai-server" / "Data" / "DuLieuMau"

REPLACEMENTS = {
    "PLux-_phi0Rz2TB5D16sJzy3MgOht3IlND": "PLRb-vAn1juPTqQ25wH7EBSAj4IJjBjOl0",
    "PLux-_phi0Rz0nsE6QikvCgve8afhistvU": "PL8ppof8Rv4YBoHWD4M_a_ymNt1jNhIG3h",
    "PL88QwC-jiH9ByYqO0mVStNEHB6QT24yx1": "PLxm9OrzTzgvx_3G3XTVWOd3wQyYz-cKOC",
}

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


def fetch_playlist(playlist_id: str) -> dict:
    result = subprocess.run(
        [
            "python", "-m", "yt_dlp",
            f"https://www.youtube.com/playlist?list={playlist_id}",
            "--flat-playlist", "--dump-single-json", "--no-warnings",
        ],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=300,
        check=True,
    )
    raw = json.loads(result.stdout)
    entries = [
        {
            "id": entry["id"],
            "title": entry["title"],
            "duration": int(entry["duration"]),
            "url": f"https://www.youtube.com/watch?v={entry['id']}",
        }
        for entry in raw.get("entries", [])
        if entry and entry.get("id") and entry.get("title") and entry.get("duration")
    ]
    if not entries:
        raise RuntimeError(f"Playlist {playlist_id} không có video hợp lệ")
    return {
        "id": playlist_id,
        "title": raw.get("title"),
        "channel": raw.get("channel") or raw.get("uploader"),
        "thumbnail": f"https://i.ytimg.com/vi/{entries[0]['id']}/hqdefault.jpg",
        "entries": entries,
    }


def csharp(value: str | None) -> str:
    return (value or "").replace("\\", "\\\\").replace('"', '\\"').replace("\r", " ").replace("\n", " ")


def write_seed(path: Path, class_name: str, method: str, entity: str, rows: list[str]) -> None:
    rows_text = ",\n".join(rows)
    content = f"""using educodeai_server.Models;
using Microsoft.EntityFrameworkCore;

namespace educodeai_server.Data.DuLieuMau
{{
    public static class {class_name}
    {{
        public static void {method}(ModelBuilder modelBuilder)
        {{
            modelBuilder.Entity<{entity}>().HasData(
{rows_text}
            );
        }}
    }}
}}
"""
    path.write_text(content, encoding="utf-8", newline="\n")


def main() -> None:
    source = json.loads(SOURCE_MANIFEST.read_text(encoding="utf-8"))
    replacements = {playlist_id: fetch_playlist(playlist_id) for playlist_id in REPLACEMENTS.values()}
    catalog = []

    for course in source:
        if course["id"] in REPLACEMENTS:
            course = replacements[REPLACEMENTS[course["id"]]]
        entries = [
            entry for entry in course.get("entries", [])
            if entry.get("id") and entry.get("title") and entry.get("duration")
        ]
        if len(entries) != len(course.get("entries", [])):
            raise RuntimeError(f"Playlist còn video lỗi: {course['id']}")
        course["entries"] = entries
        course["thumbnail"] = course.get("thumbnail") or f"https://i.ytimg.com/vi/{entries[0]['id']}/hqdefault.jpg"
        catalog.append(course)

    if len(catalog) != 38:
        raise RuntimeError(f"Cần đúng 38 khóa học, nhận được {len(catalog)}")

    OUTPUT_MANIFEST.write_text(json.dumps(catalog, ensure_ascii=False, indent=2), encoding="utf-8")

    courses = []
    chapters = []
    lessons = []
    chapter_id = 0
    lesson_id = 0

    for course_id, course in enumerate(catalog, 1):
        entries = course["entries"]
        total_seconds = sum(int(entry["duration"]) for entry in entries)
        domain, level, skills = COURSE_METADATA[course_id - 1]
        title = course["title"][:200]
        description = (
            f"Khóa học tiếng Việt từ playlist YouTube của kênh {course.get('channel') or 'tác giả'}. "
            f"Gồm {len(entries)} bài học theo đúng thứ tự của danh sách phát."
        )
        courses.append(
            "                new KhoaHocModel { "
            f"MaKhoaHoc = {course_id}, MaGiangVien = 1, TenKhoaHoc = \"{csharp(title)}\", "
            f"MoTa = \"{csharp(description)}\", HinhAnh = \"{course['thumbnail']}\", "
            f"TrangThai = \"Hoạt động\", DiemDanhGiaTB = 0, LinhVuc = \"{domain}\", "
            f"TrinhDo = \"{level}\", ThoiLuongGio = {max(1, math.ceil(total_seconds / 3600))}, "
            f"KyNangChinh = \"{skills}\", GiaKhoaHoc = {10000 + (course_id % 6) * 1000}, "
            "DonViTienTe = \"VND\", ChoPhepMua = true, "
            "NgayTao = new DateTime(2026, 8, 19, 0, 0, 0, DateTimeKind.Utc) }"
        )

        chapter_count = min(10, max(1, math.ceil(len(entries) / 12)))
        if len(entries) >= 5:
            chapter_count = max(5, chapter_count)
        base_size, remainder = divmod(len(entries), chapter_count)
        cursor = 0

        for chapter_order in range(1, chapter_count + 1):
            size = base_size + (1 if chapter_order <= remainder else 0)
            group = entries[cursor:cursor + size]
            cursor += size
            chapter_id += 1
            first_title = re.sub(
                r"^\s*(?:bài|lesson|phần|part)?\s*\d+[\s.:|_-]*",
                "",
                group[0]["title"],
                flags=re.IGNORECASE,
            ).strip()
            chapter_title = f"Phần {chapter_order}: {first_title}"[:200]
            chapters.append(
                "                new ChuongHocModel { "
                f"MaChuong = {chapter_id}, MaKhoaHoc = {course_id}, "
                f"TenChuong = \"{csharp(chapter_title)}\", ThuTu = {chapter_order} }}"
            )

            for lesson_order, entry in enumerate(group, 1):
                lesson_id += 1
                duration = int(entry["duration"])
                lesson_title = entry["title"][:200]
                lessons.append(
                    "                new BaiHocModel { "
                    f"MaBaiHoc = {lesson_id}, MaChuong = {chapter_id}, "
                    f"TieuDe = \"{csharp(lesson_title)}\", LoaiBaiHoc = \"Video\", "
                    f"NoiDung = \"<p>Bài học từ playlist {csharp(course['title'][:120])}.</p>\", "
                    f"ThoiLuong = {duration}, LinkVideo = \"{entry['url']}\", ThuTu = {lesson_order}, "
                    "CoQuiz = true, VideoSource = \"youtube\", "
                    f"VideoDurationS = {duration}, HasSubtitle = false, AiFeaturesEnabled = true }}"
                )

    write_seed(SEED_DIRECTORY / "KhoaHocDuLieu.cs", "KhoaHocDuLieu", "SeedKhoaHoc", "KhoaHocModel", courses)
    write_seed(SEED_DIRECTORY / "ChuongHocDuLieu.cs", "ChuongHocDuLieu", "SeedChuongHoc", "ChuongHocModel", chapters)
    write_seed(SEED_DIRECTORY / "BaiHocDuLieu.cs", "BaiHocDuLieu", "SeedBaiHoc", "BaiHocModel", lessons)
    print(f"generated courses={len(courses)} chapters={len(chapters)} lessons={len(lessons)}")


if __name__ == "__main__":
    main()

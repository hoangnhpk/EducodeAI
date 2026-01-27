import { useEffect, useState } from "react";
import "../../../layouts/hoc-vien/LichSuLamBai.css";

type Course = {
    id: number;
    title: string;
    img: string;
    total: number;
    done: number;
    avg: number;
};

type Assignment = {
    id: number;
    courseId: number;
    title: string;
    type: "Quiz" | "Code";
    date: string;
    score: number;
    max: number;
    status: "Dat" | "Truot";
    testCases?: string;
    codeContent?: string;
};

const LichSuBaiLam = () => {
    const [view, setView] = useState<"courses" | "assignments">("courses");
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [selectedAssignments, setSelectedAssignments] = useState<Assignment[]>([]);
    const [codeContent, setCodeContent] = useState("");
    const [codeResult, setCodeResult] = useState("");

    // ===== MOCK DATA =====
const courses: Course[] = [
    {
        id: 101,
        title: "ReactJS Chuyên Sâu",
        img: "https://evonhub.dev/_next/image?url=https%3A%2F%2Futfs.io%2Ff%2F50be40a2-35e9-4420-9f8a-3a769f0a8a17-d8ajqo.jpg&w=3840&q=75",
        total: 10,
        done: 8,
        avg: 8.5
    },
    {
        id: 102,
        title: "NodeJS Backend API",
        img: "https://bs-uploads.toptal.io/blackfish-uploads/components/open_graph_image/10227551/og_image/optimized/secure-rest-api-in-nodejs-18f43b3033c239da5d2525cfd9fdc98f.png",
        total: 8,
        done: 3,
        avg: 7
    },
    {
        id: 103,
        title: "Python cho người mới",
        img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2ayN25rl3JiiPSyghAuC-8TSeD-R-o7l9yQ&s",
        total: 15,
        done: 15,
        avg: 9.8
    },
    {
        id: 104,
        title: "HTML5 & CSS3 Cơ Bản",
        img: "https://images.viblo.asia/994c4f3f-7ef1-4461-9be3-bf13f7ecbfc5.jpg",
        total: 12,
        done: 6,
        avg: 6.5
    }
];

const assignments: Assignment[] = [
    // ===== ReactJS Chuyên Sâu =====
    {
        id: 1,
        courseId: 101,
        title: "Quiz: JSX & Components",
        type: "Quiz",
        date: "20/01/2026",
        score: 100,
        max: 100,
        status: "Dat"
    },
    {
        id: 2,
        courseId: 101,
        title: "Code: Xây dựng Counter",
        type: "Code",
        date: "21/01/2026",
        score: 80,
        max: 100,
        status: "Dat",
        testCases: "4/5 cases",
        codeContent: `function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button onClick={() => setCount(count + 1)}>
      {count}
    </button>
  );
}`
    },

    // ===== NodeJS Backend API =====
    {
        id: 3,
        courseId: 102,
        title: "Quiz: Modules & Require",
        type: "Quiz",
        date: "22/01/2026",
        score: 60,
        max: 100,
        status: "Dat"
    },
    {
        id: 4,
        courseId: 102,
        title: "Code: Express Hello World",
        type: "Code",
        date: "23/01/2026",
        score: 0,
        max: 100,
        status: "Truot",
        testCases: "0/3 cases",
        codeContent: `const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(3000);`
    },

    // ===== Python cho người mới =====
    {
        id: 5,
        courseId: 103,
        title: "Code: Tính tổng List",
        type: "Code",
        date: "10/01/2026",
        score: 100,
        max: 100,
        status: "Dat",
        testCases: "5/5 cases",
        codeContent: `def sum_list(arr):
    total = 0
    for x in arr:
        total += x
    return total`
    },
    {
        id: 6,
        courseId: 103,
        title: "Code: Đảo ngược chuỗi",
        type: "Code",
        date: "11/01/2026",
        score: 100,
        max: 100,
        status: "Dat",
        testCases: "3/3 cases",
        codeContent: `def reverse_string(s):
    return s[::-1]`
    },

    // ===== HTML5 & CSS3 Cơ Bản =====
    {
        id: 7,
        courseId: 104,
        title: "Quiz: Các thẻ Semantic",
        type: "Quiz",
        date: "05/01/2026",
        score: 40,
        max: 100,
        status: "Truot"
    }
];


    // ===== HANDLERS =====
    const selectCourse = (course: Course) => {
        setSelectedCourse(course);
        setSelectedAssignments(assignments.filter(a => a.courseId === course.id));
        setView("assignments");
    };

    const openCodeReview = (ass: Assignment) => {
        setCodeContent(ass.codeContent || "");
        setCodeResult(ass.testCases || "");
        // @ts-ignore
        new window.bootstrap.Modal(document.getElementById("codeModal")).show();
    };

    return (
        <>

            {/* ===== HEADER ===== */}
            <div className="container-fluid page-header py-5 mb-5 bg-primary position-relative">
                <img
                    src="https://png.pngtree.com/png-clipart/20230914/original/pngtree-classroom-group-work-png-image_12154520.png"
                    alt="Lịch sử bài làm"
                    className="header-img"
                />

                <div className="container text-center text-white position-relative">
                    <h1 className="display-3">Lịch Sử Bài Làm</h1>
                    <p>Theo dõi hành trình chinh phục Code của bạn</p>
                </div>
            </div>


            <div className="container py-5">

                {/* ===== VIEW COURSES ===== */}
                {view === "courses" && (
                    <>
                        <div className="text-center mb-5">
                            <h6 className="text-primary">THÀNH TỰU</h6>
                            <h1>Các Khóa Học Đang Theo Đuổi</h1>
                        </div>

                        <div className="row g-4">
                            {courses.map(c => (
                                <div className="col-lg-6" key={c.id}>
                                    <div
                                        className="bg-light p-4 rounded shadow-sm course-card"
                                        onClick={() => selectCourse(c)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <div className="d-flex align-items-center mb-3">
                                            <img src={c.img} className="rounded me-3" width={60} />
                                            <div>
                                                <h5>{c.title}</h5>
                                                <small>{c.done}/{c.total} thử thách</small>
                                            </div>
                                        </div>

                                        <div className="progress mb-2" style={{ height: 6 }}>
                                            <div
                                                className="progress-bar bg-primary"
                                                style={{ width: `${(c.done / c.total) * 100}%` }}
                                            />
                                        </div>

                                        <div className="d-flex justify-content-between small">
                                            <span>Tiến độ</span>
                                            <span className="fw-bold text-primary">Điểm TB: {c.avg}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* ===== VIEW ASSIGNMENTS ===== */}
                {view === "assignments" && selectedCourse && (
                    <>
                        <button className="btn btn-outline-primary mb-4" onClick={() => setView("courses")}>
                            <i className="fa fa-arrow-left me-2"></i> Chọn khóa học khác
                        </button>

                        <div className="d-flex justify-content-between mb-4">
                            <h2>{selectedCourse.title}</h2>
                            <span className="badge bg-primary fs-6">Điểm TB: {selectedCourse.avg}</span>
                        </div>

                        <div className="table-responsive bg-light p-4 rounded">
                            <table className="table bg-white align-middle">
                                <thead>
                                    <tr>
                                        <th>Tên Thử Thách</th>
                                        <th className="text-center">Loại bài</th>
                                        <th className="text-center">Ngày hoàn thành</th>
                                        <th className="text-center">Kết quả</th>
                                        <th className="text-center">Trạng thái</th>
                                        <th className="text-end">Hành động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedAssignments.map(a => (
                                        <tr key={a.id}>
                                            <td className="fw-bold">{a.title}</td>
                                            <td className="text-center">{a.type}</td>
                                            <td className="text-center">{a.date}</td>
                                            <td className="text-center">
                                                {a.type === "Quiz" ? `${a.score}/${a.max}` : a.testCases}
                                            </td>
                                            <td className="text-center">
                                                <span className={`badge ${a.status === "Dat" ? "bg-success" : "bg-danger"}`}>
                                                    {a.status === "Dat" ? "Hoàn thành" : "Chưa đạt"}
                                                </span>
                                            </td>
                                            <td className="text-end">
                                                {a.type === "Code" && (
                                                    <button className="btn btn-sm btn-outline-info"
                                                        onClick={() => openCodeReview(a)}>
                                                        <i className="fa fa-code"></i> Xem Code
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>

            {/* ===== CODE MODAL ===== */}
            <div className="modal fade" id="codeModal">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header bg-dark text-white">
                            <h5 className="modal-title">Giải Pháp Đã Nộp</h5>
                            <button className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body p-0">
                            <div className="p-3 bg-light border-bottom">
                                <strong>Kết quả:</strong>
                                <span className="badge bg-success ms-2">{codeResult}</span>
                            </div>
                            <pre style={{ background: "#1e1e1e", color: "#d4d4d4", padding: 20 }}>
                                <code>{codeContent}</code>
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default LichSuBaiLam;

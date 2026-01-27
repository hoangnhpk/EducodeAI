import { Eye, Trash2, CheckCircle, XCircle } from "lucide-react";


const mockReviews = [
    {
        id: 1,
        user: "Nguyễn Văn A",
        course: "React từ cơ bản",
        rating: 5,
        content: "Khóa học rất hay, dễ hiểu",
        status: "approved",
    },
    {
        id: 2,
        user: "Trần Thị B",
        course: "ASP.NET Core",
        rating: 2,
        content: "Giảng nhanh, khó theo",
        status: "pending",
    },
];


export default function ReviewTable() {
    return (
        <div className="bg-white rounded-2xl shadow overflow-x-auto">
            <table className="w-full text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-3 text-left">Học viên</th>
                        <th className="p-3 text-left">Khóa học</th>
                        <th className="p-3">Sao</th>
                        <th className="p-3 text-left">Nội dung</th>
                        <th className="p-3">Trạng thái</th>
                        <th className="p-3">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {mockReviews.map((r) => (
                        <tr key={r.id} className="border-t">
                            <td className="p-3">{r.user}</td>
                            <td className="p-3">{r.course}</td>
                            <td className="p-3 text-center">⭐ {r.rating}</td>
                            <td className="p-3 max-w-xs truncate">{r.content}</td>
                            <td className="p-3 text-center">
                                {r.status === "approved" && (
                                    <span className="text-green-600">Đã duyệt</span>
                                )}
                                {r.status === "pending" && (
                                    <span className="text-yellow-600">Chờ duyệt</span>
                                )}
                            </td>
                            <td className="p-3">
                                <div className="flex gap-2 justify-center">
                                    <button title="Xem chi tiết"><Eye size={18} /></button>
                                    <button title="Duyệt"><CheckCircle size={18} className="text-green-600" /></button>
                                    <button title="Ẩn"><XCircle size={18} className="text-yellow-600" /></button>
                                    <button title="Xóa"><Trash2 size={18} className="text-red-600" /></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
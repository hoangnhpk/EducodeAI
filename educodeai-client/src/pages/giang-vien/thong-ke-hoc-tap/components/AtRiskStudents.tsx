import type { Student } from "./Types";
import {
    AlertTriangle,
    Mail
} from "lucide-react";

const AtRiskStudents = ({ students }: { students: Student[] }) => {
    const atRiskStudents = students
        .filter(s => s.status === 'at-risk' || s.completion < 50)
        .slice(0, 5);

    return (
        <div className="bg-white rounded-xl shadow-sm">
            <div className="p-4 border-b border-gray-200">
                <h5 className="font-semibold flex items-center gap-2 text-gray-800">
                    <AlertTriangle className="text-red-500" size={20} />
                    Học viên có nguy cơ bỏ học
                </h5>
            </div>
            <div className="p-4 space-y-3">
                {atRiskStudents.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">Không có học viên có nguy cơ bỏ học</p>
                ) : (
                    atRiskStudents.map(student => (
                        <div key={student.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200 hover:shadow-md transition-all">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center text-white">
                                <AlertTriangle size={20} />
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold text-gray-800">{student.name}</div>
                                <div className="text-sm text-gray-600">{student.email}</div>
                                <div className="text-xs text-red-600 mt-1">Hoàn thành: {student.completion}%</div>
                            </div>
                            <button className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2 text-sm">
                                <Mail size={16} />
                                Liên hệ
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AtRiskStudents;
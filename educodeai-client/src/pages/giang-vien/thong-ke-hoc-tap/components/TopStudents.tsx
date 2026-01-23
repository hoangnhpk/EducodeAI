import { Trophy } from "lucide-react";
import type { Student } from "./Types";


const TopStudents = ({ students }: { students: Student[] }) => {
  const topStudents = [...students]
    .sort((a, b) => b.avgScore - a.avgScore)
    .slice(0, 5);

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h5 className="font-semibold flex items-center gap-2 text-gray-800">
          <Trophy className="text-yellow-500" size={20} />
          Top học viên xuất sắc
        </h5>
      </div>
      <div className="p-4 space-y-3">
        {topStudents.map((student, idx) => (
          <div key={student.id} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200 hover:shadow-md transition-all">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-white font-bold">
              {idx + 1}
            </div>
            <div className="flex-1">
              <div className="font-semibold text-gray-800">{student.name}</div>
              <div className="text-sm text-gray-600">{student.email}</div>
            </div>
            <div className="font-bold text-lg text-orange-600">{student.avgScore}/10</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopStudents;
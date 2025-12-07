import React from "react";
import { ArrowLeft, Home, BookOpen, TrendingUp, User } from "lucide-react";
import StudentNavigation from "../components/StudentNavigation";

export default function StudentSubjects() {
  const subjects = [
    {
      id: 1,
      name: "Mathematics",
      type: "Core",
      attendance: 92,
      attended: 23,
      total: 25,
      status: "On track",
      statusColor: "bg-blue-100 text-blue-700",
      barColor: "bg-emerald-500",
      message: "Safe above 75% rule",
      typeColor: "bg-blue-600"
    },
    {
      id: 2,
      name: "Physics",
      type: "Lab",
      attendance: 78,
      attended: 18,
      total: 23,
      status: "Near threshold",
      statusColor: "bg-blue-100 text-blue-700",
      barColor: "bg-amber-500",
      message: "Stay regular to keep 75%+",
      typeColor: "bg-blue-600"
    },
    {
      id: 3,
      name: "Chemistry",
      type: "Theory",
      attendance: 64,
      attended: 16,
      total: 25,
      status: "At risk",
      statusColor: "bg-blue-600 text-white", // Adjusted to match design roughly, or stick to standard pills
      barColor: "bg-rose-500",
      message: "Need 4 more classes to reach 75%",
      typeColor: "bg-blue-600"
    },
    {
      id: 4,
      name: "Computer Science",
      type: "Elective",
      attendance: 85,
      attended: 17,
      total: 20,
      status: "Comfortable",
      statusColor: "bg-blue-100 text-blue-700",
      barColor: "bg-emerald-500",
      message: "Well above safe zone",
      typeColor: "bg-blue-600"
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* 2. Sidebar (Desktop) */}
      <StudentNavigation activePage="subjects" />

      {/* 3. Main Content */}
      <main className="md:ml-64 p-6 md:p-8 pb-24 md:pb-8 animate-in fade-in duration-500">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Subjects</h2>
              <p className="text-slate-500 text-sm">Attendance overview by subject</p>
            </div>
          </div>

          {/* Subjects List */}
          <div className="space-y-6">
            {subjects.map((sub) => (
              <div key={sub.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                
                {/* Card Header */}
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">{sub.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${sub.typeColor}`}>
                    {sub.type}
                  </span>
                </div>

                {/* Percentage Row */}
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm text-slate-400 font-medium">Attendance</span>
                  <span className="text-lg font-bold text-slate-800">{sub.attendance}%</span>
                </div>

                {/* Progress Bar */}
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden mb-3">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${sub.barColor}`} 
                    style={{ width: `${sub.attendance}%` }}
                  ></div>
                </div>

                {/* Stats Row */}
                <div className="flex justify-between items-start mt-4">
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-slate-400">
                      Attended: {sub.attended}/{sub.total} classes ({sub.attendance}%)
                    </p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      sub.status === 'At risk' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {sub.status}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 mt-auto">{sub.message}</span>
                </div>

              </div>
            ))}
          </div>

        </div>
      </main>
    </div>
  );
}

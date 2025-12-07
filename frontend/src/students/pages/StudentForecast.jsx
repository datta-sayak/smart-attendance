import React, { useState } from "react";
import { 
  ArrowLeft, 
  Info, 
  CheckCircle, 
  AlertCircle, 
  Calculator,
  History, Home, BookOpen, TrendingUp, User
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import StudentNavigation from "../components/StudentNavigation"

export default function StudentForecast() {
  const [classesToAttend, setClassesToAttend] = useState(12);
  
  // Mock calculation constants
  const currentAttendance = 74;
  const totalClassesSoFar = 40;
  const futureClassesMax = 20;

  // Simple linear projection for the demo
  // Formula: (Present + New) / (Total + New) * 100
  const presentSoFar = (currentAttendance / 100) * totalClassesSoFar;
  const projectedScore = Math.round(
    ((presentSoFar + classesToAttend) / (totalClassesSoFar + classesToAttend)) * 100
  );

  const isEligible = projectedScore >= 75;
  const classesNeeded = isEligible ? 0 : 3; // Mock value logic

  // Chart Data
  const chartData = [
    { name: "Score", value: projectedScore, color: isEligible ? "#10B981" : "#F59E0B" },
    { name: "Remaining", value: 100 - projectedScore, color: "#E5E7EB" },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col md:flex-row font-sans text-slate-800">
      
      {/* 1. Sidebar */}
      <StudentNavigation activePage="forecast" />

      {/* 2. Main Content */}
      <main className="flex-1 md:ml-64 p-6 md:p-8 pb-24 md:pb-8 animate-in fade-in duration-500">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">History & forecast</h2>
              <p className="text-slate-500 text-sm">See how attendance impacts eligibility</p>
            </div>
          </div>

          {/* Info Card */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex gap-4">
            <div className="flex-shrink-0 mt-1">
              <Info className="text-blue-600" size={24} />
            </div>
            <div className="space-y-2">
              <h4 className="text-base font-bold text-blue-900">How attendance affects you</h4>
              <p className="text-xs text-blue-700 leading-relaxed">
                Most exams require at least 75% attendance to be eligible for finals.
              </p>
              <ul className="text-xs text-blue-700 space-y-1 list-disc pl-4">
                <li><span className="font-semibold">Below 75%:</span> You may not be allowed to write exams.</li>
                <li><span className="font-semibold">75-85%:</span> You are in a safe but watchful zone.</li>
                <li><span className="font-semibold">Above 85%:</span> You are comfortably eligible.</li>
              </ul>
            </div>
          </div>

          {/* Simulation Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-8">
            
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Forecast your score</h3>
                <p className="text-xs text-slate-500">Plan your next classes and see how your overall percentage changes.</p>
              </div>
              <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide">
                Simulation
              </span>
            </div>

            {/* Slider Controls */}
            <div className="space-y-4">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-slate-600">If I attend the next number of classes</span>
                <span className="text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">{classesToAttend} classes</span>
              </div>
              
              <div className="relative h-2 bg-gray-100 rounded-full">
                <div 
                  className="absolute top-0 left-0 h-full bg-indigo-600 rounded-full transition-all duration-150" 
                  style={{width: `${(classesToAttend / futureClassesMax) * 100}%`}}
                ></div>
                <input 
                  type="range" 
                  min="0" 
                  max={futureClassesMax} 
                  value={classesToAttend} 
                  onChange={(e) => setClassesToAttend(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {/* Thumb Visual (Optional custom thumb logic can be complex, default slider works for functionality) */}
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>0</span>
                <span>{futureClassesMax}</span>
              </div>
            </div>

            {/* Results Grid */}
            <div className="flex flex-col sm:flex-row items-center gap-8 pt-4">
              
              {/* Donut Chart */}
              <div className="relative w-32 h-32 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      innerRadius={50}
                      outerRadius={60}
                      startAngle={90}
                      endAngle={-270}
                      dataKey="value"
                      stroke="none"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className={`text-2xl font-bold ${isEligible ? 'text-emerald-600' : 'text-amber-500'}`}>
                    {projectedScore}%
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase font-medium">Expected<br/>Score</span>
                </div>
              </div>

              {/* Stats & Verdict */}
              <div className="flex-1 w-full space-y-6">
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-gray-500 text-xs">Current score</p>
                    <p className="font-semibold text-slate-800">{currentAttendance}%</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-gray-500 text-xs">After attending</p>
                    <p className={`font-bold ${isEligible ? 'text-emerald-600' : 'text-amber-500'}`}>
                      {projectedScore}%
                    </p>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-gray-50 flex justify-between items-center">
                    <p className="text-gray-500 text-xs">Classes needed for 75%</p>
                    <p className="font-bold text-slate-800">{classesNeeded} more</p>
                  </div>
                </div>

                {/* Eligibility Pill */}
                <div className={`rounded-xl p-4 flex items-start gap-3 ${
                  isEligible ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"
                }`}>
                  {isEligible ? <CheckCircle size={20} className="mt-0.5" /> : <AlertCircle size={20} className="mt-0.5" />}
                  <div>
                    <h4 className="font-bold text-sm">
                      {isEligible ? "Eligible for finals" : "Not yet eligible"}
                    </h4>
                    <p className="text-xs opacity-90 mt-1">
                      {isEligible 
                        ? "You will be safely above the 75% rule." 
                        : "You need to attend more classes to reach the safe zone."}
                    </p>
                  </div>
                </div>

              </div>
            </div>

            <p className="text-[10px] text-gray-400 text-center pt-4 border-t border-gray-50">
              This is an estimate based on current data. Actual values may change if future classes are cancelled or rescheduled.
            </p>

          </div>

        </div>
      </main>
    </div>
  );
}

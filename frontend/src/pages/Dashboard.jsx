import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { getTodaySchedule } from "../api/schedule";
import {
  Bell,
  Download,
  Play,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  ChevronRight,
  Loader2,
  AlertTriangle
} from "lucide-react"; // Assuming you use lucide-react, or replace with your icons

export default function Dashboard() {
  const [user] = useState(() => {
    const data = localStorage.getItem("user");
    return data ? JSON.parse(data) : null;
  });
  const [mlStatus, setMlStatus] = useState("checking"); // checking, ready, waking-up
  const [todayClasses, setTodayClasses] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);

  useEffect(() => {
    const checkMlService = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        setMlStatus("waking-up");
      }, 10000); // If pending for > 10s, it's likely waking up

      try {
        const response = await axios.get(import.meta.env.VITE_ML_SERVICE_URL, {
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.status === 200) {
          setMlStatus("ready");
        }
      } catch {
        clearTimeout(timeoutId);
        // If it fails, assume it's waking up or down. 
        // Render free tier might just timeout the first request or return 502 temporarily.
        setMlStatus("waking-up");
      }
    };

    // Initial check
    checkMlService();

    // Poll every 30 seconds
    const interval = setInterval(checkMlService, 30000);

    return () => clearInterval(interval);
  }, []);

  // Fetch today's schedule
  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const data = await getTodaySchedule();
        setTodayClasses(data.classes || []);
      } catch (error) {
        console.error("Failed to fetch schedule:", error);
        setTodayClasses([]);
      } finally {
        setLoadingSchedule(false);
      }
    };
    fetchSchedule();
  }, []);

  // Helper function to get class status based on time
  const getClassStatus = (startTime, endTime) => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (currentMinutes > endMinutes) {
      return { status: 'completed', color: 'success', label: 'Completed' };
    } else if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
      return { status: 'live', color: 'warning', label: 'Pending' };
    } else {
      const minutesUntil = startMinutes - currentMinutes;
      return {
        status: 'upcoming',
        color: 'primary',
        label: 'Upcoming',
        startsIn: minutesUntil
      };
    }
  };

  // Get next upcoming class
  const getNextClass = () => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    for (const cls of todayClasses) {
      const [startHour, startMin] = cls.start_time.split(':').map(Number);
      const startMinutes = startHour * 60 + startMin;

      if (startMinutes > currentMinutes) {
        return cls;
      }
    }
    return null;
  };

  const getStatusBadge = () => {
    switch (mlStatus) {
      case "ready":
        return (
          <span className="text-xs font-medium text-[var(--success)] bg-[var(--success)]/10 px-2 py-1 rounded flex items-center gap-1">
            <CheckCircle size={12} />
            Face recognition is ready
          </span>
        );
      case "waking-up":
        return (
          <span className="text-xs font-medium text-[var(--warning)] bg-[var(--warning)]/10 px-2 py-1 rounded flex items-center gap-1">
            <AlertTriangle size={12} />
            Waking up ML service...
          </span>
        );
      case "checking":
      default:
        return (
          <span className="text-xs font-medium text-[var(--text-body)] bg-[var(--bg-secondary)] px-2 py-1 rounded flex items-center gap-1">
            <Loader2 size={12} className="animate-spin" />
            Checking system status...
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* --- SECTION 1: PAGE HEADER --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-main)]">Teacher dashboard</h1>
            <p className="text-[var(--text-body)] mt-1">Overview of today's attendance and upcoming classes</p>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] rounded-lg hover:bg-[var(--bg-hover)] font-medium transition-colors flex items-center gap-2 cursor-pointer">
              <Download size={18} />
              Download report
            </button>
            <Link to="/start-attendance" className="hover:bg-[var(--primary-hover)] px-4 py-2 bg-[var(--primary)] text-[var(--text-on-primary)] rounded-lg hover:bg-[var(--primary-hover)] font-medium shadow-sm flex items-center gap-2 transition-colors">
              <Play size={18} fill="currentColor" />
              Start attendance
            </Link>
          </div>
        </div>

        {/* --- SECTION 2: MAIN GRID LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT COLUMN (Wider - 8 cols) */}
          <div className="lg:col-span-8 space-y-6">

            {/* 2.1 Welcome / Active Session Card */}
            <div className="bg-[var(--bg-card)] text-[var(--text-body)] rounded-2xl p-6 shadow-sm border border-[var(--border-color)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-main)]">Good morning, {user?.name || "Teacher"}</h2>
                  <p className=" text-sm text-[var(--text-body)] opacity-80">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} • {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {!loadingSchedule && getNextClass() ? (
                    <>
                      <span className="px-3 py-1 bg-[var(--bg-secondary)] text-[var(--text-body)] rounded-full font-medium">
                        Next class: {getNextClass().subject || 'Class'} • {getNextClass().start_time}
                      </span>
                      {getNextClass().room && (
                        <span className="px-3 py-1 bg-[var(--bg-secondary)] text-[var(--text-body)] rounded-full font-medium">
                          Room {getNextClass().room}
                        </span>
                      )}
                    </>
                  ) : !loadingSchedule ? (
                    <span className="px-3 py-1 bg-[var(--bg-secondary)] text-[var(--text-body)] rounded-full font-medium">
                      No upcoming classes today
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-[var(--bg-secondary)] text-[var(--text-body)] rounded-full font-medium">
                      Loading schedule...
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 w-full md:w-auto">
                {getStatusBadge()}
                <Link to="/attendance-session" className="w-full md:w-auto px-6 py-3 bg-[var(--primary)] text-[var(--text-on-primary)] rounded-xl font-semibold hover:bg-[var(--primary-hover)] transition shadow-md text-center">
                  Start attendance session
                </Link>
                <div className="flex items-center gap-1.5 text-xs text-[var(--success)] font-medium">
                  <CheckCircle size={14} />
                  Camera and permissions checked
                </div>
              </div>
            </div>

            {/* 2.2 Stats Row (Blue Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Stat 1 */}
              <div className="bg-[var(--action-info-bg)] text-[var(--text-on-primary)] rounded-2xl p-5 relative overflow-hidden">
                <p className="text-[var(--text-on-primary)]/80 text-sm font-medium mb-1">Today's attendance rate</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-3xl font-bold">94%</h3>
                  <span className="text-xs bg-[var(--text-on-primary)]/15 px-2 py-1 rounded text-[var(--text-on-primary)]/90">+3% vs last week</span>
                </div>
              </div>

              {/* Stat 2 */}
              <div className="bg-[var(--action-info-bg)] text-[var(--text-on-primary)] rounded-2xl p-5">
                <p className="text-[var(--text-on-primary)]/80 text-sm font-medium mb-1">Absent</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-3xl font-bold">7</h3>
                  <span className="text-xs text-[var(--text-on-primary)]/80">Across all classes</span>
                </div>
              </div>

              {/* Stat 3 */}
              <div className="bg-[var(--action-info-bg)] text-[var(--text-on-primary)] rounded-2xl p-5">
                <p className="text-[var(--text-on-primary)]/80 text-sm font-medium mb-1">Late arrivals</p>
                <div className="flex items-end justify-between">
                  <h3 className="text-3xl font-bold">3</h3>
                  <span className="text-xs text-[var(--text-on-primary)]/80">First period</span>
                </div>
              </div>
            </div>

            {/* 2.3 Quick Actions Row (Light Gray Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Link to="/students" className="block">
                <div className="bg-[var(--bg-secondary)] p-5 rounded-2xl cursor-pointer hover:bg-[var(--bg-hover)] transition">
                  <div className="font-semibold text-[var(--text-main)] mb-1">View student list</div>
                  <div className="text-xs text-[var(--text-body)]">Search, filter and manage profiles</div>
                </div>
              </Link>
              <Link to="/attendance" className="block">
                <div className="bg-[var(--bg-secondary)] p-5 rounded-2xl cursor-pointer hover:bg-[var(--bg-hover)] transition">
                  <div className="font-semibold text-[var(--text-main)] mb-1">Go to attendance</div>
                  <div className="text-xs text-[var(--text-body)]">Open live marking screen</div>
                </div>
              </Link>
              <Link to="/" className="block">
                <div className="bg-[var(--bg-secondary)] p-5 rounded-2xl cursor-pointer hover:bg-[var(--bg-hover)] transition">
                  <div className="font-semibold text-[var(--text-main)] mb-1">Manage schedule</div>
                  <div className="text-xs text-[var(--text-body)]">Edit classes and timetables</div>
                </div>
              </Link>
            </div>

          </div>

          {/* RIGHT COLUMN (Narrower - 4 cols) */}
          <div className="lg:col-span-4 space-y-6">

            {/* 3.1 Trends Chart Placeholder */}
            <div className="bg-[var(--bg-card)] p-6 rounded-2xl shadow-sm border border-[var(--border-color)]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-[var(--text-main)]">Attendance trends</h3>
                <span className="text-xs text-[var(--text-body)] bg-[var(--bg-secondary)] px-2 py-1 rounded">This week</span>
              </div>

              {/* Chart Placeholder Box */}
              <div className="h-40 bg-[var(--bg-secondary)] rounded-xl w-full flex items-center justify-center text-[var(--text-body)]/50 mb-4 border border-dashed border-[var(--border-color)]">
                Chart Area
              </div>

              <div className="flex justify-center gap-4 text-xs">
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[var(--primary)]"></span> Present</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[var(--text-body)]/30"></span> Absent</div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[var(--warning)]/50"></span> Late</div>
              </div>
            </div>

            {/* 3.2 Upcoming Classes List */}
            <div className="space-y-3">
              {loadingSchedule ? (
                <div className="bg-[var(--bg-card)] p-8 rounded-xl text-center border border-[var(--border-color)]">
                  <Loader2 className="mx-auto mb-3 text-[var(--text-body)]/30 animate-spin" size={32} />
                  <p className="text-[var(--text-body)]">Loading schedule...</p>
                </div>
              ) : todayClasses.length === 0 ? (
                <div className="bg-[var(--bg-card)] p-8 rounded-xl text-center border border-[var(--border-color)]">
                  <Calendar className="mx-auto mb-3 text-[var(--text-body)]/30" size={48} />
                  <p className="text-[var(--text-body)]">No classes scheduled for today</p>
                </div>
              ) : (
                todayClasses.map((cls, index) => {
                  const status = getClassStatus(cls.start_time, cls.end_time);
                  const borderColorMap = {
                    success: 'border-l-[var(--success)]',
                    warning: 'border-l-[var(--warning)]',
                    primary: 'border-l-[var(--primary)]'
                  };
                  const bgColorMap = {
                    success: 'bg-[var(--success)]/10 text-[var(--success)]',
                    warning: 'bg-[var(--warning)]/10 text-[var(--warning)]',
                    primary: 'bg-[var(--primary)]/10 text-[var(--primary)]'
                  };

                  return (
                    <div
                      key={index}
                      className={`bg-[var(--bg-card)] p-4 rounded-xl shadow-sm border border-[var(--border-color)] border-l-4 ${borderColorMap[status.color]}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-[var(--text-main)]">
                          {cls.subject || 'Class'}
                        </h4>
                        <span className={`px-2 py-0.5 ${bgColorMap[status.color]} text-[10px] font-bold uppercase tracking-wide rounded-full`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="text-xs text-[var(--text-body)] flex flex-col gap-1">
                          <span className="flex items-center gap-1">
                            <Clock size={12} /> {cls.start_time} - {cls.end_time}
                          </span>
                          {cls.room && <span>Room {cls.room}</span>}
                        </div>
                        {status.status === 'upcoming' && status.startsIn && (
                          <span className="text-xs font-medium text-[var(--primary)]">
                            Starts in {status.startsIn} min
                          </span>
                        )}
                        {status.status === 'completed' && cls.attendance_status && (
                          <span className="text-xs font-medium text-[var(--text-body)]">
                            {cls.attendance_status}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
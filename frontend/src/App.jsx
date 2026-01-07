// frontend/src/App.jsx
import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import Dashboard from "./pages/Dashboard";
import MarkAttendance from "./pages/MarkAttendance";
import StudentList from "./pages/StudentList";
import { useTheme } from "./theme/ThemeContext";
import Header from "./components/Header";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import AddStudents from "./pages/AddStudents";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./students/pages/StudentDashboard.jsx"
import StudentSubjects from "./students/pages/StudentSubjects.jsx";
import StudentForecast from "./students/pages/StudentForecast.jsx";
import StudentProfile from "./students/pages/StudentProfile.jsx"

// Protected Route component
function ProtectedRoute({ children }) {
  const { isSignedIn, isLoaded } = useUser();
  
  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

function RedirectToHome() {
  const { user, isSignedIn, isLoaded } = useUser();
  
  if (!isLoaded) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isSignedIn) {
    return <Navigate to="/login" />;
  }

  // Get role from user's metadata
  // publicMetadata is accessible on the client and should be used for role
  // unsafeMetadata is checked as fallback for compatibility during migration
  const userRole = user?.publicMetadata?.role || user?.unsafeMetadata?.role;

  if (userRole === "teacher") {
    return <Navigate to="/dashboard" />;
  }
  
  if (userRole === "student") {
    return <Navigate to="/student-dashboard" />;
  }

  // Default redirect if no role is set
  return <Navigate to="/dashboard" />;
}

const studentRoutes = [
  "/student-dashboard",
  "/student-subjects",
  "/student-forecast",
  "/student-profile",
  "/login",
  "/register"
];

export default function App() {
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  const hideNavbar = studentRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen">
      {!hideNavbar && <Header theme={theme} setTheme={setTheme} />}

      <div className="p-6">
        <Routes>
          <Route path="/" element={<RedirectToHome/>} />
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          
          {/* Protected Teacher Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
          <Route path="/attendance" element={<ProtectedRoute><MarkAttendance/></ProtectedRoute>}/>
          <Route path="/students" element={<ProtectedRoute><StudentList/></ProtectedRoute>}/>
          <Route path="/analytics" element={<ProtectedRoute><Analytics/></ProtectedRoute>}/>
          <Route path="/reports" element={<ProtectedRoute><Reports/></ProtectedRoute>}/>
          <Route path="/settings" element={<ProtectedRoute><Settings/></ProtectedRoute>}/>
          <Route path="/add-students" element={<ProtectedRoute><AddStudents/></ProtectedRoute>}/>
          
          {/* Protected Student Routes */}
          <Route path="/student-dashboard" element={<ProtectedRoute><StudentDashboard/></ProtectedRoute>}/>
          <Route path="/student-subjects" element={<ProtectedRoute><StudentSubjects/></ProtectedRoute>}/>
          <Route path="/student-forecast" element={<ProtectedRoute><StudentForecast/></ProtectedRoute>}/>
          <Route path="/student-profile" element={<ProtectedRoute><StudentProfile/></ProtectedRoute>}/>

          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </div>
    </div>
  );
}

import Dashboard from "./pages/Dashboard";
import Login from "./components/Login";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import React from "react";
import Userboard from "./pages/Userboard";
import ScheduleTable from "./pages/ScheduleTable";
import CourseManage from "./pages/CourseManage";
import MajorManage from "./pages/MajorManage";
import InstructorManage from "./pages/InstructorManage";
import SemesterManage from "./pages/SemesterManage";
import CourseScheduleManage from "./pages/CourseScheduleManage";
import NotifyManage from "./pages/NotifyManage";
import Notify from "./pages/Notify";
import CourseRegistration from "./pages/CoureRegistration";
import Footer from "./components/Footer";
import { UserProvider } from "./context/userContext";
import UserManage from "./pages/UserManage";
import ChangedPassword from "./pages/ChangedPassword";

function App() {
  return (
    <UserProvider>
      <div style={{ minHeight: "100vh" }}>
        <Router>
          <Routes>
            <Route exact path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/userboard" element={<Userboard />} />
            <Route path="/schedule" element={<ScheduleTable />} />
            <Route path="/course-manage" element={<CourseManage />} />
            <Route path="/major-manage" element={<MajorManage />} />
            <Route path="/instructor-manage" element={<InstructorManage />} />
            <Route path="/semester-manage" element={<SemesterManage />} />
            <Route
              path="/course-schedule-manage"
              element={<CourseScheduleManage />}
            />
            <Route path="/notify-manage" element={<NotifyManage />} />
            <Route path="/notify/:id" element={<Notify />} />
            <Route
              path="/course-registration"
              element={<CourseRegistration />}
            />
            <Route path="/user-manage" element={<UserManage />} />
            <Route path="/change-password" element={<ChangedPassword />} />
          </Routes>
        </Router>
      </div>
      <Footer />
    </UserProvider>
  );
}

export default App;

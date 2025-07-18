import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import ResetPassword from "./pages/ResetPassword.tsx";
import CourseDetail from "./pages/CourseDetail.tsx";
import InstructorDashboard from "./pages/InstructorDashboard.tsx";
import CourseLearning from "./components/course/CourseLearning.tsx";
import Success from "./pages/Success.tsx";

// Material UI Components
import { SnackbarProvider } from "notistack"; // For global toast notifications
import { ThemeProvider, createTheme } from "@mui/material/styles"; // Optional: for theme customization
import AllCourses from "./components/course/AllCourses.tsx";
import AppLayout from "./components/AppLayout.tsx";

import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import Cancel from "./pages/Cancel.tsx";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2", // Your brand color
    },
  },
});

const App = () => (
  <ThemeProvider theme={theme}>
    <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
          
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/courses" element={<AllCourses />} />

            {/* <Route path="/courses" element={<CourseList />} /> */}
            <Route path="/course/:id/learn" element={<CourseLearning />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            
            <Route path="/admin/dashboard" element={<AdminDashboard />}/>
          </Route>
          <Route
              path="/instructor/dashboard"
              element={<InstructorDashboard />}
            />
            <Route path="/success" element={<Success />} />
            <Route path="/cancel" element={<Cancel />} />
        </Routes>
      </BrowserRouter>
    </SnackbarProvider>
  </ThemeProvider>
);

export default App;

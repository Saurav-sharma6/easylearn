import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import LinearProgress from "@mui/material/LinearProgress";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import axiosInstance from "../helpers/axiosInstance";

interface Course {
  _id: string;
  title: string;
  thumbnail: string;
}

interface Enrollment {
  courseId: string;
  status: "started" | "completed";
}

interface CourseProgress {
  courseId: string;
  percentageCompleted: number;
}

interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  token?: string;
}

const MyLearning = () => {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user");
  const user: User | null = useMemo(() => {
    console.log("Raw localStorage user:", storedUser);
    try {
      const parsedUser = storedUser ? JSON.parse(storedUser) : null;
      console.log("Parsed user:", parsedUser);
      return parsedUser;
    } catch (error) {
      console.error("Invalid user data in localStorage:", error);
      localStorage.removeItem("user");
      return null;
    }
  }, [storedUser]);
  const userId = user?.id || user?._id;
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!userId) {
        console.log("No userId, redirecting to login");
        setSnackbar({
          open: true,
          message: "Please log in to view your courses",
          severity: "error",
        });
        setLoading(false);
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching enrollments for user:", userId);
        const enrollmentsResponse = await axiosInstance.get(`/api/enrollments/user/${userId}`, {
          headers: { Authorization: `Bearer ${user?.token || ''}` },
        });
        console.log("Fetched enrollments:", enrollmentsResponse.data);
        const fetchedEnrollments: Enrollment[] = enrollmentsResponse.data;

        if (fetchedEnrollments.length === 0) {
          console.log("No enrollments found for user:", userId);
          setEnrollments([]);
          setCourses([]);
          setProgress([]);
          setLoading(false);
          return;
        }

        setEnrollments(fetchedEnrollments);

        // Fetch course details
        console.log("Fetching course details for enrollments:", fetchedEnrollments);
        const coursePromises = fetchedEnrollments.map(async (enrollment) => {
          try {
            const courseResponse = await axiosInstance.get(`/api/courses/${enrollment.courseId}`);
            console.log(`Fetched course ${enrollment.courseId}:`, courseResponse.data);
            return courseResponse.data.course;
          } catch (err: any) {
            console.error(`Failed to fetch course ${enrollment.courseId}:`, err.response?.data || err);
            return null;
          }
        });
        const fetchedCourses = (await Promise.all(coursePromises)).filter((course): course is Course => course !== null);
        setCourses(fetchedCourses);

        // Fetch progress for each course
        console.log("Fetching progress for enrolled courses");
        const progressPromises = fetchedEnrollments.map(async (enrollment) => {
          try {
            const progressResponse = await axiosInstance.get(`/api/courses/progress/${userId}/${enrollment.courseId}`);
            console.log(`Fetched progress for course ${enrollment.courseId}:`, progressResponse.data);
            return {
              courseId: enrollment.courseId,
              percentageCompleted: progressResponse.data.courseProgress?.percentageCompleted || 0,
            };
          } catch (err: any) {
            console.error(`Failed to fetch progress for course ${enrollment.courseId}:`, err.response?.data || err);
            return { courseId: enrollment.courseId, percentageCompleted: 0 };
          }
        });
        const fetchedProgress = await Promise.all(progressPromises);
        setProgress(fetchedProgress);
      } catch (err: any) {
        console.error("Failed to load enrolled courses:", err.response?.data || err);
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.log("Authentication failed, redirecting to login");
          localStorage.removeItem("user");
          setSnackbar({
            open: true,
            message: "Session expired. Please log in again.",
            severity: "error",
          });
          navigate("/login");
        } else {
          setSnackbar({
            open: true,
            message: err.response?.data?.error || "Failed to load your courses",
            severity: "error",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchEnrolledCourses();
  }, [userId, navigate]);

  const handleCourseClick = (courseId: string) => {
    console.log("Navigating to course:", courseId);
    navigate(`/course/${courseId}/learn`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Typography variant="h4" gutterBottom sx={{ color: "#1a202c" }}>
          My Learning
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <LinearProgress />
          </Box>
        ) : !userId ? (
          <Typography variant="body1" sx={{ color: "#c53030" }}>
            Please <a href="/login" className="text-blue-600 underline">log in</a> to view your courses.
          </Typography>
        ) : courses.length === 0 ? (
          <Typography variant="body1" sx={{ color: "#4a5568" }}>
            You are not enrolled in any courses. <a href="/courses" className="text-blue-600 underline">Browse courses</a>.
          </Typography>
        ) : (
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 4 }}>
            {courses.map((course) => {
              const courseProgress = progress.find((p) => p.courseId === course._id)?.percentageCompleted || 0;
              const isCompleted = courseProgress >= 90;
              return (
                <Card
                  key={course._id}
                  sx={{ cursor: "pointer", "&:hover": { boxShadow: 6 } }}
                  onClick={() => handleCourseClick(course._id)}
                >

                  <div className="relative h-48 w-full">
                          <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                          <div className="absolute top-2 right-2 flex items-center gap-1">


                          </div>
                        </div>
                  <CardContent>
                    <Typography variant="h6" sx={{ color: "#1a202c", mb: 1 }}>
                      {course.title}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={courseProgress}
                      sx={{
                        height: 8,
                        borderRadius: 5,
                        backgroundColor: "#e0e0e0",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 5,
                          backgroundColor: "#14b8a6",
                        },
                      }}
                    />
                    <Typography variant="body2" sx={{ color: "#4a5568", mt: 1 }}>
                      {courseProgress.toFixed(1)}% Completed
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{
                        mt: 2,
                        bgcolor: isCompleted ? "#4caf50" : "#3b82f6",
                        "&:hover": { bgcolor: isCompleted ? "#388e3c" : "#2563eb" },
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCourseClick(course._id);
                      }}
                    >
                      {isCompleted ? "Download Certificate" : "Continue Learning"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default MyLearning;
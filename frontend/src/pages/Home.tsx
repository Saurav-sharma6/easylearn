import { useState, useEffect,useMemo } from "react";
import Header from "../components/layout/Header";
import { useNavigate } from "react-router-dom";
import Contact from "../components/contact";

// MUI Components
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
// Icons
import BookOpenIcon from "@mui/icons-material/MenuBook";
import UsersIcon from "@mui/icons-material/Group";
import AwardIcon from "@mui/icons-material/EmojiEvents";
import PlayIcon from "@mui/icons-material/PlayCircleFilled";

// Course Card Component
import CourseCard from "../components/course/CourseCard";

// Axios for API calls
import axiosInstance from "../helpers/axiosInstance";

// Types
interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  price: number;
  originalPrice?: number | null;
  rating: number;
  students: number;
  duration: string;
  image: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  isEnrolled?: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  percentageCompleted?: number;
}
interface Enrollment {
  courseId: string;
  status: "active" | "completed";
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

const Home = () => {
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
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState<"title" | "description" | "instructor">("title");
  const [searchResults, setSearchResults] = useState<Course[]>([]);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  useEffect(() => {
    const fetchCoursesAndEnrollments = async () => {
      try {
        setLoading(true);

        // Fetch all courses
        console.log("Fetching all courses");
        const response = await axiosInstance.get("/api/courses");
        setCourses(response.data.courses || []);
        console.log("Fetched courses:", response.data.courses);

        // Fetch enrolled courses if user is logged in
        if (userId) {
          console.log("Fetching enrollments for user:", userId);
          const enrollmentsResponse = await axiosInstance.get(`/api/enrollments/user/${userId}`, {
            headers: { Authorization: `Bearer ${user?.token || ''}` },
          });
          console.log("Fetched enrollments:", enrollmentsResponse.data);
          const fetchedEnrollments: Enrollment[] = enrollmentsResponse.data;

          // Filter for active enrollments
          // const activeEnrollments = fetchedEnrollments.filter(enrollment => enrollment.status === "active");
          // console.log("Active enrollments:", activeEnrollments);

          if (fetchedEnrollments.length === 0) {
            console.log("No active enrollments found for user:", userId);
            setEnrollments([]);
            setEnrolledCourses([]);
            setProgress([]);
          } else {
            // Fetch progress for active enrollments
            console.log("Fetching progress for active enrollments:", fetchedEnrollments);
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
            console.log("Fetched progress:", fetchedProgress);

            // Filter for courses with progress > 0
            const activeProgress = fetchedProgress.filter(progress => progress.percentageCompleted > 0 && progress.percentageCompleted < 90);
            console.log("Active progress (percentageCompleted > 0):", activeProgress);

            if (activeProgress.length === 0) {
              console.log("No active courses with progress found for user:", userId);
              setEnrollments([]);
              setEnrolledCourses([]);
              setProgress([]);
            } else {
              setProgress(activeProgress);
              setEnrollments(fetchedEnrollments.filter(enrollment => 
                activeProgress.some(progress => progress.courseId === enrollment.courseId)
              ));

              // Fetch course details for active enrollments with progress
              console.log("Fetching course details for active enrollments with progress:", activeProgress);
              const coursePromises = activeProgress.map(async (progress) => {
                try {
                  const courseResponse = await axiosInstance.get(`/api/courses/${progress.courseId}`);
                  console.log(`Fetched course ${progress.courseId}:`, courseResponse.data);
                  return { ...courseResponse.data.course, isEnrolled: true, percentageCompleted: progress.percentageCompleted };
                } catch (err: any) {
                  console.error(`Failed to fetch course ${progress.courseId}:`, err.response?.data || err);
                  return null;
                }
              });
              const fetchedCourses = (await Promise.all(coursePromises)).filter((course): course is Course => course !== null);
              console.log("Fetched courses with progress:", fetchedCourses);
              setEnrolledCourses(fetchedCourses);
            }
          }
        }
      } catch (err: any) {
        console.error("Failed to load data:", err.response?.data || err);
        setError("Failed to load courses or enrollments: " + (err.response?.data?.error || err.message));
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.log("Authentication failed, redirecting to login");
          localStorage.removeItem("user");
          setSnackbar({
            open: true,
            message: "Session expired. Please log in again.",
            severity: "error",
          });
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesAndEnrollments();
  }, [userId, navigate]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const filtered = courses.filter(course =>
      course[searchField].toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filtered);
  }, [searchQuery, searchField, courses]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Typography variant="h6">Loading courses...</Typography>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-red-500">
        <Typography color="error">{error}</Typography>
      </div>
    );
  }

  const featuredCourses = courses.filter((course) => course.isFeatured);
  const popularCourses = courses.filter((course) => course.isPopular);
  const coursesToShow = searchQuery ? searchResults : featuredCourses;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <Container maxWidth="lg">
          <div className="text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Learn Without Limits
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Start, switch, or advance your career with thousands of courses
              from world-class instructors
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-2xl mx-auto">
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                sx={{
                  input: { color: "#111827", backgroundColor: "#fff" },
                  backgroundColor: "#fff",
                  borderRadius: 1,
                }}
              />
              <FormControl variant="outlined" size="small" sx={{ minWidth: 150, backgroundColor: "#fff", borderRadius: 1 }}>
                <InputLabel sx={{ backgroundColor: "#fff", paddingX: 1 }}>Search By</InputLabel>
                <Select
                  value={searchField}
                  onChange={(e) => setSearchField(e.target.value)}
                  label="Search By"
                >
                  <MenuItem value="title">Title</MenuItem>
                  <MenuItem value="description">Description</MenuItem>
                  <MenuItem value="instructor">Instructor</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>
        </Container>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <Container maxWidth="lg">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="p-4 rounded-lg hover:bg-blue-50 transition-colors">
              <BookOpenIcon fontSize="large" className="text-blue-600 mb-4 mx-auto" />
              <Typography variant="h4" fontWeight="bold" color="textPrimary">57,000+</Typography>
              <Typography color="textSecondary">Online Courses</Typography>
            </div>
            <div className="p-4 rounded-lg hover:bg-blue-50 transition-colors">
              <UsersIcon fontSize="large" className="text-blue-600 mb-4 mx-auto" />
              <Typography variant="h4" fontWeight="bold" color="textPrimary">1M+</Typography>
              <Typography color="textSecondary">Students</Typography>
            </div>
            <div className="p-4 rounded-lg hover:bg-blue-50 transition-colors">
              <AwardIcon fontSize="large" className="text-blue-600 mb-4 mx-auto" />
              <Typography variant="h4" fontWeight="bold" color="textPrimary">15,000+</Typography>
              <Typography color="textSecondary">Expert Instructors</Typography>
            </div>
            <div className="p-4 rounded-lg hover:bg-blue-50 transition-colors">
              <PlayIcon fontSize="large" className="text-blue-600 mb-4 mx-auto" />
              <Typography variant="h4" fontWeight="bold" color="textPrimary">400+</Typography>
              <Typography color="textSecondary">Hours of Content</Typography>
            </div>
          </div>
        </Container>
      </section>

{userId && (
        <section className="py-16 bg-gray-50">
          <Container maxWidth="lg">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={8}>
              <Typography variant="h4" fontWeight="bold" color="textPrimary">
                Let's Start Learning
              </Typography>
              <Button variant="outlined" href="/my-learning" sx={{ textTransform: "none" }}>
                View All My Courses
              </Button>
            </Box>
            {enrolledCourses.length === 0 ? (
              <Typography variant="body1" color="textSecondary" textAlign="center">
                You have no courses in progress. <a href="/my-learning" className="text-blue-600 underline">View all enrolled courses</a> or <a href="/courses" className="text-blue-600 underline">browse new courses</a>.
              </Typography>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
                {enrolledCourses.map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            )}
          </Container>
        </section>
      )}
      {/* Featured Courses */}
      <section className="py-16">
        <Container maxWidth="lg">
          <Box textAlign="center" mb={12}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={8}>
              <Typography variant="h4" fontWeight="bold" color="textPrimary">
                {searchQuery ? "Search Results" : "Featured Courses"}
              </Typography>
              <Button variant="outlined" href="/courses" sx={{ textTransform: "none" }}>
                View All Courses
              </Button>
            </Box>
            <Typography variant="body1" color="textSecondary" component="p" maxWidth="xl" mx="auto">
              {searchQuery
                ? `Showing results for "${searchQuery}" in ${searchField}`
                : "Discover our most popular courses, carefully selected by our expert instructors"}
            </Typography>
          </Box>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
            {coursesToShow.length > 0 ? (
              coursesToShow.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-6">
                No courses found.
              </div>
            )}
          </div>
        </Container>
      </section>

      {/* Popular Courses */}
      <section className="py-16 bg-white">
        <Container maxWidth="lg">
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={8}>
            <Typography variant="h4" fontWeight="bold" color="textPrimary">
              Popular Courses
            </Typography>
            <Button variant="outlined" href="/courses" sx={{ textTransform: "none" }}>
              View All Courses
            </Button>
          </Box>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
            {popularCourses.length > 0 ? (
              popularCourses.map((course) => (
                <CourseCard key={course._id} course={course} />
              ))
            ) : (
              <div className="col-span-full text-center text-gray-500 py-6">
                No popular courses available
              </div>
            )}
          </div>
        </Container>
      </section>
      <br/>
      <Contact/>
      <br/>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <Container maxWidth="lg">
          <Box textAlign="center">
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Ready to Start Learning?
            </Typography>
            <Typography variant="body1" color="textSecondary" gutterBottom maxWidth="md" mx="auto" mb={4}>
              Join millions of students and start your learning journey today. Choose from thousands of courses.
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: "#2563eb",
                "&:hover": { bgcolor: "#1d4ed8" },
                textTransform: "none",
                paddingX: 4,
                fontWeight: 600,
              }}
              onClick={() => navigate("/courses")}
            >
              Get Started Now
            </Button>
          </Box>
        </Container>
      </section>
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
  );
};

export default Home;

import { useState, useEffect } from "react";
import Header from "../components/layout/Header";
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
}

const Home = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState<"title" | "description" | "instructor">("title");
  const [searchResults, setSearchResults] = useState<Course[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosInstance.get("/api/courses");
        setCourses(response.data.courses || []);
      } catch (err) {
        setError("Failed to load courses"+err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

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
      <Header />

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
      <Contact></Contact>
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
            >
              Get Started Now
            </Button>
          </Box>
        </Container>
      </section>
    </div>
  );
};

export default Home;

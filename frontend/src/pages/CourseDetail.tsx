import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/layout/Header";

// MUI Components
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";

// Icons
import StarIcon from "@mui/icons-material/Star";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GroupIcon from "@mui/icons-material/Group";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// Axios instance
import axiosInstance from "../helpers/axiosInstance";

// Types
interface Lecture {
  _id: string;
  lectureTitle: string;
  lectureDuration: string;
  lectureUrl: string;
  isPreviewFree: boolean;
  __v: number;
}

interface Chapter {
  _id: string;
  chapterTitle: string;
  chapterContent: Lecture[];
  __v: number;
}

interface Instructor {
  _id: string;
  name: string;
  email: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  instructorId: Instructor;
  price: number;
  originalPrice?: number | null;
  rating: number;
  students: number;
  duration: string;
  image: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  whatWillLearn?: (string | null)[];
  curriculum?: Chapter[];
  isFeatured: boolean;
  isPopular: boolean;
  __v: number;
}

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch course from backend
  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) {
        setError("Course ID not found");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching course with ID:", id); // 🔍 Log 1: ID being used
        const response = await axiosInstance.get(`/api/courses/${id}`);
        
        console.log("API Response:", response.data); // 🔍 Log 2: Full API response
        
        const courseData = response.data.course;

        if (!courseData) {
          throw new Error("No course data in response");
        }

        console.log("Setting course state:", courseData); // 🔍 Log 3: course data
        setCourse(courseData);
      } catch (err: any) {
        console.error("Error fetching course:", err.message);
        setError("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

const handleEnroll = async () => {
  if (!course) return;

  const userData = localStorage.getItem("user");
  const userId = userData ? JSON.parse(userData).id : null;

  if (!userId) {
    alert("User not logged in");
    return;
  }

  if (course.price === 0) {
    alert("You have successfully enrolled in this free course!");
    return;
  }

  try {
    const response = await axiosInstance.post("/api/payment/create-checkout-session", {
      courseId: course._id,
      courseName: course.title,
      price: course.price,
      userId: userId,
    });

    const { url } = response.data;
    if (url) {
      window.location.href = url;
    } else {
      alert("Failed to create checkout session.");
    }
  } catch (error) {
    console.error("Checkout error:", error);
    alert("An error occurred during checkout.");
  }
};




  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Typography>Loading course details...</Typography>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Typography color="error">{error || "Course not found"}</Typography>
        </div>
      </div>
    );
  }

  // 🔍 Log 4: Rendered course object
  console.log("Rendering course:", course);

  // 🔍 Log 5: Curriculum before rendering
  console.log("Curriculum being rendered:", course.curriculum);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gray-700 text-white py-12">
        <Container maxWidth="lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="text-sm text-gray-300 mb-4">
              <Link to="/" className="hover:text-white">
                Home
              </Link>
              <span className="mx-2">/</span>
              <span>{course.category}</span>
            </nav>
            <div className="flex flex-col md:flex-row gap-8">
              {/* Course Info */}
              <div className="md:w-2/3">
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {course.title}
                </Typography>
                <Typography variant="h6">{course.description}</Typography>
                <div className="flex flex-wrap gap-6 text-sm mb-6">
                  <div className="flex items-center">
                    <StarIcon fontSize="small" sx={{ color: "#fbbf24", mr: 0.5 }} />
                    <Typography variant="body2" fontWeight="bold" sx={{ mr: 1 }}>
                      {course.rating.toFixed(1)}
                    </Typography>
                    <Typography variant="body2">
                      ({course.students} students)
                    </Typography>
                  </div>
                  <div className="flex items-center">
                    <AccessTimeIcon sx={{ mr: 0.5 }} />
                    <Typography variant="body2">{course.duration}</Typography>
                  </div>
                  <div className="flex items-center">
                    <GroupIcon sx={{ mr: 0.5 }} />
                    <Typography variant="body2">
                      Instructor: {course.instructor}
                    </Typography>
                  </div>
                </div>
              </div>

              {/* Enroll Card */}
              <div className="md:w-1/3">
                <Card className="sticky top-4 shadow-md rounded-lg overflow-hidden">
                  <div className="relative h-48 w-full">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        color="textPrimary"
                      >
                        {course.price === 0 ? "Free" : `$${course.price}`}
                      </Typography>
                      {course.originalPrice && course.price > 0 && (
                        <Typography
                          color="textSecondary"
                          sx={{ textDecoration: "line-through" }}
                        >
                          ${course.originalPrice}
                        </Typography>
                      )}
                    </div>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleEnroll}
                      sx={{
                        mb: 2,
                        bgcolor:
                          course.price === 0 ? "#2563eb" : "#10B981",
                        "&:hover": {
                          bgcolor:
                            course.price === 0 ? "#1d4ed8" : "#059669",
                        },
                        textTransform: "none",
                      }}
                    >
                      {course.price === 0 ? "Enroll for Free" : "Buy Now"}
                    </Button>
                    <Typography
                      variant="caption"
                      align="center"
                      color="textSecondary"
                    >
                      Once in a Lifetime Opportunity
                    </Typography>
                    <Box mt={3} className="space-y-3 text-sm">
                      <div className="flex items-center">
                        <MenuBookIcon
                          fontSize="small"
                          color="action"
                          sx={{ mr: 1 }}
                        />
                        <span>Lifetime access</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircleOutlineIcon
                          fontSize="small"
                          color="success"
                          sx={{ mr: 1 }}
                        />
                        <span>Certificate of completion</span>
                      </div>
                      <div className="flex items-center">
                        <GroupIcon
                          fontSize="small"
                          color="action"
                          sx={{ mr: 1 }}
                        />
                        <span>Mobile & desktop access</span>
                      </div>
                    </Box>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <Container maxWidth="lg">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:col-span-2">
              {/* What You'll Learn */}
              <Card className="bg-white p-6 mb-8 rounded-lg">
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  What you'll learn
                </Typography>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {(course.whatWillLearn?.filter(Boolean) || []).length > 0 ? (
                    course.whatWillLearn
                      ?.filter(Boolean)
                      .map((item, index) => (
                        <div key={index} className="flex items-start">
                          <CheckCircleOutlineIcon
                            fontSize="small"
                            color="success"
                            sx={{ mr: 1, mt: 0.5 }}
                          />
                          <Typography variant="body2">{item}</Typography>
                        </div>
                      ))
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No learning points available.
                    </Typography>
                  )}
                </div>
              </Card>

              {/* Curriculum Preview */}
              <Card className="bg-white p-6 rounded-lg">
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Course Content
                </Typography>
                <div className="space-y-4">
                  {course.curriculum && course.curriculum.length > 0 ? (
                    course.curriculum.map((section, index) => (
                      <Accordion key={section._id} defaultExpanded={index === 0}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography fontWeight="medium">
                            {section.chapterTitle}
                          </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <div className="space-y-2">
                            {(section.chapterContent ?? []).map((lesson) => (
                              <div key={lesson._id} className="flex items-center">
                                {lesson.isPreviewFree && (
                                  <PlayCircleFilledIcon
                                    fontSize="small"
                                    color="primary"
                                    sx={{ mr: 1 }}
                                  />
                                )}
                                <Typography variant="body2">
                                  {lesson.lectureTitle}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="textSecondary"
                                  sx={{ ml: "auto" }}
                                >
                                  {lesson.lectureDuration} min
                                </Typography>
                              </div>
                            ))}
                          </div>
                        </AccordionDetails>
                      </Accordion>
                    ))
                  ) : (
                    <Typography variant="body2" color="textSecondary">
                      No content available yet.
                    </Typography>
                  )}
                </div>
              </Card>
            </div>

            {/* Instructor Info */}
            <div className="lg:col-span-1">
              <Card className="bg-white p-6 rounded-lg">
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  About the Instructor
                </Typography>
                <Box display="flex" alignItems="center" mb={2}>
                  <div className="w-16 h-16 bg-gray-300 rounded-full mr-4"></div>
                  <div>
                    <Typography fontWeight="bold">
                      {course.instructor}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Senior Developer
                    </Typography>
                  </div>
                </Box>
                <Typography variant="body2" color="textSecondary" paragraph>
                  {course.instructor} is a senior full-stack developer with over 8
                  years of experience. He has taught over 100,000 students worldwide.
                </Typography>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Students:</span>
                    <span>50,000+</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Courses:</span>
                    <span>12</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rating:</span>
                    <span>{course.rating}/5</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default CourseDetail;
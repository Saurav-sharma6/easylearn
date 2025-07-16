import { useState, useEffect } from "react";
import { useParams, Link, useLocation, useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import StarIcon from "@mui/icons-material/Star";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GroupIcon from "@mui/icons-material/Group";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PlayCircleFilledIcon from "@mui/icons-material/PlayCircleFilled";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import axiosInstance from "../helpers/axiosInstance";

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
  instructorId?: Instructor | string | null;
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

interface Enrollment {
  _id: string;
  userId: string;
  courseId: string;
  paymentId?: string;
  enrolledAt: string;
  status: "active" | "completed" | "dropped";
  __v: number;
}

const CourseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollError, setEnrollError] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserId = () => {
      const userData = localStorage.getItem("user");
      const parsedUserId = userData ? JSON.parse(userData).id : null;
      setUserId(parsedUserId);
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) {
        setError("Course ID not found");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching course with ID:", id);
        const response = await axiosInstance.get(`/api/courses/${id}`);
        console.log("Course API Response:", response.data);
        const courseData = response.data.course;

        if (!courseData) {
          throw new Error("No course data in response");
        }

        console.log("Setting course state:", courseData);
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

  useEffect(() => {
    const checkEnrollment = async () => {
      if (!userId || !id) {
        console.log("Skipping enrollment check: userId or courseId missing", { userId, id });
        return;
      }

      try {
        const response = await axiosInstance.get(`/api/enrollments/user/${userId}`);
        console.log("Enrollment response:", response.data);
        const isEnrolled = response.data.some((enrollment: Enrollment) => {
          const courseId = enrollment.courseId;
          console.log("Comparing courseId:", courseId, "with id:", id);
          return courseId === id;
        });
        console.log("isEnrolled from API:", isEnrolled);
        setIsEnrolled(isEnrolled);
      } catch (err: any) {
        console.error("Enrollment check error:", err.message);
        setEnrollError("Failed to check enrollment status");
      }
    };

    if (userId && id) {
      checkEnrollment();
    }

    // Handle cancel redirect
    if (location.search.includes("session_id") && location.pathname.includes("/cancel")) {
      setEnrollError("Payment was cancelled or declined. Please try again.");
    }
  }, [userId, id, location]);

  const handleEnroll = async () => {
    if (!course || !userId) {
      setEnrollError("Please log in to enroll.");
      return;
    }

    if (isEnrolled) {
      navigate(`/course/${course._id}/learn`);
      return;
    }

    if (course.price === 0) {
      try {
        const response = await axiosInstance.post("/api/enrollments", {
          userId,
          courseId: course._id,
        });
        console.log("Free enrollment response:", response.data);
        setIsEnrolled(true);
        alert("You have successfully enrolled in this free course!");
        navigate(`/courses/${course._id}/learn`);
      } catch (err: any) {
        console.error("Free enrollment error:", err.response?.data || err);
        setEnrollError(err.response?.data?.error || "Failed to enroll in the course.");
      }
      return;
    }

    try {
      const response = await axiosInstance.post("/api/payment/create-checkout-session", {
        courseId: course._id,
        courseName: course.title,
        price: course.price,
        userId,
      });

      const { url } = response.data;
      if (url) {
        window.location.href = url;
      } else {
        setEnrollError("Failed to initiate checkout. Please try again.");
      }
    } catch (error: any) {
      console.error("Checkout error:", error.response?.data || error);
      setEnrollError(error.response?.data?.error || "An error occurred during checkout. Please try again.");
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

  console.log("Rendering course:", course);
  console.log("Curriculum being rendered:", course.curriculum);
  console.log("Frontend isEnrolled:", isEnrolled);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
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
                    {enrollError && (
                      <Typography color="error" sx={{ mb: 2 }}>
                        {enrollError}
                      </Typography>
                    )}
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleEnroll}
                      disabled={false}
                      sx={{
                        mb: 2,
                        bgcolor: isEnrolled ? "#0288d1" : course.price === 0 ? "#2563eb" : "#10B981",
                        "&:hover": {
                          bgcolor: isEnrolled ? "#0277bd" : course.price === 0 ? "#1d4ed8" : "#059669",
                        },
                        textTransform: "none",
                      }}
                    >
                      {isEnrolled
                        ? "Go to Course"
                        : course.price === 0
                        ? "Enroll for Free"
                        : "Buy Now"}
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
      <section className="py-12">
        <Container maxWidth="lg">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:col-span-2">
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
                                {lesson.isPreviewFree || isEnrolled ? (
                                  <PlayCircleFilledIcon
                                    fontSize="small"
                                    color="primary"
                                    sx={{ mr: 1 }}
                                  />
                                ) : (
                                  <Typography variant="body2" color="textSecondary" sx={{ mr: 1 }}>
                                    🔒
                                  </Typography>
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
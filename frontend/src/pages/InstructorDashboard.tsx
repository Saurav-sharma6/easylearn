import React, { useState, useEffect } from "react";
import axiosInstance from "../helpers/axiosInstance";
import { AppBar, Toolbar, Typography, Button, Card, CardContent, Snackbar, Alert } from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import CourseForm from "../components/course/CourseForm";

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [instructorId, setInstructorId] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setInstructorId(user._id || user.id || "");
    }
  }, []);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosInstance.get(`/api/courses/instructor/${instructorId}`);
        setCourses(response.data.courses || []);
      } catch (error: any) {
        console.error("Error fetching courses:", error.message);
        setSnackbar({
          open: true,
          message: "Failed to fetch courses",
          severity: "error",
        });
      }
    };
    if (instructorId) fetchCourses();
  }, [instructorId]);

  const handleSubmit = async (formData, chapters) => {
    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;
    const instructorName = user?.name || "Jane Doe";

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("instructorId", instructorId);
    formDataToSend.append("instructor", instructorName);
    formDataToSend.append("price", formData.price?.toString() || "0");
    if (formData.originalPrice)
      formDataToSend.append("originalPrice", formData.originalPrice.toString());
    formDataToSend.append("duration", formData.duration);
    formDataToSend.append("image", formData.image);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("level", formData.level);
    formDataToSend.append("whatWillLearn", JSON.stringify(formData.whatWillLearn.filter((item) => item)));
    formDataToSend.append("isFeatured", formData.isFeatured.toString());
    formDataToSend.append("isPopular", formData.isPopular.toString());
    formDataToSend.append(
      "curriculum",
      JSON.stringify(
        chapters.map((chapter) => ({
          _id: chapter._id || undefined,
          chapterTitle: chapter.chapterTitle,
          chapterContent: chapter.chapterContent.map((lecture) => ({
            _id: lecture._id || undefined,
            lectureTitle: lecture.lectureTitle,
            lectureDuration: lecture.lectureDuration,
            lectureUrl: lecture.lectureUrl,
            isPreviewFree: lecture.isPreviewFree,
            videoFile: lecture.videoFile instanceof File ? true : undefined,
          })),
        }))
      )
    );

    const videoFiles = [];
    chapters.forEach((chapter) => {
      chapter.chapterContent.forEach((lecture) => {
        if (lecture.videoFile instanceof File) {
          videoFiles.push(lecture.videoFile);
        }
      });
    });
    videoFiles.forEach((file, index) => {
      formDataToSend.append("lectureVideos", file);
      console.log(`Appending video ${index + 1}: ${file.name}`);
    });

    const url = editingCourse ? `/api/courses/${editingCourse._id}` : "/api/courses";
    const method = editingCourse ? "PUT" : "POST";

    try {
      const response = await axiosInstance({
        method,
        url,
        data: formDataToSend,
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedCourse = response.data.course;
      if (editingCourse) {
        setCourses(courses.map((c) => (c._id === editingCourse._id ? updatedCourse : c)));
      } else {
        setCourses([...courses, updatedCourse]);
      }
      setShowCreateForm(false);
      setEditingCourse(null);
      setSnackbar({
        open: true,
        message: editingCourse ? "Course updated successfully!" : "Course created successfully!",
        severity: "success",
      });
    } catch (err: any) {
      throw err;
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    setLoading(true);
    setSnackbar({ open: false, message: "", severity: "success" });
    try {
      await axiosInstance.delete(`/api/courses/${courseId}`);
      setCourses(courses.filter((c) => c._id !== courseId));
      setSnackbar({
        open: true,
        message: "Course deleted successfully!",
        severity: "success",
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: "Failed to delete course",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: "linear-gradient(to right, #9333ea, #4338ca)",
        }}
      >
        <Toolbar className="flex justify-between">
          <Typography variant="h6" fontWeight="bold" color="inherit">
            Instructor Dashboard
          </Typography>
          <div className="flex items-center gap-2">
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => {
                setShowCreateForm(true);
                setEditingCourse(null);
              }}
              sx={{
                borderRadius: "8px",
                fontWeight: 600,
                borderColor: "rgba(255,255,255,0.7)",
                color: "white",
                textTransform: "none",
                "&:hover": {
                  borderColor: "white",
                  bgcolor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Create New Course
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleLogout}
              sx={{
                borderRadius: "8px",
                fontWeight: 600,
                borderColor: "rgba(255,255,255,0.7)",
                color: "white",
                textTransform: "none",
                "&:hover": {
                  borderColor: "white",
                  bgcolor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Sign Out
            </Button>
          </div>
        </Toolbar>
      </AppBar>
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <Typography color="textSecondary">Total Earnings</Typography>
            <Typography variant="h5" fontWeight="bold" color="success.main">
              $0.00
            </Typography>
          </Card>
          <Card className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <Typography color="textSecondary">Total Students</Typography>
            <Typography variant="h5" fontWeight="bold" color="info.main">
              0
            </Typography>
          </Card>
          <Card className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <Typography color="textSecondary">Total Courses</Typography>
            <Typography variant="h5" fontWeight="bold" color="secondary.main">
              {courses.length}
            </Typography>
          </Card>
        </div>
        {showCreateForm ? (
          <CourseForm
            initialData={editingCourse}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowCreateForm(false);
              setEditingCourse(null);
            }}
            isEditing={!!editingCourse}
            loading={loading}
            setLoading={setLoading}
            setSnackbar={setSnackbar}
          />
        ) : (
          <div>
            <Typography
              variant="h5"
              fontWeight="bold"
              gutterBottom
              sx={{ color: "black" }}
            >
              My Courses
            </Typography>
            <div className="space-y-6">
              {courses.length > 0 ? (
                courses.map((course) => (
                  <Card
                    key={course._id}
                    className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <CardContent>
                      <div className="flex flex-col md:flex-row md:justify-between">
                        <div className="md:w-4/5">
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            gutterBottom
                          >
                            {course.title}
                          </Typography>
                          <Typography color="textSecondary" paragraph>
                            {course.description}
                          </Typography>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            <span>${course.price}</span>
                            <span>{course.category}</span>
                            <span>{course.duration}</span>
                            {course.isFeatured && <span>Featured</span>}
                            {course.isPopular && <span>Popular</span>}
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4 md:mt-0">
                          <Button
                            size="small"
                            onClick={() => {
                              setEditingCourse(course);
                              setShowCreateForm(true);
                            }}
                            startIcon={<EditIcon />}
                            sx={{
                              borderRadius: "6px",
                              textTransform: "none",
                              bgcolor: "#bfdbfe",
                              color: "#1e40af",
                              "&:hover": { bgcolor: "#93c5fd" },
                            }}
                            disabled={loading}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleDelete(course._id)}
                            startIcon={<DeleteIcon />}
                            sx={{
                              borderRadius: "6px",
                              textTransform: "none",
                              bgcolor: "#fee2e2",
                              color: "#be123c",
                              "&:hover": { bgcolor: "#fecaca" },
                            }}
                            disabled={loading}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Typography
                  color="textSecondary"
                  className="text-center py-6 bg-white rounded-xl shadow-sm"
                >
                  No courses found. Start by creating one.
                </Typography>
              )}
            </div>
          </div>
        )}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
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

export default InstructorDashboard;
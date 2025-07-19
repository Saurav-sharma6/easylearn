import React, { useState, useEffect } from "react";
import axiosInstance from "../helpers/axiosInstance";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

// Course interface
interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  instructorId: string | { _id: string; name: string; email: string };
  price: number | null;
  originalPrice?: number | null;
  duration: string;
  image: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  whatWillLearn: string[];
  isFeatured: boolean;
  isPopular: boolean;
  curriculum: Chapter[];
}

interface Chapter {
  _id?: string;
  chapterTitle: string;
  chapterContent: Lecture[];
  collapsed?: boolean;
}

interface Lecture {
  _id?: string;
  lectureTitle: string;
  lectureDuration: string;
  lectureUrl: string;
  isPreviewFree: boolean;
  videoFile?: File | null;
}

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false); // Loading state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Form data state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: null as number | null,
    originalPrice: null as number | null,
    category: "",
    level: "Beginner" as "Beginner" | "Intermediate" | "Advanced",
    image: "/placeholder.svg",
    duration: "0 hours",
    whatWillLearn: [] as string[],
    isFeatured: false,
    isPopular: false,
    instructorId: "",
  });

  // Curriculum state
  const [chapters, setChapters] = useState<
    {
      _id?: string;
      chapterTitle: string;
      chapterContent: {
        _id?: string;
        lectureTitle: string;
        lectureDuration: string;
        lectureUrl: string;
        isPreviewFree: boolean;
        videoFile?: File | null;
      }[];
      collapsed?: boolean;
    }[]
  >([]);

  const [showPopup, setShowPopup] = useState<"add" | "edit" | false>(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number | null>(null);
  const [currentLectureIndex, setCurrentLectureIndex] = useState<number | null>(null);
  const [lectureDetails, setLectureDetails] = useState({
    _id: "",
    lectureTitle: "",
    lectureDuration: "",
    lectureUrl: "",
    isPreviewFree: false,
    videoFile: null as File | null,
  });

  // Predefined categories
  const categories = [
    "Web Development",
    "Programming",
    "Design",
    "Backend Development",
    "Data Science",
    "Mobile Development",
  ];

  // Load user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setFormData((prev) => ({
        ...prev,
        instructorId: user._id || user.id || "",
      }));
    }
  }, []);

  // Load courses for current instructor
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const userData = localStorage.getItem("user");
        if (!userData) return;

        const user = JSON.parse(userData);
        const instructorId = user._id || user.id;

        const response = await axiosInstance.get(
          `/api/courses/instructor/${instructorId}`
        );
        console.log("Fetched courses:", response.data.courses);
        setCourses(response.data.courses || []);
      } catch (error: any) {
        console.error("Error fetching courses:", error.message);
      }
    };

    fetchCourses();
  }, []);

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return; // Prevent multiple submissions

    setLoading(true); // Start loading
    setSnackbar({ open: false, message: '', severity: 'success' }); // Reset snackbar

    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;
    const instructorName = user?.name || "Jane Doe";
    const instructorId = formData.instructorId || user?._id || user?.id;

    if (!instructorId) {
      setLoading(false);
      setSnackbar({
        open: true,
        message: "Instructor ID is required.",
        severity: 'error',
      });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("instructorId", instructorId);
    formDataToSend.append("instructor", instructorName);
    formDataToSend.append("price", formData.price?.toString() || "0");
    if (formData.originalPrice) formDataToSend.append("originalPrice", formData.originalPrice.toString());
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

    const videoFiles: File[] = [];
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
    console.log("FormData entries:", [...formDataToSend.entries()]);

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
        setChapters(updatedCourse.curriculum.map((chapter: Chapter) => ({
          _id: chapter._id,
          chapterTitle: chapter.chapterTitle,
          chapterContent: Array.isArray(chapter.chapterContent)
            ? chapter.chapterContent.map((lecture: Lecture) => ({
                _id: lecture._id,
                lectureTitle: lecture.lectureTitle,
                lectureDuration: lecture.lectureDuration,
                lectureUrl: lecture.lectureUrl || "",
                isPreviewFree: lecture.isPreviewFree,
                videoFile: null,
              }))
            : [],
          collapsed: chapter.collapsed || false,
        })));
      } else {
        setCourses([...courses, updatedCourse]);
        setChapters([]);
      }

      setFormData({
        title: "",
        description: "",
        price: null,
        originalPrice: null,
        category: "",
        level: "Beginner",
        image: "/placeholder.svg",
        duration: "0 hours",
        whatWillLearn: [],
        isFeatured: false,
        isPopular: false,
        instructorId,
      });
      setShowCreateForm(false);
      setEditingCourse(null);
      setSnackbar({
        open: true,
        message: editingCourse ? "Course updated successfully!" : "Course created successfully!",
        severity: 'success',
      });
    } catch (err: any) {
      console.error("Error submitting form:", err.response?.data || err);
      setSnackbar({
        open: true,
        message: err.response?.data?.error || "Failed to update course",
        severity: 'error',
      });
    } finally {
      setLoading(false); // Stop loading
    }
  };

  // Update lecture video
  const handleUpdateLectureVideo = async () => {
    if (!lectureDetails._id || !lectureDetails.videoFile) {
      setSnackbar({
        open: true,
        message: "Please select a lecture and upload a video file",
        severity: 'error',
      });
      return;
    }

    setLoading(true); // Start loading
    setSnackbar({ open: false, message: '', severity: 'success' });

    const formData = new FormData();
    formData.append("file", lectureDetails.videoFile);
    console.log("PATCH FormData entries:", [...formData.entries()]);

    try {
      const response = await axiosInstance.patch(
        `/api/courses/lectures/${lectureDetails._id}/video`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const updatedLecture = response.data.lecture;
      const updatedChapters = [...chapters];
      if (currentChapterIndex !== null && currentLectureIndex !== null) {
        updatedChapters[currentChapterIndex].chapterContent[currentLectureIndex] = {
          ...updatedChapters[currentChapterIndex].chapterContent[currentLectureIndex],
          lectureUrl: updatedLecture.lectureUrl,
          videoFile: null,
        };
        setChapters(updatedChapters);
      }
      setLectureDetails({
        _id: "",
        lectureTitle: "",
        lectureDuration: "",
        lectureUrl: "",
        isPreviewFree: false,
        videoFile: null,
      });
      setShowPopup(false);
      setCurrentChapterIndex(null);
      setCurrentLectureIndex(null);
      setSnackbar({
        open: true,
        message: "Lecture video updated successfully!",
        severity: 'success',
      });
    } catch (err: any) {
      console.error("Error updating lecture video:", err.response?.data || err);
      setSnackbar({
        open: true,
        message: err.response?.data?.error || "Failed to update lecture video",
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course: Course) => {
    console.log("Editing course:", course);
    setFormData({
      title: course.title,
      description: course.description,
      price: course.price,
      originalPrice: course.originalPrice || null,
      category: course.category,
      level: course.level,
      image: course.image,
      duration: course.duration,
      whatWillLearn: course.whatWillLearn || [],
      isFeatured: course.isFeatured || false,
      isPopular: course.isPopular || false,
      instructorId: typeof course.instructorId === "string" ? course.instructorId : course.instructorId._id,
    });
    setChapters(
      course.curriculum && Array.isArray(course.curriculum)
        ? course.curriculum.map((chapter) => ({
            _id: chapter._id,
            chapterTitle: chapter.chapterTitle || `Chapter ${chapter._id || chapters.length + 1}`,
            chapterContent: Array.isArray(chapter.chapterContent)
              ? chapter.chapterContent.map((lecture) => ({
                  _id: lecture._id || "",
                  lectureTitle: lecture.lectureTitle || "",
                  lectureDuration: lecture.lectureDuration || "",
                  lectureUrl: lecture.lectureUrl || "",
                  isPreviewFree: lecture.isPreviewFree || false,
                  videoFile: null,
                }))
              : [],
            collapsed: false,
          }))
        : []
    );
    setEditingCourse(course);
    setShowCreateForm(true);
  };

  const handleDelete = async (courseId: string) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    setLoading(true);
    setSnackbar({ open: false, message: '', severity: 'success' });
    try {
      await axiosInstance.delete(`/api/courses/${courseId}`);
      setCourses(courses.filter((c) => c._id !== courseId));
      setSnackbar({
        open: true,
        message: "Course deleted successfully!",
        severity: 'success',
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: "Failed to delete course",
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Chapter actions
  const handleChapter = (action: "add" | "remove", index?: number) => {
    switch (action) {
      case "add":
        setChapters((prevChapters) => [
          ...(prevChapters || []),
          {
            chapterTitle: `Chapter ${(prevChapters || []).length + 1}`,
            chapterContent: [],
            collapsed: false,
          },
        ]);
        break;
      case "remove":
        if (index !== undefined) {
          setChapters((prevChapters) => prevChapters.filter((_, i) => i !== index));
        }
        break;
    }
  };

  // Lecture actions
  const handleLecture = (
    action: "add" | "edit" | "remove",
    chapterIndex: number,
    lectureIndex?: number
  ) => {
    switch (action) {
      case "add":
        setCurrentChapterIndex(chapterIndex);
        setCurrentLectureIndex(null);
        setLectureDetails({
          _id: "",
          lectureTitle: "",
          lectureDuration: "",
          lectureUrl: "",
          isPreviewFree: false,
          videoFile: null,
        });
        setShowPopup("add");
        break;
      case "edit":
        if (lectureIndex !== undefined) {
          const lecture = chapters[chapterIndex].chapterContent[lectureIndex];
          setCurrentChapterIndex(chapterIndex);
          setCurrentLectureIndex(lectureIndex);
          setLectureDetails({
            _id: lecture._id || "",
            lectureTitle: lecture.lectureTitle,
            lectureDuration: lecture.lectureDuration,
            lectureUrl: lecture.lectureUrl,
            isPreviewFree: lecture.isPreviewFree,
            videoFile: null,
          });
          setShowPopup("edit");
        }
        break;
      case "remove":
        if (lectureIndex !== undefined) {
          const updatedChapters = [...chapters];
          updatedChapters[chapterIndex].chapterContent = updatedChapters[
            chapterIndex
          ].chapterContent.filter((_, i) => i !== lectureIndex);
          setChapters(updatedChapters);
        }
        break;
    }
  };

  const saveLecture = () => {
    if (currentChapterIndex === null || !lectureDetails.lectureTitle.trim()) {
      setSnackbar({
        open: true,
        message: "Please enter a valid lecture title",
        severity: 'error',
      });
      return;
    }
    if (showPopup === "add" && !lectureDetails.videoFile) {
      setSnackbar({
        open: true,
        message: "Please upload a video file for new lectures",
        severity: 'error',
      });
      return;
    }
    const updatedChapters = [...chapters];
    const lecture = {
      _id: lectureDetails._id || undefined,
      lectureTitle: lectureDetails.lectureTitle,
      lectureDuration: lectureDetails.lectureDuration,
      lectureUrl: lectureDetails.lectureUrl || "",
      isPreviewFree: lectureDetails.isPreviewFree,
      videoFile: lectureDetails.videoFile || null,
    };
    if (showPopup === "add") {
      updatedChapters[currentChapterIndex!].chapterContent.push(lecture);
    } else if (showPopup === "edit" && currentLectureIndex !== null) {
      updatedChapters[currentChapterIndex!].chapterContent[currentLectureIndex] = lecture;
    }
    setChapters(updatedChapters);
    setLectureDetails({
      _id: "",
      lectureTitle: "",
      lectureDuration: "",
      lectureUrl: "",
      isPreviewFree: false,
      videoFile: null,
    });
    setShowPopup(false);
    setCurrentChapterIndex(null);
    setCurrentLectureIndex(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
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
                setFormData({
                  title: "",
                  description: "",
                  price: null,
                  originalPrice: null,
                  category: "",
                  level: "Beginner",
                  image: "/placeholder.svg",
                  duration: "0 hours",
                  whatWillLearn: [],
                  isFeatured: false,
                  isPopular: false,
                  instructorId: formData.instructorId,
                });
                setChapters([]);
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
        {/* Stats Section */}
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

        {/* Form Section */}
        {showCreateForm && (
          <div>
              <Button
                  variant="outlined"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingCourse(null);
                    setFormData({
                      title: "",
                      description: "",
                      price: null,
                      originalPrice: null,
                      category: "",
                      level: "Beginner",
                      image: "/placeholder.svg",
                      duration: "0 hours",
                      whatWillLearn: [],
                      isFeatured: false,
                      isPopular: false,
                      instructorId: formData.instructorId,
                    });
                    setChapters([]);
                  }}
                  disabled={loading}
                  sx={{
                    borderRadius: "8px",
                    fontWeight: 600,
                    borderColor: "#d1d5db",
                    color: "#4b50af",
                    marginBottom: "1.5rem",
                    "&:hover": {
                      borderColor: "#9ca3af",
                      bgcolor: "#f3f4f6",
                    },
                  }}
                >
                  <FaArrowLeft />
                   Back
                </Button>
            
          <Card className="bg-white p-6 rounded-xl shadow-md">
            
            
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              {editingCourse ? "Edit Course" : "Create New Course"}
            </Typography>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title and Description */}
              <TextField
                fullWidth
                label="Course Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                margin="normal"
                required
                disabled={loading}
                InputLabelProps={{ shrink: true }}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              />
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                margin="normal"
                required
                disabled={loading}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              />

              {/* Price Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  type="number"
                  label="Original Price ($)"
                  value={formData.originalPrice ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      originalPrice: e.target.value
                        ? Number(e.target.value)
                        : null,
                    })
                  }
                  margin="normal"
                  fullWidth
                  disabled={loading}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                />
                <TextField
                  type="number"
                  label="Discounted Price ($)"
                  value={formData.price ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  margin="normal"
                  fullWidth
                  required
                  disabled={loading}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                />
              </div>

              {/* Category & Level & Duration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TextField
                  select
                  label="Category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  margin="normal"
                  fullWidth
                  required
                  disabled={loading}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="Level"
                  value={formData.level}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      level: e.target.value as
                        | "Beginner"
                        | "Intermediate"
                        | "Advanced",
                    })
                  }
                  margin="normal"
                  fullWidth
                  disabled={loading}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                >
                  <MenuItem value="Beginner">Beginner</MenuItem>
                  <MenuItem value="Intermediate">Intermediate</MenuItem>
                  <MenuItem value="Advanced">Advanced</MenuItem>
                </TextField>

                <TextField
                  fullWidth
                  label="Duration (e.g., 10 hours)"
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  margin="normal"
                  required
                  disabled={loading}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
                />
              </div>

              {/* Image Upload */}
              <TextField
                fullWidth
                label="Course Thumbnail URL"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                margin="normal"
                required
                disabled={loading}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              />

              {/* What Will Learn */}
              <div className="mt-4">
                <Typography variant="subtitle2" gutterBottom>
                  What Students Will Learn?
                </Typography>
                {formData.whatWillLearn.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <TextField
                      fullWidth
                      value={item}
                      onChange={(e) => {
                        const updated = [...formData.whatWillLearn];
                        updated[index] = e.target.value;
                        setFormData({
                          ...formData,
                          whatWillLearn: updated,
                        });
                      }}
                      size="small"
                      disabled={loading}
                      sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                    />
                    <Button
                      onClick={() => {
                        const updated = formData.whatWillLearn.filter(
                          (_, i) => i !== index
                        );
                        setFormData({
                          ...formData,
                          whatWillLearn: updated,
                        });
                      }}
                      color="error"
                      size="small"
                      disabled={loading}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  variant="outlined"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      whatWillLearn: [...formData.whatWillLearn, ""],
                    })
                  }
                  size="small"
                  disabled={loading}
                  sx={{
                    borderRadius: "6px",
                    borderColor: "#d1d5db",
                    color: "#4b5563",
                    marginTop: 1,
                  }}
                >
                  + Add Learning Point
                </Button>
              </div>

              {/* Checkboxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <Typography variant="subtitle2" gutterBottom>
                    Features
                  </Typography>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.isFeatured}
                        onChange={(e) =>
                          setFormData({ ...formData, isFeatured: e.target.checked })
                        }
                        disabled={loading}
                      />
                    }
                    label="Is Featured?"
                  />
                </div>
                <div>
                  <Typography variant="subtitle2" gutterBottom>
                    Visibility
                  </Typography>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.isPopular}
                        onChange={(e) =>
                          setFormData({ ...formData, isPopular: e.target.checked })
                        }
                        disabled={loading}
                      />
                    }
                    label="Is Popular?"
                  />
                </div>
              </div>

              {/* Curriculum Section */}
              <div className="mt-6">
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Curriculum
                </Typography>
                <div className="space-y-4">
                  {chapters && chapters.length > 0 ? (
                    chapters.map((chapter, chapterIndex) => (
                      <div
                        key={chapter._id || `chapter-${chapterIndex}`}
                        className="bg-white border rounded-lg mb-4"
                      >
                        <div className="flex justify-between items-center p-4 border-b">
                          <div
                            className="flex items-center cursor-pointer"
                            onClick={() => {
                              const updated = [...chapters];
                              updated[chapterIndex].collapsed =
                                !updated[chapterIndex].collapsed;
                              setChapters(updated);
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className={`transition-transform ${
                                chapter.collapsed ? "-rotate-90" : ""
                              } mr-2`}
                            >
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                            <TextField
                              value={chapter.chapterTitle}
                              onChange={(e) => {
                                const updated = [...chapters];
                                updated[chapterIndex].chapterTitle = e.target.value;
                                setChapters(updated);
                              }}
                              size="small"
                              disabled={loading}
                              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
                            />
                          </div>
                          <div className="flex gap-2">
                            <span className="text-gray-500">
                              {chapter.chapterContent.length} Lectures
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleChapter("remove", chapterIndex)
                              }
                              className="text-red-500 text-sm"
                              disabled={loading}
                            >
                              X
                            </button>
                          </div>
                        </div>
                        {!chapter.collapsed && (
                          <div className="p-4">
                            {chapter.chapterContent.map(
                              (lecture, lectureIndex) => (
                                <div
                                  key={lecture._id || `lecture-${chapterIndex}-${lectureIndex}`}
                                  className="flex justify-between items-center mb-2"
                                >
                                  <span>
                                    {lecture.lectureTitle} -{" "}
                                    {lecture.lectureDuration} mins -{" "}
                                    {lecture.isPreviewFree
                                      ? "Free Preview"
                                      : "Paid"}
                                  </span>
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleLecture(
                                          "edit",
                                          chapterIndex,
                                          lectureIndex
                                        )
                                      }
                                      className="text-blue-500 text-sm"
                                      disabled={loading}
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleLecture(
                                          "remove",
                                          chapterIndex,
                                          lectureIndex
                                        )
                                      }
                                      className="text-red-500 text-sm"
                                      disabled={loading}
                                    >
                                      X
                                    </button>
                                  </div>
                                </div>
                              )
                            )}
                            <div
                              className="inline-flex bg-gray-100 p-2 rounded cursor-pointer mt-2"
                              onClick={() => handleLecture("add", chapterIndex)}
                            >
                              + Add Lecture
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <Typography className="text-gray-500">
                      No chapters available. Add a chapter to start.
                    </Typography>
                  )}
                  <div
                    className="flex justify-center items-center bg-blue-100 p-2 rounded-lg cursor-pointer"
                    onClick={() => handleChapter("add")}
                  >
                    + Add Chapter
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-4">
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    bgcolor: "#4f46e5",
                    "&:hover": { bgcolor: "#3730a3" },
                    borderRadius: "8px",
                    fontWeight: 600,
                  }}
                >
                  {loading ? (
                    <>
                      <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />
                      Updating...
                    </>
                  ) : editingCourse ? "Update Course" : "Create Course"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingCourse(null);
                    setFormData({
                      title: "",
                      description: "",
                      price: null,
                      originalPrice: null,
                      category: "",
                      level: "Beginner",
                      image: "/placeholder.svg",
                      duration: "0 hours",
                      whatWillLearn: [],
                      isFeatured: false,
                      isPopular: false,
                      instructorId: formData.instructorId,
                    });
                    setChapters([]);
                  }}
                  disabled={loading}
                  sx={{
                    borderRadius: "8px",
                    fontWeight: 600,
                    borderColor: "#d1d5db",
                    color: "#4b50af",
                    "&:hover": {
                      borderColor: "#9ca3af",
                      bgcolor: "#f3f4f6",
                    },
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
          </div>
        )}

        {/* Courses List */}
        {!showCreateForm && (
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
                            onClick={() => handleEdit(course)}
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

        {/* Lecture Modal */}
        <Dialog open={!!showPopup} onClose={() => setShowPopup(false)}>
          <DialogTitle>{showPopup === "add" ? "Add Lecture" : "Edit Lecture"}</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Lecture Title"
              value={lectureDetails.lectureTitle}
              onChange={(e) =>
                setLectureDetails({
                  ...lectureDetails,
                  lectureTitle: e.target.value,
                })
              }
              margin="dense"
              variant="outlined"
              required
              disabled={loading}
            />
            <TextField
              fullWidth
              label="Duration (minutes)"
              value={lectureDetails.lectureDuration}
              onChange={(e) =>
                setLectureDetails({
                  ...lectureDetails,
                  lectureDuration: e.target.value,
                })
              }
              margin="dense"
              variant="outlined"
              required
              disabled={loading}
            />
            {showPopup === "edit" && lectureDetails.lectureUrl && (
              <div className="mt-4">
                <Typography variant="subtitle2" gutterBottom>
                  Current Video Preview
                </Typography>
                <video
                  controls
                  src={lectureDetails.lectureUrl}
                  style={{ width: "100%", maxHeight: "200px", borderRadius: "8px" }}
                />
              </div>
            )}
            <TextField
              fullWidth
              type="file"
              inputProps={{ accept: "video/*" }}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setLectureDetails({
                  ...lectureDetails,
                  videoFile: e.target.files ? e.target.files[0] : null,
                })
              }
              margin="dense"
              variant="outlined"
              required={showPopup === "add"}
              disabled={loading}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={lectureDetails.isPreviewFree}
                  onChange={(e) =>
                    setLectureDetails({ ...lectureDetails, isPreviewFree: e.target.checked })
                  }
                  disabled={loading}
                />
              }
              label="Free Preview"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowPopup(false)} disabled={loading}>
              Cancel
            </Button>
            {showPopup === "edit" && lectureDetails._id && (
              <Button onClick={handleUpdateLectureVideo} disabled={loading}>
                Update Video
              </Button>
            )}
            <Button onClick={saveLecture} disabled={loading}>
              {showPopup === "add" ? "Add Lecture" : "Update Lecture"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for Success/Error Messages */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default InstructorDashboard;
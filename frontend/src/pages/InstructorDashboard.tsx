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
import { useNavigate } from "react-router-dom";


// Course interface
interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  instructorId: string;
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
  chapterId: number;
  chapterTitle: string;
  chapterContent: Lecture[];
}

interface Lecture {
  lectureTitle: string;
  lectureDuration: string;
  lectureUrl: string;
  isPreviewFree: boolean;
}

const InstructorDashboard = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Form data state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: null as number | null,
    originalPrice: null as number | null,
    category: "",
    level: "Beginner" as "Beginner" | "Intermediate" | "Advanced",
    image: "",
    duration: "0 hours",
    whatWillLearn: [] as string[],
    isFeatured: false,
    isPopular: false,
    instructorId: "", // Will be pulled from localStorage
  });

  // Curriculum state
  const [chapters, setChapters] = useState<
    {
      chapterTitle: string;
      chapterContent: {
        lectureTitle: string;
        lectureDuration: string;
        lectureUrl: string;
        isPreviewFree: boolean;
      }[];
    }[]
  >([]);

  const [showPopup, setShowPopup] = useState(false);
  const [currentChapterIndex, setCurrentChapterIndex] = useState<number | null>(
    null
  );
  const [lectureDetails, setLectureDetails] = useState({
    lectureTitle: "",
    lectureDuration: "",
    lectureUrl: "",
    isPreviewFree: false,
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
        instructorId: user._id || "",
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
        const instructorId = user.id;

        const response = await axiosInstance.get(
          `/api/courses/instructor/${instructorId}`
        );

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

    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;
    const instructorName = user?.name || "Jane Doe";
    const instructorId = formData.instructorId || user?.id;

    if (!instructorId) {
      alert("Instructor ID is required.");
      return;
    }

    const url = editingCourse
      ? `/api/courses/${editingCourse._id}`
      : "/api/courses";
    const method = editingCourse ? "PUT" : "POST";

    try {
      const response = await axiosInstance({
        method,
        url,
        data: {
          ...formData,
          curriculum: chapters.map((chapter) => ({
            chapterTitle: chapter.chapterTitle,
            chapterContent: chapter.chapterContent.map((lecture) => ({
              lectureTitle: lecture.lectureTitle,
              lectureDuration: lecture.lectureDuration,
              lectureUrl: lecture.lectureUrl,
              isPreviewFree: lecture.isPreviewFree,
            })),
          })),
          instructor: instructorName,
          instructorId: instructorId,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (editingCourse) {
        setCourses(
          courses.map((c) =>
            c._id === editingCourse._id ? response.data.course : c
          )
        );
        setEditingCourse(null);
      } else {
        setCourses([...courses, response.data.course]);
      }

      // Reset form
      setFormData({
        title: "",
        description: "",
        price: 0,
        originalPrice: null,
        category: "",
        level: "Beginner",
        image: "/placeholder.svg",
        duration: "0 hours",
        whatWillLearn: [],
        isFeatured: false,
        isPopular: false,
        instructorId: user?._id || "",
      });
      setChapters([]);
      setShowCreateForm(false);
    } catch (err: any) {
      alert(err.response?.data?.error || "Something went wrong");
    }
  };

  const handleEdit = (course: Course) => {
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
      instructorId: course.instructorId,
    });
    setChapters(course.curriculum || []);
    setEditingCourse(course);
    setShowCreateForm(true);
  };

  const handleDelete = async (courseId: string) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      await axiosInstance.delete(`/api/courses/${courseId}`);
      setCourses(courses.filter((c) => c._id !== courseId));
    } catch (err: any) {
      alert("Failed to delete course");
    }
  };

  // Chapter actions
  const handleChapter = (action: "add" | "remove", index?: number) => {
    switch (action) {
      case "add":
        setChapters([
          ...chapters,
          {
            chapterTitle: `Chapter ${chapters.length + 1}`,
            chapterContent: [],
          },
        ]);
        break;
      case "remove":
        if (index !== undefined) {
          setChapters(chapters.filter((_, i) => i !== index));
        }
        break;
    }
  };

  // Lecture actions
  const handleLecture = (
    action: "add" | "remove",
    chapterIndex: number,
    lectureIndex?: number
  ) => {
    switch (action) {
      case "add":
        setCurrentChapterIndex(chapterIndex);
        setShowPopup(true);
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

  const addLecture = () => {
    if (currentChapterIndex === null || !lectureDetails.lectureTitle.trim()) {
      alert("Please enter a valid lecture title");
      return;
    }
    const updatedChapters = [...chapters];
    updatedChapters[currentChapterIndex!].chapterContent.push(lectureDetails);
    setChapters(updatedChapters);
    setLectureDetails({
      lectureTitle: "",
      lectureDuration: "",
      lectureUrl: "",
      isPreviewFree: false,
    });
    setShowPopup(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
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
              onClick={() => setShowCreateForm(true)}
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
                InputLabelProps={{ shrink: true }}
                sx={{ "& .MuiOutlinedInput.root": { borderRadius: "8px" } }}
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
                sx={{ "& .MuiOutlinedInput.root": { borderRadius: "8px" } }}
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
                  sx={{ "& .MuiOutlinedInput.root": { borderRadius: "8px" } }}
                />
                <TextField
                  type="number"
                  label="Discounted Price ($)"
                  value={formData.price ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: Number(e.target.value),
                    })
                  }
                  margin="normal"
                  fullWidth
                  required
                  sx={{ "& .MuiOutlinedInput.root": { borderRadius: "8px" } }}
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
                  sx={{ "& .MuiOutlinedInput.root": { borderRadius: "8px" } }}
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
                  sx={{ "& .MuiOutlinedInput.root": { borderRadius: "8px" } }}
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
                  sx={{ "& .MuiOutlinedInput.root": { borderRadius: "8px" } }}
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
                sx={{ "& .MuiOutlinedInput.root": { borderRadius: "8px" } }}
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
                      sx={{ "& .MuiOutlinedInput.root": { borderRadius: "6px" } }}
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
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isFeatured: e.target.checked,
                        })
                      }
                      className="mr-2 h-4 w-4"
                    />
                    <span>Is Featured?</span>
                  </label>
                </div>
                <div>
                  <Typography variant="subtitle2" gutterBottom>
                    Visibility
                  </Typography>
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isPopular}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isPopular: e.target.checked,
                        })
                      }
                      className="mr-2 h-4 w-4"
                    />
                    <span>Is Popular?</span>
                  </label>
                </div>
              </div>

              {/* Curriculum Section */}
              <div className="mt-6">
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Curriculum
                </Typography>
                <div className="space-y-4">
                  {chapters.map((chapter, chapterIndex) => (
                    <div
                      key={chapterIndex}
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
                          <span className="font-semibold">
                            {chapter.chapterTitle}
                          </span>
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
                                key={lectureIndex}
                                className="flex justify-between items-center mb-2"
                              >
                                <span>
                                  {lecture.lectureTitle} -{" "}
                                  {lecture.lectureDuration} mins -{" "}
                                  <a
                                    href={lecture.lectureUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 underline"
                                  >
                                    Link
                                  </a>{" "}
                                  -{" "}
                                  {lecture.isPreviewFree
                                    ? "Free Preview"
                                    : "Paid"}
                                </span>
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
                                >
                                  X
                                </button>
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
                  ))}
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
                  sx={{
                    bgcolor: "#4f46e5",
                    "&:hover": { bgcolor: "#3730a3" },
                    borderRadius: "8px",
                    fontWeight: 600,
                  }}
                >
                  {editingCourse ? "Update Course" : "Create Course"}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingCourse(null);
                    setFormData({
                      title: "",
                      description: "",
                      price: 0,
                      originalPrice: null,
                      category: "",
                      level: "Beginner",
                      image: "/placeholder.svg",
                      duration: "0 hours",
                      whatWillLearn: [],
                      isFeatured: false,
                      isPopular: false,
                      instructorId: "",
                    });
                    setChapters([]);
                  }}
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
      </div>

      {/* Lecture Modal */}
      <Dialog open={showPopup} onClose={() => setShowPopup(false)}>
        <DialogTitle>Add Lecture</DialogTitle>
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
          />
          <TextField
            fullWidth
            label="Lecture Video URL"
            value={lectureDetails.lectureUrl}
            onChange={(e) =>
              setLectureDetails({
                ...lectureDetails,
                lectureUrl: e.target.value,
              })
            }
            margin="dense"
            variant="outlined"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowPopup(false)}>Cancel</Button>
          <Button onClick={addLecture}>Add Lecture</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default InstructorDashboard;
import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  TextField,
  Typography,
  MenuItem,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { FaArrowLeft } from "react-icons/fa";
import axiosInstance from "../../helpers/axiosInstance";

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

interface CourseFormProps {
  initialData?: {
    _id?: string;
    title: string;
    description: string;
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
    instructorId?: string;
  };
  onSubmit: (formData: any, chapters: Chapter[]) => Promise<void>;
  onCancel: () => void;
  isEditing: boolean;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setSnackbar: (snackbar: { open: boolean; message: string; severity: "success" | "error" }) => void;
}

const CourseForm: React.FC<CourseFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditing,
  loading,
  setLoading,
  setSnackbar,
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    price: initialData?.price ?? null,
    originalPrice: initialData?.originalPrice ?? null,
    category: initialData?.category || "",
    level: initialData?.level || "Beginner",
    image: initialData?.image || "/placeholder.svg",
    duration: initialData?.duration || "0 hours",
    whatWillLearn: initialData?.whatWillLearn || [],
    isFeatured: initialData?.isFeatured || false,
    isPopular: initialData?.isPopular || false,
    instructorId: initialData?.instructorId || "",
  });

  const [chapters, setChapters] = useState<Chapter[]>(
    initialData?.curriculum?.map((chapter) => ({
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
    })) || []
  );

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

  const categories = [
    "Web Development",
    "Programming",
    "Design",
    "Backend Development",
    "Data Science",
    "Mobile Development",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setSnackbar({ open: false, message: "", severity: "success" });

    try {
      await onSubmit(formData, chapters);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || "Failed to save course",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChapter = (action: "add" | "remove", index?: number) => {
    switch (action) {
      case "add":
        setChapters((prevChapters) => [
          ...prevChapters,
          {
            chapterTitle: `Chapter ${prevChapters.length + 1}`,
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
        severity: "error",
      });
      return;
    }
    if (showPopup === "add" && !lectureDetails.videoFile) {
      setSnackbar({
        open: true,
        message: "Please upload a video file for new lectures",
        severity: "error",
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

  const handleUpdateLectureVideo = async () => {
    if (!lectureDetails._id || !lectureDetails.videoFile) {
      setSnackbar({
        open: true,
        message: "Please select a lecture and upload a video file",
        severity: "error",
      });
      return;
    }

    setLoading(true);
    setSnackbar({ open: false, message: "", severity: "success" });

    const formData = new FormData();
    formData.append("file", lectureDetails.videoFile);

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
        severity: "success",
      });
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || "Failed to update lecture video",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white p-6 rounded-xl shadow-md">
      <Button
        variant="outlined"
        onClick={onCancel}
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
        <FaArrowLeft className="mr-2" />
        Back
      </Button>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        {isEditing ? "Edit Course" : "Create New Course"}
      </Typography>
      <form onSubmit={handleSubmit} className="space-y-5">
        <TextField
          fullWidth
          label="Course Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          margin="normal"
          required
          disabled={loading}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextField
            type="number"
            label="Original Price ($)"
            value={formData.originalPrice ?? ""}
            onChange={(e) =>
              setFormData({
                ...formData,
                originalPrice: e.target.value ? Number(e.target.value) : null,
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextField
            select
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                level: e.target.value as "Beginner" | "Intermediate" | "Advanced",
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
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            margin="normal"
            required
            disabled={loading}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
          />
        </div>
        <TextField
          fullWidth
          label="Course Thumbnail URL"
          value={formData.image}
          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
          margin="normal"
          required
          disabled={loading}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
        />
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
                  setFormData({ ...formData, whatWillLearn: updated });
                }}
                size="small"
                disabled={loading}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
              />
              <Button
                onClick={() => {
                  const updated = formData.whatWillLearn.filter((_, i) => i !== index);
                  setFormData({ ...formData, whatWillLearn: updated });
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
              setFormData({ ...formData, whatWillLearn: [...formData.whatWillLearn, ""] })
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
                        updated[chapterIndex].collapsed = !updated[chapterIndex].collapsed;
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
                        onClick={() => handleChapter("remove", chapterIndex)}
                        className="text-red-500 text-sm"
                        disabled={loading}
                      >
                        X
                      </button>
                    </div>
                  </div>
                  {!chapter.collapsed && (
                    <div className="p-4">
                      {chapter.chapterContent.map((lecture, lectureIndex) => (
                        <div
                          key={lecture._id || `lecture-${chapterIndex}-${lectureIndex}`}
                          className="flex justify-between items-center mb-2"
                        >
                          <span>
                            {lecture.lectureTitle} - {lecture.lectureDuration} mins -{" "}
                            {lecture.isPreviewFree ? "Free Preview" : "Paid"}
                          </span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleLecture("edit", chapterIndex, lectureIndex)}
                              className="text-blue-500 text-sm"
                              disabled={loading}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => handleLecture("remove", chapterIndex, lectureIndex)}
                              className="text-red-500 text-sm"
                              disabled={loading}
                            >
                              X
                            </button>
                          </div>
                        </div>
                      ))}
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
                <CircularProgress size={24} sx={{ color: "white", mr: 1 }} />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : isEditing ? "Update Course" : "Create Course"}
          </Button>
          <Button
            variant="outlined"
            onClick={onCancel}
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
      <Dialog open={!!showPopup} onClose={() => setShowPopup(false)}>
        <DialogTitle>{showPopup === "add" ? "Add Lecture" : "Edit Lecture"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Lecture Title"
            value={lectureDetails.lectureTitle}
            onChange={(e) =>
              setLectureDetails({ ...lectureDetails, lectureTitle: e.target.value })
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
              setLectureDetails({ ...lectureDetails, lectureDuration: e.target.value })
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
    </Card>
  );
};

export default CourseForm;
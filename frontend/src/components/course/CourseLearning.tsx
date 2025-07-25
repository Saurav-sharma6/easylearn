import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import VideoPlayer from "./VideoPlayer";
import { CheckCircle } from "lucide-react";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import axiosInstance from "../../helpers/axiosInstance";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  completed: boolean;
  durationSeconds: number;
}

interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role?: string;
  token?: string;
}

interface CourseProgress {
  watchedDuration: number;
  percentageCompleted: number;
  status: "started" | "completed";
  totalDuration: number;
}

const CourseLearning = () => {
  const { id: courseId } = useParams();
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
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [courseTitle, setCourseTitle] = useState<string>(""); // Store course title for certificate
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const [courseProgress, setCourseProgress] = useState<CourseProgress>({
    watchedDuration: 0,
    percentageCompleted: 0,
    status: "started",
    totalDuration: 0,
  });
  const progressRef = useRef<{ [lessonId: string]: number }>({});
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Generate certificate by calling backend
  const generateCertificate = async () => {
    if (!userId || !courseId) {
      setSnackbar({
        open: true,
        message: "Unable to generate certificate: Missing user or course details",
        severity: "error",
      });
      return;
    }

    try {
      const response = await axiosInstance.post('/api/courses/certificates/generate', {
        userId,
        courseId,
      }, {
        headers: {
          Authorization: `Bearer ${user?.token || ''}`,
          'Accept': 'application/pdf',
        },
        responseType: 'blob', // Expect binary PDF data
      });

      const blob = response.data;
      const blobUrl = window.URL.createObjectURL(blob);

      // Trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${courseTitle}_Certificate.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      setSnackbar({
        open: true,
        message: "Certificate downloaded successfully!",
        severity: "success",
      });
    } catch (error: any) {
      console.error("Certificate generation failed:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setSnackbar({
        open: true,
        message: error.response?.data?.error || error.message || "Failed to generate certificate",
        severity: "error",
      });
    }
  };

  useEffect(() => {
    const fetchCourseAndProgress = async () => {
      if (!userId) {
        setSnackbar({
          open: true,
          message: "Please log in to access this course",
          severity: "error",
        });
        setLoading(false);
        navigate("/login");
        return;
      }

      if (!courseId) {
        setSnackbar({
          open: true,
          message: "Invalid course ID",
          severity: "error",
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Check enrollment
        const enrollmentsResponse = await axiosInstance.get(
          `/api/enrollments/user/${userId}`
        );
        const isEnrolled = enrollmentsResponse.data.some(
          (e: any) => e.courseId === courseId
        );
        if (!isEnrolled) {
          setSnackbar({
            open: true,
            message: "You are not enrolled in this course",
            severity: "error",
          });
          setLoading(false);
          return;
        }
        setEnrolled(true);

        // Fetch course data
        const courseResponse = await axiosInstance.get(
          `/api/courses/${courseId}`
        );
        if (!courseResponse.data.course) {
          throw new Error("Course data not found");
        }
        const course = courseResponse.data.course;
        setCourseTitle(course.title || "Untitled Course"); // Set course title

        // Log raw curriculum
        // console.log('Raw course curriculum:', JSON.stringify(course.curriculum, null, 2));

        const fetchedChapters: Chapter[] = [];
        const allLessons: Lesson[] = [];
        let totalDuration = 0;

        // Handle curriculum (array of populated chapters)
        if (Array.isArray(course.curriculum)) {
          course.curriculum.forEach((chapter: any) => {
            if (
              !chapter._id ||
              !chapter.chapterTitle ||
              !Array.isArray(chapter.chapterContent)
            ) {
              console.warn("Skipping invalid chapter:", chapter);
              return;
            }
            const chapterLessons: Lesson[] = chapter.chapterContent
              .map((lecture: any) => {
                if (
                  !lecture._id ||
                  !lecture.lectureUrl ||
                  !lecture.lectureTitle
                ) {
                  console.warn("Skipping invalid lecture:", lecture);
                  return null;
                }
                const durationSeconds =
                  parseFloat(lecture.lectureDuration || 0) * 60;
                const lesson = {
                  id: lecture._id.toString(),
                  title: lecture.lectureTitle || "Untitled Lesson",
                  duration: lecture.lectureDuration || "0",
                  videoUrl: (lecture.lectureUrl || "").trim(),
                  completed: false,
                  durationSeconds: isNaN(durationSeconds) ? 0 : durationSeconds,
                };
                allLessons.push(lesson);
                progressRef.current[lesson.id] = 0;
                totalDuration += durationSeconds;
                return lesson;
              })
              .filter((lesson: Lesson | null) => lesson !== null);

            if (chapterLessons.length > 0) {
              fetchedChapters.push({
                id: chapter._id.toString(),
                title: chapter.chapterTitle || "Untitled Chapter",
                lessons: chapterLessons,
              });
            }
          });
        } else {
          console.error("Invalid curriculum format:", course.curriculum);
          throw new Error("Invalid curriculum format");
        }

        if (allLessons.length === 0) {
          throw new Error("No valid lessons found in course");
        }

        // Log lessons before progress fetch
        // console.log('Loaded lessons before progress:', allLessons.map((l) => ({ id: l.id, title: l.title, completed: l.completed })));

        // Fetch user progress
        let progress = [];
        let fetchedCourseProgress = {
          watchedDuration: 0,
          percentageCompleted: 0,
          status: "started",
          totalDuration,
        };

        try {
          const progressResponse = await axiosInstance.get(
            `/api/courses/progress/${userId}/${courseId}`
          );
          // console.log('Fetched progress response:', JSON.stringify(progressResponse.data, null, 2));
          progress = progressResponse.data.progress || [];
          fetchedCourseProgress =
            progressResponse.data.courseProgress || fetchedCourseProgress;
        } catch (err: any) {
          console.error("Progress fetch error:", err.response?.data || err);
          if (err.response?.status === 404) {
            console.log("No progress found, initializing empty progress");
            for (const lesson of allLessons) {
              if (!lesson.id) continue;
              try {
                await axiosInstance.post("/api/courses/progress", {
                  courseId,
                  lessonId: lesson.id,
                  userId,
                  progress: 0,
                  completed: false,
                });
                progress.push({
                  lessonId: lesson.id,
                  progress: 0,
                  completed: false,
                });
              } catch (postErr: any) {
                console.error(
                  "Failed to initialize progress for lesson:",
                  lesson.id,
                  postErr.response?.data || postErr
                );
              }
            }
          } else {
            throw err;
          }
        }

        // Update lessons and chapters with progress
        const updatedLessons = allLessons.map((lesson) => {
          const progressEntry = progress.find(
            (p: any) => p.lessonId.toString() === lesson.id
          );
          // console.log('Processing lesson:', lesson.id, 'progressEntry:', progressEntry);
          if (progressEntry) {
            progressRef.current[lesson.id] = isNaN(progressEntry.progress)
              ? 0
              : progressEntry.progress;
            return { ...lesson, completed: !!progressEntry.completed };
          }
          return lesson;
        });

        // Update chapters with completed status
        const updatedChapters = fetchedChapters.map((chapter) => ({
          ...chapter,
          lessons: chapter.lessons.map((lesson) => {
            const progressEntry = progress.find(
              (p: any) => p.lessonId.toString() === lesson.id
            );
            return progressEntry
              ? { ...lesson, completed: !!progressEntry.completed }
              : lesson;
          }),
        }));

        // console.log('Updated lessons after progress:', updatedLessons.map((l) => ({ id: l.id, title: l.title, completed: l.completed })));
        // console.log('Updated chapters after progress:', updatedChapters.map((c) => ({
        //   id: c.id,
        //   title: c.title,
        //   lessons: c.lessons.map((l) => ({ id: l.id, title: l.title, completed: l.completed })),
        // })));
        // console.log('Initial progressRef:', progressRef.current);

        setChapters(updatedChapters);
        setLessons(updatedLessons);
        setCourseProgress(fetchedCourseProgress);
        // console.log('Initial courseProgress:', fetchedCourseProgress);

        // Set currentLessonIndex to the first uncompleted lesson
        const firstUncompletedIndex = updatedLessons.findIndex(
          (lesson) => !lesson.completed
        );
        const initialIndex =
          firstUncompletedIndex !== -1
            ? firstUncompletedIndex
            : updatedLessons.length > 0
            ? 0
            : -1;
        // console.log('Setting initial currentLessonIndex:', initialIndex, 'title:', updatedLessons[initialIndex]?.title || 'none');
        setCurrentLessonIndex(initialIndex);
      } catch (err: any) {
        console.error(
          "Failed to load course or progress:",
          err.response?.data || err
        );
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
            message:
              err.response?.data?.error || "Failed to load course content",
            severity: "error",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourseAndProgress();
  }, [courseId, userId, navigate]);

  // Save lesson progress with retry
  const saveProgress = async (
    lessonId: string,
    progress: number,
    completed: boolean,
    retries = 3
  ) => {
    if (!userId || !lessonId) {
      setSnackbar({
        open: true,
        message: "User or lesson not authenticated",
        severity: "error",
      });
      if (!userId) navigate("/login");
      return;
    }

    // Skip saving if lesson is already completed
    if (completed && lessons.find((l) => l.id === lessonId)?.completed) {
      return;
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await axiosInstance.post("/api/courses/progress", {
          courseId,
          lessonId,
          userId,
          progress: Number(progress),
          completed,
        });
        // console.log('Progress saved, response:', JSON.stringify(response.data, null, 2));
        setCourseProgress((prev) => {
          const newProgress = { ...prev, ...response.data.courseProgress };
          // console.log('Updating courseProgress:', newProgress);
          return newProgress;
        });
        if (completed) {
          setLessons((prev) => {
            const newLessons = prev.map((lesson) =>
              lesson.id === lessonId ? { ...lesson, completed: true } : lesson
            );
            // console.log('Updated lessons after save:', newLessons.map((l) => ({ id: l.id, title: l.title, completed: l.completed })));
            return newLessons;
          });
          setChapters((prev) => {
            const newChapters = prev.map((chapter) => ({
              ...chapter,
              lessons: chapter.lessons.map((lesson) =>
                lesson.id === lessonId ? { ...lesson, completed: true } : lesson
              ),
            }));
            console.log(
              "Updated chapters after save:",
              newChapters.map((c) => ({
                id: c.id,
                title: c.title,
                lessons: c.lessons.map((l) => ({
                  id: l.id,
                  title: l.title,
                  completed: l.completed,
                })),
              }))
            );
            setSnackbar({
              open: true,
              message: "Lesson marked as complete!",
              severity: "success",
            });
            return newChapters;
          });
          if (response.data.isCourseCompleted) {
            setSnackbar({
              open: true,
              message: "Congratulations! Course completed! Download your certificate.",
              severity: "success",
            });
          }
        }


        // Update progressRef after saving
        progressRef.current[lessonId] = progress;
        // console.log('Updated progressRef after save:', progressRef.current);
        return;
      } catch (err: any) {
        // console.error(`Error saving progress (attempt ${attempt}):`, err.response?.data || err);
        if (
          err.response?.status === 404 &&
          err.response?.data?.error === "Lesson not found in course"
        ) {
          console.error("Lesson ID mismatch detected. Lesson ID:", lessonId);
          setSnackbar({
            open: true,
            message: "Lesson not found in course. Please try again.",
            severity: "error",
          });
          return;
        }
        if (attempt === retries) {
          setSnackbar({
            open: true,
            message: err.response?.data?.error || "Failed to save progress",
            severity: "error",
          });
        }
        if (err.response?.status === 404 || err.response?.status === 500) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          break;
        }
      }
    }
  };

  // Handle lesson completion
  const handleLessonComplete = (lessonId: string) => {
    if (!lessons.find((lesson) => lesson.id === lessonId)?.completed) {
      const currentLesson = lessons.find((l) => l.id === lessonId);
      saveProgress(
        lessonId,
        currentLesson?.durationSeconds || progressRef.current[lessonId] || 0,
        true
      );
    }
  };

  // Handle manual mark as complete
  const handleMarkCurrentLessonComplete = () => {
    const current = lessons[currentLessonIndex];
    if (current && !current.completed) {
      handleLessonComplete(current.id);
    }
  };

  // Handle video time update
  const handleTimeUpdate = (event: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = event.target as HTMLVideoElement;
    const lessonId = lessons[currentLessonIndex]?.id;
    if (!lessonId || !userId) {
      return;
    }

    const currentTime = video.currentTime;
    const duration = video.duration;
    if (isNaN(currentTime) || isNaN(duration)) {
      // console.warn('Invalid video time or duration:', { currentTime, duration });
      return;
    }
    progressRef.current[lessonId] = currentTime;

    // Save progress every 10 seconds for non-completed lessons
    if (
      Math.floor(currentTime) % 10 === 0 &&
      currentTime > 0 &&
      !lessons.find((l) => l.id === lessonId)?.completed
    ) {
      // console.log('Saving periodic progress:', { lessonId, currentTime });
      saveProgress(lessonId, currentTime, false);
    }

    // Auto-mark lesson as complete at 90% but continue playing
    if (
      duration &&
      currentTime >= duration * 0.9 &&
      !lessons.find((l) => l.id === lessonId)?.completed
    ) {
      // console.log('Auto-marking lesson as complete at 90%:', lessonId);
      handleLessonComplete(lessonId);
    }
  };

  // Handle video ended
  const handleVideoEnded = () => {
    const lessonId = lessons[currentLessonIndex]?.id;
    if (lessonId && !lessons.find((l) => l.id === lessonId)?.completed) {
      // console.log('Video ended, marking lesson as complete:', lessonId);
      handleLessonComplete(lessonId);
    }

    // Advance to next lesson or chapter
    if (currentLessonIndex < lessons.length - 1) {
      // console.log('Advancing to next lesson, index:', currentLessonIndex + 1);
      setCurrentLessonIndex(currentLessonIndex + 1);
    } else {
      const currentChapterIndex = chapters.findIndex((chapter) =>
        chapter.lessons.some((lesson) => lesson.id === lessonId)
      );
      if (currentChapterIndex < chapters.length - 1) {
        const nextChapter = chapters[currentChapterIndex + 1];
        const nextLessonIndex = lessons.findIndex(
          (lesson) => lesson.id === nextChapter.lessons[0].id
        );
        if (nextLessonIndex >= 0) {
          // console.log('Advancing to next chapter lesson, index:', nextLessonIndex);
          setCurrentLessonIndex(nextLessonIndex);
        }
      } else {
        console.log("Course completed, no more lessons");
        if (videoRef.current) {
          videoRef.current.pause();
        }
      }
    }
  };

  // Handle lesson change
  const handleLessonChange = (index: number) => {
    if (index < 0 || index >= lessons.length) {
      // console.warn('Invalid lesson index:', index);
      return;
    }
    // console.log('Changing to lesson index:', index, 'title:', lessons[index].title, 'progress:', progressRef.current[lessons[index].id] || 0);
    setCurrentLessonIndex(index);
  };

  // Handle enroll button click
  const handleEnroll = async () => {
    if (!userId) {
      navigate("/login");
      return;
    }
    try {
      const response = await axiosInstance.post("/api/enrollments", {
        userId,
        courseId,
      });
      setEnrolled(true);
      setSnackbar({
        open: true,
        message: "Enrollment successful!",
        severity: "success",
      });
      // Re-fetch course and progress after enrollment
      fetchCourseAndProgress();
    } catch (err: any) {
      console.error("Enrollment failed:", err.response?.data || err);
      setSnackbar({
        open: true,
        message: err.response?.data?.error || "Failed to enroll in the course",
        severity: "error",
      });
    }
  };

  const completedLessons = lessons.filter((lesson) => lesson.completed).length;
  const isCourseCompleted = courseProgress.status === "completed";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Typography variant="h5" gutterBottom sx={{ color: "#1a202c" }}>
          {courseTitle || "Course Learning"}
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <LinearProgress />
          </Box>
        ) : !userId ? (
          <Typography variant="body1" sx={{ color: "#c53030" }}>
            Please{" "}
            <a href="/login" className="text-blue-600 underline">
              log in
            </a>{" "}
            to access this course.
          </Typography>
        ) : !enrolled ? (
          <Box>
            <Typography variant="body1" sx={{ color: "#c53030" }} gutterBottom>
              You are not enrolled in this course.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleEnroll}
              sx={{ bgcolor: "#3b82f6", "&:hover": { bgcolor: "#2563eb" } }}
            >
              Enroll in Course
            </Button>
          </Box>
        ) : lessons.length === 0 ? (
          <Typography variant="body1" sx={{ color: "#c53030" }}>
            No valid lessons available for this course.
          </Typography>
        ) : (
          <>
            <Box sx={{ width: "100%", mb: 4 }}>
              <Typography variant="body2" sx={{ color: "#4a5568" }}>
                {completedLessons} of {lessons.length} lessons completed (
                {courseProgress.percentageCompleted.toFixed(1)}%)
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Number(courseProgress.percentageCompleted) || 0}
                sx={{
                  height: 10,
                  borderRadius: 5,
                  mt: 1,
                  backgroundColor: "#e0e0e0",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 5,
                    backgroundColor: "#14b8a6",
                  },
                }}
              />
            </Box>
                {isCourseCompleted && (
              <Box sx={{ mb: 4, p: 3, bgcolor: "#e6fffa", borderRadius: 2, textAlign: "center" }}>
                <Typography variant="h6" sx={{ color: "#059669", mb: 2 }}>
                  Congratulations! You have completed {courseTitle}!
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<CheckCircle />}
                  onClick={generateCertificate}
                  sx={{ bgcolor: "#3b82f6", "&:hover": { bgcolor: "#2563eb" } }}
                >
                  Download Certificate
                </Button>
              </Box>
            )}
            
            {!isCourseCompleted &&
              lessons[currentLessonIndex] &&
              !lessons[currentLessonIndex].completed && (
                <div className="mb-6">
                  <Button
                    onClick={handleMarkCurrentLessonComplete}
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircle />}
                    sx={{
                      bgcolor: "#059669",
                      "&:hover": { bgcolor: "#047857" },
                    }}
                    disabled={loading}
                  >
                    Mark Lesson as Complete
                  </Button>
                </div>
              )}

            <VideoPlayer
              chapters={chapters}
              lessons={lessons}
              currentLessonIndex={currentLessonIndex}
              onLessonChange={handleLessonChange}
              onLessonComplete={handleLessonComplete}
              autoPlay={true}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleVideoEnded}
              videoRef={videoRef}
              progressRef={progressRef}
            />

            {user && (
              <Typography variant="caption" sx={{ color: "#4a5568", mt: 4 }}>
                Logged in as: {user.name} ({user.email})
              </Typography>
            )}
          </>
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

export default CourseLearning;

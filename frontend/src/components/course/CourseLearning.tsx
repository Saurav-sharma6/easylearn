import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../layout/Header";
import VideoPlayer from "./VideoPlayer";
import { CheckCircle } from "lucide-react";

import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import axiosInstance from "../../helpers/axiosInstance";

interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  completed: boolean;
}

interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface User {
  _id: string;
  name: string;
  email: string;
}

const CourseLearning = () => {
  const { id: courseId } = useParams();
  const storedUser = localStorage.getItem("user");
  const user: User | null = storedUser ? JSON.parse(storedUser) : null;

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axiosInstance.get(`/api/courses/${courseId}`);
        const course = response.data.course;

        const fetchedChapters: Chapter[] = [];
        const allLessons: Lesson[] = [];

        course.curriculum.forEach((chapter: any) => {
          const chapterLessons: Lesson[] = chapter.chapterContent.map((lecture: any) => {
            const lesson = {
              id: lecture._id,
              title: lecture.lectureTitle,
              duration: lecture.lectureDuration,
              videoUrl: lecture.lectureUrl.trim(),
              completed: false,
            };
            allLessons.push(lesson);
            return lesson;
          });

          fetchedChapters.push({
            id: chapter._id,
            title: chapter.chapterTitle,
            lessons: chapterLessons,
          });
        });

        setChapters(fetchedChapters);
        setLessons(allLessons);
      } catch (err) {
        console.error("Failed to load course content", err);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleLessonComplete = (lessonId: string) => {
    setLessons((prev) =>
      prev.map((lesson) =>
        lesson.id === lessonId ? { ...lesson, completed: true } : lesson
      )
    );
  };

  const handleMarkCurrentLessonComplete = () => {
    const current = lessons[currentLessonIndex];
    if (current && !current.completed) handleLessonComplete(current.id);
  };

  const completedLessons = lessons.filter((lesson) => lesson.completed).length;
  const isCourseCompleted = completedLessons === lessons.length && lessons.length > 0;
  const currentLesson = lessons[currentLessonIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Typography variant="h5" gutterBottom color="black">
          Course Learning
        </Typography>

        <Box sx={{ width: "100%", mb: 4 }}>
          <Typography variant="body2" color="text.secondary">
            {completedLessons} of {lessons.length} lessons completed
          </Typography>
          <LinearProgress
            variant="determinate"
            value={(completedLessons / lessons.length) * 100}
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

        {currentLesson && !currentLesson.completed && (
          <div className="mb-6">
            <Button
              onClick={handleMarkCurrentLessonComplete}
              variant="contained"
              color="success"
              startIcon={<CheckCircle />}
              sx={{ bgcolor: "#059669", "&:hover": { bgcolor: "#047857" } }}
            >
              Mark Lesson as Complete
            </Button>
          </div>
        )}

        <VideoPlayer
          chapters={chapters}
          lessons={lessons}
          currentLessonIndex={currentLessonIndex}
          onLessonChange={setCurrentLessonIndex}
          onLessonComplete={handleLessonComplete}
        />

        {user && (
          <Typography variant="caption" color="textSecondary" mt={4}>
            Logged in as: {user.name} ({user.email})
          </Typography>
        )}
      </div>
    </div>
  );
};

export default CourseLearning;

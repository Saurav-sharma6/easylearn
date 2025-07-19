import { useEffect, useRef } from "react";
import { CheckCircle } from "lucide-react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

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

interface VideoPlayerProps {
  chapters: Chapter[];
  lessons: Lesson[];
  currentLessonIndex: number;
  onLessonChange: (index: number) => void;
  onLessonComplete: (lessonId: string) => void;
  autoPlay: boolean;
  onTimeUpdate: (event: React.SyntheticEvent<HTMLVideoElement>) => void;
  onEnded: () => void;
  videoRef: React.MutableRefObject<HTMLVideoElement | null>;
  progressRef: React.MutableRefObject<{ [lessonId: string]: number }>;
}

const VideoPlayer = ({
  chapters,
  lessons,
  currentLessonIndex,
  onLessonChange,
  onLessonComplete,
  autoPlay,
  onTimeUpdate,
  onEnded,
  videoRef,
  progressRef,
}: VideoPlayerProps) => {
  const currentLesson = lessons[currentLessonIndex];
  const videoSrcRef = useRef<string | null>(null);

  // Log lessons for debugging
  console.log('VideoPlayer lessons:', lessons.map((l) => ({ id: l.id, title: l.title, completed: l.completed })));
  console.log('Rendering VideoPlayer with currentLessonIndex:', currentLessonIndex, 'currentLesson:', currentLesson?.title);

  useEffect(() => {
    if (videoRef.current && currentLesson?.videoUrl && videoSrcRef.current !== currentLesson.videoUrl) {
      console.log('Updating video source:', currentLesson.videoUrl);
      videoSrcRef.current = currentLesson.videoUrl;
      videoRef.current.src = currentLesson.videoUrl;
      videoRef.current.load();
      const savedProgress = progressRef.current[currentLesson.id] || 0;
      console.log('Setting video currentTime to:', savedProgress, 'for lesson:', currentLesson.id);
      videoRef.current.currentTime = savedProgress;
      if (autoPlay) {
        videoRef.current.play().catch((err) => console.error('Video play failed:', err));
      }
    }
  }, [currentLesson, videoRef, autoPlay, progressRef]);

  return (
    <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 4 }}>
      {/* Video Player */}
      <Box sx={{ flex: 2 }}>
        {currentLesson ? (
          <>
            <Typography variant="h6" sx={{ color: "#1a202c", mb: 2 }}>
              {currentLesson.title}
            </Typography>
            <video
              ref={videoRef}
              controls
              autoPlay={autoPlay}
              onTimeUpdate={onTimeUpdate}
              onEnded={onEnded}
              style={{ width: "100%", maxHeight: "500px", backgroundColor: "#000" }}
            >
              <source src={currentLesson.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </>
        ) : (
          <Typography variant="body1" sx={{ color: "#c53030" }}>
            No lesson selected
          </Typography>
        )}
      </Box>

      {/* Course Content */}
      <Box sx={{ flex: 1, maxHeight: "500px", overflowY: "auto" }}>
        <Typography variant="h6" sx={{ color: "#1a202c", mb: 2 }}>
          Course Content
        </Typography>
        {chapters.map((chapter) => (
          <Box key={chapter.id} sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ color: "#1a202c", fontWeight: "bold" }}>
              {chapter.title}
            </Typography>
            {chapter.lessons.map((chapterLesson, index) => {
              const globalIndex = lessons.findIndex((l) => l.id === chapterLesson.id);
              const lesson = lessons[globalIndex]; // Use lessons prop for completed status
              console.log('Rendering lesson:', lesson.id, 'title:', lesson.title, 'completed:', lesson.completed, 'color:', lesson.completed ? '#059669' : '#d1d5db');
              return (
                <Box
                  key={`${chapter.id}-${lesson.id}-${lesson.completed}`}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    p: 1,
                    bgcolor: globalIndex === currentLessonIndex ? "#e6fffa" : "transparent",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "#f1f5f9" },
                  }}
                  onClick={() => {
                    console.log('Selecting lesson:', lesson.id, 'index:', globalIndex, 'progress:', progressRef.current[lesson.id] || 0);
                    onLessonChange(globalIndex);
                  }}
                >
                  <CheckCircle
                    size={20}
                    color={lesson.completed ? "#059669" : "#d1d5db"}
                    style={{ marginRight: "8px", stroke: lesson.completed ? "#059669" : "#d1d5db" }}
                    className="check-circle"
                  />
                  <Typography variant="body2" sx={{ color: "#4a5568" }}>
                    {lesson.title} ({lesson.duration} min)
                  </Typography>
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default VideoPlayer;
import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Slider,
  IconButton,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import SkipPreviousIcon from "@mui/icons-material/SkipPrevious";
import SkipNextIcon from "@mui/icons-material/SkipNext";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

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

interface VideoPlayerProps {
  chapters: Chapter[];
  lessons: Lesson[];
  currentLessonIndex: number;
  onLessonChange: (index: number) => void;
  onLessonComplete: (lessonId: string) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  chapters,
  lessons,
  currentLessonIndex,
  onLessonChange,
  onLessonComplete,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentLesson = lessons[currentLessonIndex];

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentLesson) return;

    const updateProgress = () => {
      const progress = (video.currentTime / video.duration) * 100;
      setProgress(progress);

      if (progress > 90 && !currentLesson.completed) {
        onLessonComplete(currentLesson.id);
      }
    };

    video.addEventListener("timeupdate", updateProgress);
    return () => video.removeEventListener("timeupdate", updateProgress);
  }, [currentLesson, onLessonComplete]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch((err) => console.error("Playback failed:", err));
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressChange = (_event: any, newValue: number | number[]) => {
    const newTime =
      ((Array.isArray(newValue) ? newValue[0] : newValue) *
        (videoRef.current?.duration || 0)) /
      100;
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
      setProgress(newValue as number);
    }
  };

  const nextLesson = () => {
    if (currentLessonIndex < lessons.length - 1) {
      onLessonChange(currentLessonIndex + 1);
    }
  };

  const previousLesson = () => {
    if (currentLessonIndex > 0) {
      onLessonChange(currentLessonIndex - 1);
    }
  };

  const enterFullScreen = () => {
    const videoContainer = document.querySelector(".video-container");
    if (videoContainer && videoContainer.requestFullscreen) {
      videoContainer.requestFullscreen();
    }
  };

  if (!lessons.length || !currentLesson) {
    return (
      <Card className="p-4 text-center">
        <Typography variant="body2" color="textSecondary">
          No lessons available to play.
        </Typography>
      </Card>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4">
      {/* Video Player */}
      <div className="flex-1">
        <Card>
          <CardContent className="p-0">
            <div className="video-container relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                src={currentLesson.videoUrl}
                poster="/placeholder.svg"
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="w-full aspect-video"
              />

              {/* Controls Overlay */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  bgcolor: "rgba(0,0,0,0.7)",
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <Slider
                  size="small"
                  value={progress}
                  onChange={handleProgressChange}
                  aria-labelledby="video-progress"
                  sx={{ color: "#14b8a6" }}
                />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton
                      onClick={previousLesson}
                      disabled={currentLessonIndex === 0}
                    >
                      <SkipPreviousIcon />
                    </IconButton>
                    <IconButton onClick={togglePlay}>
                      {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                    </IconButton>
                    <IconButton
                      onClick={nextLesson}
                      disabled={currentLessonIndex === lessons.length - 1}
                    >
                      <SkipNextIcon />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <VolumeUpIcon />
                    <Slider
                      size="small"
                      min={0}
                      max={1}
                      step={0.1}
                      value={volume}
                      onChange={(e, v) => {
                        setVolume(v as number);
                        if (videoRef.current)
                          videoRef.current.volume = v as number;
                      }}
                      sx={{ width: 80, color: "#14b8a6" }}
                    />
                    <IconButton onClick={enterFullScreen}>
                      <FullscreenIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </div>

            <Box sx={{ p: 2 }}>
              <Typography variant="h6">{currentLesson.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                Lesson {currentLessonIndex + 1} of {lessons.length}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </div>

      {/* Accordion Sidebar */}
      {/* Accordion Sidebar */}
      <div className="lg:w-80">
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Course Content
            </Typography>

            {chapters.map((chapter, chapterIndex) => (
              <Accordion key={chapter.id} defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {`${chapterIndex + 1}. ${chapter.title}`}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <ul className="space-y-2">
                    {chapter.lessons.map((lesson) => {
                      const index = lessons.findIndex(
                        (l) => l.id === lesson.id
                      );
                      return (
                        <li
                          key={lesson.id}
                          onClick={() => onLessonChange(index)}
                          className={`
                      p-3 rounded-lg cursor-pointer transition-colors
                      ${
                        index === currentLessonIndex
                          ? "bg-blue-100"
                          : "hover:bg-gray-100"
                      }
                    `}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="text-sm font-medium">
                                {lesson.title}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {lesson.duration} min
                              </p>
                            </div>
                            {lesson.completed && (
                              <CheckCircleOutlineIcon
                                fontSize="small"
                                color="success"
                              />
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </AccordionDetails>
              </Accordion>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VideoPlayer;

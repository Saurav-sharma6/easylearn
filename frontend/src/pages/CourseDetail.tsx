import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/layout/Header';
// MUI Components
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

// MUI Icons
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// Types
interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  price: number;
  originalPrice?: number | null;
  rating: number;
  students: number;
  duration: string;
  image: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

const CourseDetail = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  // Simulate fetching course data
  useEffect(() => {
    const mockCourse: Course = {
      id: courseId || '1',
      title: 'Complete React Developer Course',
      description:
        'Master React from scratch and build professional web applications.',
      instructor: 'John Doe',
      price: 89.99,
      originalPrice: 149.99,
      rating: 4.8,
      students: 15420,
      duration: '40 hours',
      image: '/placeholder.svg',
      category: 'Web Development',
      level: 'Intermediate',
    };

    setTimeout(() => {
      setCourse(mockCourse);
      setIsEnrolled(false);
      setLoading(false);
    }, 500);
  }, [courseId]);

  const handleEnroll = () => {
    if (course?.price === 0) {
      setIsEnrolled(true);
    } else {
      window.open('/payment', '_blank');
    }
  };

  const curriculum = [
    {
      title: 'Introduction to React',
      duration: '2 hours',
      lessons: ['What is React?', 'Setting up environment', 'First component', 'Understanding JSX'],
    },
    {
      title: 'Components and Props',
      duration: '3 hours',
      lessons: ['Functional components', 'Props', 'Conditional rendering'],
    },
    {
      title: 'State and Events',
      duration: '4 hours',
      lessons: ['useState hook', 'useEffect hook', 'Forms', 'Events'],
    },
  ];

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

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Typography color="error">Course not found</Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section className="bg-gray-900 text-white py-12">
        <Container maxWidth="lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="text-sm text-gray-300 mb-4">
              <Link to="/" className="hover:text-white">Home</Link>
              <span className="mx-2">/</span>
              <span>{course.category}</span>
            </nav>

            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-2/3">
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {course.title}
                </Typography>
                <Typography variant="body1" color="textSecondary" paragraph>
                  {course.description}
                </Typography>

                <div className="flex flex-wrap gap-6 text-sm mb-6">
                  <div className="flex items-center">
                    <StarIcon fontSize="small" sx={{ color: '#fbbf24', mr: 0.5 }} />
                    <Typography variant="body2" fontWeight="bold" sx={{ mr: 1 }}>
                      {course.rating}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      ({course.students} students)
                    </Typography>
                  </div>
                  <div className="flex items-center">
                    <AccessTimeIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">{course.duration}</Typography>
                  </div>
                  <div className="flex items-center">
                    <GroupIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                    <Typography variant="body2">Instructor: {course.instructor}</Typography>
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
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                      <PlayCircleFilledIcon fontSize="large" sx={{ color: '#fff' }} />
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="text-center mb-6">
                      <Typography variant="h5" fontWeight="bold" color="textPrimary">
                        {course.price === 0 ? 'Free' : `$${course.price}`}
                      </Typography>
                      {course.originalPrice && course.price > 0 && (
                        <Typography
                          color="textSecondary"
                          sx={{ textDecoration: 'line-through' }}
                        >
                          ${course.originalPrice}
                        </Typography>
                      )}
                    </div>

                    {course.price === 0 ? (
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={handleEnroll}
                        sx={{
                          mb: 2,
                          bgcolor: '#2563eb',
                          '&:hover': { bgcolor: '#1d4ed8' },
                          textTransform: 'none'
                        }}
                      >
                        Enroll for Free
                      </Button>
                    ) : (
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={handleEnroll}
                        sx={{
                          mb: 2,
                          bgcolor: '#10B981',
                          '&:hover': { bgcolor: '#059669' },
                          textTransform: 'none'
                        }}
                      >
                        Buy Now
                      </Button>
                    )}

                    <Typography variant="caption" align="center" color="textSecondary">
                      Sign in to enroll in this course
                    </Typography>

                    <Box mt={3} className="space-y-3 text-sm">
                      <div className="flex items-center">
                        <MenuBookIcon fontSize="small" color="action" sx={{ mr: 1 }} />
                        <span>Lifetime access</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircleOutlineIcon fontSize="small" color="success" sx={{ mr: 1 }} />
                        <span>Certificate of completion</span>
                      </div>
                      <div className="flex items-center">
                        <GroupIcon fontSize="small" color="action" sx={{ mr: 1 }} />
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
                  {[
                    'Build modern React apps from scratch',
                    'Master hooks & state management',
                    'Create reusable components',
                    'Handle routing with React Router',
                    'Connect to APIs',
                    'Deploy applications',
                    'Test React apps',
                    'Optimize performance'
                  ].map((item, index) => (
                    <div key={index} className="flex items-start">
                      <CheckCircleOutlineIcon
                        fontSize="small"
                        color="success"
                        sx={{ mr: 1, mt: 0.5 }}
                      />
                      <Typography variant="body2">{item}</Typography>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Curriculum */}
              <Card className="bg-white p-6 rounded-lg">
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Course Content
                </Typography>
                <div className="space-y-4">
                  {curriculum.map((section, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <div className="p-4 bg-gray-50 border-b">
                        <div className="flex justify-between items-center">
                          <Typography fontWeight="medium">{section.title}</Typography>
                          <Typography variant="caption" color="textSecondary">
                            {section.duration}
                          </Typography>
                        </div>
                      </div>
                      <div className="p-4 space-y-2">
                        {section.lessons.map((lesson, lessonIndex) => (
                          <div key={lessonIndex} className="flex items-center">
                            <PlayCircleFilledIcon
                              fontSize="small"
                              color="disabled"
                              sx={{ mr: 1 }}
                            />
                            <Typography variant="body2">{lesson}</Typography>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right Sidebar - Instructor Info */}
            <div className="lg:col-span-1">
              <Card className="bg-white p-6 rounded-lg">
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  About the Instructor
                </Typography>

                <Box display="flex" alignItems="center" mb={2}>
                  <div className="w-16 h-16 bg-gray-300 rounded-full mr-4"></div>
                  <div>
                    <Typography fontWeight="bold">{course.instructor}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Senior Developer
                    </Typography>
                  </div>
                </Box>

                <Typography variant="body2" color="textSecondary" paragraph>
                  John is a senior full-stack developer with over 8 years of experience.
                  He has taught over 100,000 students worldwide.
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
                    <span>4.9 ⭐</span>
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
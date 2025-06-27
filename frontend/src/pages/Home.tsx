import React, { useState, useEffect } from 'react';

// Material UI Components
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

// Icons
import BookOpenIcon from '@mui/icons-material/MenuBook';
import UsersIcon from '@mui/icons-material/Group';
import AwardIcon from '@mui/icons-material/EmojiEvents';
import PlayIcon from '@mui/icons-material/PlayCircleFilled';

const Home = () => {
  
  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Learn Without Limits</h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Start, switch, or advance your career with thousands of courses from world-class instructors
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
              <TextField
                fullWidth
                variant="outlined"
                placeholder="What do you want to learn?"
                sx={{
                  input: { color: '#111827', backgroundColor: '#fff' },
                  backgroundColor: '#fff',
                  borderRadius: 1,
                }}
              />
              <Button
                variant="contained"
                color="primary"
                size="large"
                sx={{ bgcolor: '#f97316', '&:hover': { bgcolor: '#ea580c' } }}
              >
                Search Courses
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="flex flex-col items-center">
              <BookOpenIcon fontSize="large" className="text-blue-600 mb-4" />
              <div className="text-3xl font-bold text-gray-900">57,000+</div>
              <div className="text-gray-600">Online Courses</div>
            </div>
            <div className="flex flex-col items-center">
              <UsersIcon fontSize="large" className="text-blue-600 mb-4" />
              <div className="text-3xl font-bold text-gray-900">1M+</div>
              <div className="text-gray-600">Students</div>
            </div>
            <div className="flex flex-col items-center">
              <AwardIcon fontSize="large" className="text-blue-600 mb-4" />
              <div className="text-3xl font-bold text-gray-900">15,000+</div>
              <div className="text-gray-600">Expert Instructors</div>
            </div>
            <div className="flex flex-col items-center">
              <PlayIcon fontSize="large" className="text-blue-600 mb-4" />
              <div className="text-3xl font-bold text-gray-900">400+</div>
              <div className="text-gray-600">Hours of Content</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Courses</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Discover our most popular courses, carefully selected by our expert instructors
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))} */}
          </div>
        </div>
      </section>

      {/* All Courses */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Popular Courses</h2>
            <Button variant="outlined" color="primary">
              View All Courses
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))} */}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join millions of students and start your learning journey today. Choose from thousands of courses.
          </p>
          <Button
            variant="contained"
            size="large"
            color="primary"
            sx={{ bgcolor: '#2563eb', '&:hover': { bgcolor: '#1d4ed8' } }}
          >
            Get Started Now
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Home;
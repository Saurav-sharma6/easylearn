import React, { useState, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Course interface
interface Course {
  _id: string;
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

const InstructorDashboard = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    category: '',
    level: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced',
    image: '/placeholder.svg',
    duration: '0 hours',
  });

  const instructorName = "Jane Doe";

  // Load courses from backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        const data = await response.json();
        setCourses(data.courses || []);
      } catch (err) {
        console.error('Failed to load courses:', err);
      }
    };
    fetchCourses();
  }, []);

  // Submit form to add or update course
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingCourse
      ? `/api/courses/${editingCourse._id}`
      : '/api/courses';
    const method = editingCourse ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          instructor: instructorName
        })
      });

      if (!response.ok) throw new Error('Failed to save course');

      const savedCourse = await response.json();

      if (editingCourse) {
        setCourses(courses.map(c => c._id === editingCourse._id ? savedCourse.course : c));
        setEditingCourse(null);
      } else {
        setCourses([...courses, savedCourse.course]);
      }

      // Reset form
      setFormData({
        title: '',
        description: '',
        price: 0,
        category: '',
        level: 'Beginner',
        image: '/placeholder.svg',
        duration: '0 hours'
      });
      setShowCreateForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (course: Course) => {
    setFormData({
      title: course.title,
      description: course.description,
      price: course.price,
      category: course.category,
      level: course.level,
      image: course.image,
      duration: course.duration
    });
    setEditingCourse(course);
    setShowCreateForm(true);
  };

  const handleDelete = async (courseId: string) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;

    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete course');

      setCourses(courses.filter(c => c._id !== courseId));
    } catch (err) {
      console.error('Error deleting course:', err);
    }
  };

  const totalEarnings = courses.reduce((sum, course) => sum + (course.price * course.students), 0);
  const totalStudents = courses.reduce((sum, course) => sum + course.students, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <AppBar position="static" color="primary" elevation={0}>
        <Toolbar className="flex justify-between">
          <Typography variant="h6" fontWeight="bold" color="inherit">
            Instructor Dashboard
          </Typography>
          <Button
            variant="contained"
            onClick={() => setShowCreateForm(true)}
            sx={{
              bgcolor: '#4f46e5',
              '&:hover': { bgcolor: '#3730a3' },
              borderRadius: '8px',
              fontWeight: 600
            }}
          >
            Create New Course
          </Button>
        </Toolbar>
      </AppBar>

      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <Typography color="textSecondary">Total Earnings</Typography>
            <Typography variant="h5" fontWeight="bold" color="success.main">
              ${totalEarnings.toLocaleString()}
            </Typography>
          </Card>
          <Card className="p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow">
            <Typography color="textSecondary">Total Students</Typography>
            <Typography variant="h5" fontWeight="bold" color="info.main">
              {totalStudents.toLocaleString()}
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
              {editingCourse ? 'Edit Course' : 'Create New Course'}
            </Typography>
            <form onSubmit={handleSubmit} className="space-y-5">
              <TextField
                fullWidth
                label="Course Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                margin="normal"
                required
                InputLabelProps={{ shrink: true }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
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
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <TextField
                  type="number"
                  label="Price ($)"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  margin="normal"
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
                <TextField
                  label="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  margin="normal"
                  required
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                />
                <TextField
                  select
                  label="Level"
                  value={formData.level}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      level: e.target.value as 'Beginner' | 'Intermediate' | 'Advanced'
                    })
                  }
                  margin="normal"
                  fullWidth
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                >
                  <MenuItem value="Beginner">Beginner</MenuItem>
                  <MenuItem value="Intermediate">Intermediate</MenuItem>
                  <MenuItem value="Advanced">Advanced</MenuItem>
                </TextField>
              </div>
              <div className="flex gap-4 mt-4">
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    bgcolor: '#4f46e5',
                    '&:hover': { bgcolor: '#3730a3' },
                    borderRadius: '8px',
                    fontWeight: 600
                  }}
                >
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingCourse(null);
                    setFormData({
                      title: '',
                      description: '',
                      price: 0,
                      category: '',
                      level: 'Beginner',
                      image: '/placeholder.svg',
                      duration: '0 hours'
                    });
                  }}
                  sx={{
                    borderRadius: '8px',
                    fontWeight: 600,
                    borderColor: '#d1d5db',
                    color: '#4b5563',
                    '&:hover': { borderColor: '#9ca3af', bgcolor: '#f3f4f6' }
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Courses List */}
        <div>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            My Courses
          </Typography>
          <div className="space-y-6">
            {courses.length > 0 ? (
              courses.map((course) => (
                <Card key={course._id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  <CardContent>
                    <div className="flex flex-col md:flex-row md:justify-between">
                      <div className="md:w-4/5">
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          {course.title}
                        </Typography>
                        <Typography color="textSecondary" paragraph>
                          {course.description}
                        </Typography>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span>{course.students} students</span>
                          <span>${course.price}</span>
                          <span>{course.rating} ⭐</span>
                          <span>{course.category}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 md:mt-0">
                        <Button
                          size="small"
                          onClick={() => handleEdit(course)}
                          startIcon={<EditIcon />}
                          sx={{
                            borderRadius: '6px',
                            textTransform: 'none',
                            bgcolor: '#bfdbfe',
                            color: '#1e40af',
                            '&:hover': { bgcolor: '#93c5fd' }
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
                            borderRadius: '6px',
                            textTransform: 'none',
                            bgcolor: '#fee2e2',
                            color: '#be123c',
                            '&:hover': { bgcolor: '#fecaca' }
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
              <Typography color="textSecondary" className="text-center py-6 bg-white rounded-xl shadow-sm">
                No courses found. Start by creating one.
              </Typography>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard;
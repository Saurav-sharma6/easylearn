import React, { useEffect, useState } from 'react';
import axiosInstance from '../../helpers/axiosInstance';
import AdminSidebar from '../../components/admin/AdminSidebar';
import DashboardMetrics from '../../components/admin/DashboardMetrics';
import UserManagement from '../../components/admin/UserManagement';
import CourseManagement from '../../components/admin/CourseManagement';
import { CircularProgress } from '@mui/material';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
  });
  const [courses, setCourses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      console.time(`FetchData_${activeTab}`); // Debug: measure fetch time
      setLoading(true);
      try {
        if (activeTab === 'Dashboard') {
          console.log('Fetching dashboard data...');
          const [usersResponse, coursesResponse] = await Promise.all([
            axiosInstance.get('/api/users/count'),
            axiosInstance.get('/api/courses/count'),
          ]);
          console.log('Users count response:', usersResponse.data);
          console.log('Courses count response:', coursesResponse.data);
          const totalUsers = usersResponse.data.totalUsers || 0;
          const totalCourses = coursesResponse.data.totalCourses || 0;
          const staticAnalytics = {
            totalUsers,
            totalCourses,
            totalRevenue: 5000.50, // Keep static for now
            monthlyGrowth: 25,     // Keep static for now
          };
          setAnalytics(staticAnalytics);

          const coursesInfo = await axiosInstance.get('/api/courses/list');
          console.log('Courses list response:', coursesInfo.data);
          const coursesData = Array.isArray(coursesInfo.data) ? coursesInfo.data : coursesInfo.data.courses || [];
          console.log(coursesData, "=========")
          setCourses(coursesData);
        } else if (activeTab === 'User Management') {
          console.log('Fetching users from:', '/api/users');
          const usersResponse = await axiosInstance.get('/api/users', {
            params: { sort: 'name', limit: 5, page: 1 },
          });
          console.log('Users response:', usersResponse.data);
          const usersData = Array.isArray(usersResponse.data) ? usersResponse.data : usersResponse.data.users || [];
          if (usersData.length === 0) {
            console.log('No users found in response');
          }
          setUsers(usersData);
        } else if (activeTab === 'Course Management') {
          console.log('Fetching courses from:', '/api/courses/list');
          const coursesResponse = await axiosInstance.get('/api/courses/list', {
            params: { sort: 'title', limit: 5, page: 1 },
          });
          console.log('Courses response:', coursesResponse.data);
          const coursesData = Array.isArray(coursesResponse.data) ? coursesResponse.data : coursesResponse.data.courses || [];
          setCourses(coursesData);
        }
      } catch (err) {
        const errorMessage = err.response?.status === 403
          ? 'Access denied. Admin privileges required.'
          : err.response?.status === 404
          ? `Resource not found. Check API endpoint: ${err.config?.url}`
          : err.message || 'Failed to fetch data';
        setError(errorMessage);
        console.error('Dashboard error:', err, 'URL:', err.config?.url);
      } finally {
        setLoading(false);
        console.timeEnd(`FetchData_${activeTab}`); // Debug: log fetch time
      }
    };

    fetchData();
  }, [activeTab]);

  const handleDeleteUser = async (userId) => {
    try {
      await axiosInstance.delete(`/api/users/${userId}`);
      const usersResponse = await axiosInstance.get('/api/users', {
        params: { sort: 'name', limit: 5, page: 1 },
      });
      setUsers(usersResponse.data.users || []);
      const usersCountResponse = await axiosInstance.get('/api/users/count');
      setAnalytics((prev) => ({ ...prev, totalUsers: usersCountResponse.data.totalUsers || 0 }));
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeleteCourse = async (courseId) => {
    try {
      await axiosInstance.delete(`/api/courses/${courseId}`);
      const coursesResponse = await axiosInstance.get('/api/courses/list', {
        params: { sort: 'title', limit: 5, page: 1 },
      });
      setCourses(coursesResponse.data.courses || []);
      const coursesCountResponse = await axiosInstance.get('/api/courses/count');
      setAnalytics((prev) => ({ ...prev, totalCourses: coursesCountResponse.data.totalCourses || 0 }));
    } catch (err) {
      console.error('Error deleting course:', err);
      setError(err.response?.data?.message || 'Failed to delete course');
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 justify-center items-center">
        <CircularProgress size={40} sx={{ color: '#4f46e5' }} />
        <span className="ml-4 text-black text-lg">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50 justify-center items-center">
        <div className="text-center text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 p-6 overflow-auto">
        {activeTab === 'Dashboard' && <DashboardMetrics analytics={analytics} courses={courses} />}
        {activeTab === 'User Management' && (
          <UserManagement users={users} onDeleteUser={handleDeleteUser} />
        )}
        {activeTab === 'Course Management' && (
          <CourseManagement courses={courses} onDeleteCourse={handleDeleteCourse} />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
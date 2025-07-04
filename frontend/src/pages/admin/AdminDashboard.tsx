import React, { useEffect, useState } from 'react';
import axiosInstance from '../../helpers/axiosInstance';
import AdminSidebar from '../../components/admin/AdminSidebar';
import DashboardMetrics from '../../components/admin/DashboardMetrics';
import UserManagement from '../../components/admin/UserManagement';
import CourseManagement from '../../components/admin/CourseManagement';

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
      setLoading(true);
      try {
        if (activeTab === 'Dashboard') {
          const [usersResponse, coursesResponse] = await Promise.all([
            axiosInstance.get('/api/users/count'),
            axiosInstance.get('/api/courses/count'),
          ]);
          const totalUsers = usersResponse.data.totalUsers || 0;
          const totalCourses = coursesResponse.data.totalCourses || 0;
          const staticAnalytics = {
            totalUsers,
            totalCourses,
            totalRevenue: 5000.50, // Keep static for now
            monthlyGrowth: 25,     // Keep static for now
          };
          console.log('Fetched analytics:', staticAnalytics);
          setAnalytics(staticAnalytics);

          console.log('Fetching courses from:', '/api/courses/');
          const coursesInfo = await axiosInstance.get('/api/courses/');
          console.log('Raw Courses response:', coursesInfo.data);
          const coursesData = Array.isArray(coursesInfo.data) ? coursesInfo.data : coursesInfo.data.courses || [];
          setCourses(coursesData);
        } else if (activeTab === 'User Management') {
          console.log('Fetching users from:', '/api/users/');
          const usersResponse = await axiosInstance.get('/api/users/');
          console.log('Raw Users response (full):', usersResponse);
          if (usersResponse.data && typeof usersResponse.data === 'object') {
            const usersData = Array.isArray(usersResponse.data) ? usersResponse.data : usersResponse.data.users || [];
            if (usersData.length === 0) {
              console.log('No users found in response');
            }
            setUsers(usersData);
          } else {
            console.error('Unexpected users response format:', usersResponse.data);
            setUsers([]);
          }
        } else if (activeTab === 'Course Management') {
          console.log('Fetching courses from:', '/api/courses/');
          const coursesResponse = await axiosInstance.get('/api/courses/');
          console.log('Raw Courses response:', coursesResponse.data);
          const coursesData = Array.isArray(coursesResponse.data) ? coursesResponse.data : coursesResponse.data.courses || [];
          setCourses(coursesData);
        }
      } catch (err) {
        if (err.response?.status === 403) {
          setError('Access denied. Admin privileges required. Check token.');
        } else if (err.response?.status === 404) {
          setError('Resource not found. Check API endpoints. (e.g., /api/users/)');
          console.error('404 Error Details:', err.response);
        } else {
          setError(err.message || 'Failed to fetch data');
          console.error('Dashboard error:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  // Handle user deletion
  const handleDeleteUser = async (userId) => {
  try {
    await axiosInstance.delete(`/api/users/${userId}`);
    const usersResponse = await axiosInstance.get('/api/users', {
      params: { sort: 'name', limit: 5, page: 1 }, // Reset to first page
    });
    setUsers(usersResponse.data.users || []);
    const usersCountResponse = await axiosInstance.get('/api/users/count');
    setAnalytics((prev) => ({ ...prev, totalUsers: usersCountResponse.data.totalUsers || 0 }));
  } catch (err) {
    console.error('Error deleting user:', err);
    setError('Failed to delete user');
  }
};
// Handle course deletion
const handleDeleteCourse = async (courseId) => {
  try {
    await axiosInstance.delete(`/api/courses/${courseId}`);
    const coursesResponse = await axiosInstance.get('/api/courses', {
      params: { sort: 'title', limit: 5, page: 1 }, // Reset to first page
    });
    setCourses(coursesResponse.data.courses || []);
    const coursesCountResponse = await axiosInstance.get('/api/courses/count');
    setAnalytics((prev) => ({ ...prev, totalCourses: coursesCountResponse.data.totalCourses || 0 }));
  } catch (err) {
    console.error('Error deleting course:', err);
    setError('Failed to delete course');
  }
};

  if (loading) return <div className="text-center p-6 text-black">Loading...</div>;
  if (error) return <div className="text-center p-6 text-black text-red-500">{error}</div>;

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
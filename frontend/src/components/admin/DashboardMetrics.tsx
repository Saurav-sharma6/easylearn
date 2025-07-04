// src/admin/components/DashboardTab.tsx
import React from 'react';
import { FaUsers, FaBook, FaDollarSign, FaChartLine } from 'react-icons/fa';

const DashboardTab = ({ analytics, courses }) => {
  return (
    <>
      <h1 className="text-3xl font-bold mb-6 text-black">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white p-4 shadow rounded-lg">
          <div className="flex items-center mb-2">
            <FaUsers className="text-2xl text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-black">Total Users</h2>
          </div>
          <p className="text-2xl text-black">{analytics.totalUsers}</p>
        </div>
        <div className="bg-white p-4 shadow rounded-lg">
          <div className="flex items-center mb-2">
            <FaBook className="text-2xl text-green-600 mr-2" />
            <h2 className="text-xl font-semibold text-black">Total Courses</h2>
          </div>
          <p className="text-2xl text-black">{analytics.totalCourses}</p>
        </div>
        <div className="bg-white p-4 shadow rounded-lg">
          <div className="flex items-center mb-2">
            <FaDollarSign className="text-2xl text-yellow-600 mr-2" />
            <h2 className="text-xl font-semibold text-black">Total Revenue</h2>
          </div>
          <p className="text-2xl text-black">${analytics.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 shadow rounded-lg">
          <div className="flex items-center mb-2">
            <FaChartLine className="text-2xl text-purple-600 mr-2" />
            <h2 className="text-xl font-semibold text-black">Monthly Growth</h2>
          </div>
          <p className="text-2xl text-black">{analytics.monthlyGrowth}%</p>
        </div>
      </div>
      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-4 text-black">Course Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(courses) ? (
            courses.map((course) => (
              <div key={course._id} className="bg-white p-4 shadow rounded-lg">
                <h3 className="text-xl font-semibold text-black">{course.title}</h3>
                <p className="text-gray-600 text-black">Price: ${course.price || 0}</p>
                <p className="text-gray-600 text-black">Original Price: ${course.originalPrice || course.price || 0}</p>
                <p className="text-gray-600 text-black">Instructor: {course.instructorId?.name || 'Unknown'}</p>
              </div>
            ))
          ) : (
            <div className="text-red-500 text-black">Courses data is not an array: {JSON.stringify(courses)}</div>
          )}
        </div>
      </div>
    </>
  );
};

export default DashboardTab;
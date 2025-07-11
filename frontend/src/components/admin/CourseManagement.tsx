// src/components/admin/CourseManagement.tsx
import React, { useState, useEffect } from 'react';
import { FaTrash, FaEdit, FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import axiosInstance from '../../helpers/axiosInstance';

const CourseManagement = ({ onDeleteCourse }) => {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState(''); // Default to no sort
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/api/courses/list/', {
          params: { search, sort: sort || undefined, limit, page },
        });
        setCourses(response.data.courses || []);
        setTotal(response.data.total || 0);
      } catch (err) {
        setError(err.message || 'Failed to fetch courses');
        console.error('Course fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [search, sort, page, limit]);

  const handleSort = (field) => {
    setSort(prev => {
      if (prev === field) return `-${field}`; // Toggle to descending
      if (prev === `-${field}`) return '';    // Reset to no sort
      return field;                          // Set to ascending
    });
    setPage(1); // Reset to first page on sort
  };

  const handleDelete = async (courseId) => {
    try {
      await onDeleteCourse(courseId);
      const response = await axiosInstance.get('/api/courses/list/', {
        params: { search, sort, limit, page },
      });
      setCourses(response.data.courses || []);
      setTotal(response.data.total || 0);
    } catch (err) {
      setError('Failed to delete course');
      console.error('Delete error:', err);
    }
  };

  const totalPages = Math.ceil(total / limit);
  const paginate = (direction) => {
    if (direction === 'prev' && page > 1) setPage(prev => prev - 1);
    if (direction === 'next' && page < totalPages) setPage(prev => prev + 1);
  };

  if (loading) return <div className="text-center p-6 text-black">Loading...</div>;
  if (error) return <div className="text-center p-6 text-black text-red-500">{error}</div>;

  return (
    <>
      <h1 className="text-3xl font-bold mb-6 text-black">Course Management</h1>
      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by title..."
          className="p-2 border rounded text-black"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded-lg">
          <thead>
            <tr className="bg-gray-200 text-black">
              <th className="py-2 px-4 text-left cursor-pointer" onClick={() => handleSort('title')}>
                Title{' '}
                {sort === 'title' ? <FaArrowUp className="inline" /> : sort === '-title' ? <FaArrowDown className="inline" /> : <><FaArrowUp className="inline" /> <FaArrowDown className="inline" /></>}
              </th>
              <th className="py-2 px-4 text-left cursor-pointer" onClick={() => handleSort('price')}>
                Price{' '}
                {sort === 'price' ? <FaArrowUp className="inline" /> : sort === '-price' ? <FaArrowDown className="inline" /> : <><FaArrowUp className="inline" /> <FaArrowDown className="inline" /></>}
              </th>
              <th className="py-2 px-4 text-left cursor-pointer" onClick={() => handleSort('originalPrice')}>
                Original Price{' '}
                {sort === 'originalPrice' ? <FaArrowUp className="inline" /> : sort === '-originalPrice' ? <FaArrowDown className="inline" /> : <><FaArrowUp className="inline" /> <FaArrowDown className="inline" /></>}
              </th>
              <th className="py-2 px-4 text-left">Instructor</th>
              <th className="py-2 px-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course._id} className="border-t">
                <td className="py-2 px-4 text-black">{course.title}</td>
                <td className="py-2 px-4 text-black">${course.price || 0}</td>
                <td className="py-2 px-4 text-black">${course.originalPrice || course.price || 0}</td>
                <td className="py-2 px-4 text-black">{course.instructorId?.name || 'Unknown'}</td>
                <td className="py-2 px-4">
                  <button className="text-blue-500 mr-4">
                    <FaEdit className="mr-1" />
                  </button>
                  <button
                    onClick={() => handleDelete(course._id)}
                    className="text-red-500 mr-2"
                  >
                    <FaTrash className="mr-1" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-center items-center">
        <button
          onClick={() => paginate('prev')}
          disabled={page === 1}
          className="mx-1 px-3 py-1 rounded bg-gray-200 text-black disabled:opacity-50"
        >
          <FaArrowLeft />
        </button>
        <span className="mx-2 text-black">Page {page} of {totalPages}</span>
        <button
          onClick={() => paginate('next')}
          disabled={page === totalPages}
          className="mx-1 px-3 py-1 rounded bg-gray-200 text-black disabled:opacity-50"
        >
          <FaArrowRight />
        </button>
      </div>
    </>
  );
};

export default CourseManagement;
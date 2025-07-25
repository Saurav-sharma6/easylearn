import React, { useState, useEffect } from 'react';
import { FaTrash, FaEdit, FaArrowUp, FaArrowDown, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import axiosInstance from '../../helpers/axiosInstance';
import { Snackbar, Alert } from '@mui/material';
import UserForm from './UserForm';

const UserManagement = ({ onDeleteUser }) => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name');
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/api/users', {
          params: { search, sort: sort || undefined, limit, page },
        });
        setUsers(response.data.users || []);
        setTotal(response.data.total || 0);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch users');
        console.error('User fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [search, sort, page, limit]);

  const handleSort = (field) => {
    setSort((prev) => {
      if (prev === field) return `-${field}`;
      if (prev === `-${field}`) return '';
      return field;
    });
    setPage(1);
  };

  const handleEdit = async (user) => {
    try {
      console.log("ADMIN USER EDIT")
      const response = await axiosInstance.get(`/api/users/${user._id}`);
      const userData = response.data.user;
      
      console.log(userData)
      setEditingUser(userData);
      setSnackbar({ open: false, message: '', severity: 'success' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch user details');
      console.error('Fetch user error:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to fetch user details',
        severity: 'error',
      });
    }
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    setSnackbar({ open: false, message: '', severity: 'success' });

    try {
      const response = await axiosInstance.patch(`/api/users/${editingUser._id}`, formData);
      const updatedUser = response.data.user;
      setUsers((prev) =>
        prev.map((user) => (user._id === editingUser._id ? updatedUser : user))
      );
      setEditingUser(null);
      setSnackbar({
        open: true,
        message: 'User updated successfully!',
        severity: 'success',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user');
      console.error('Update error:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to update user',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await onDeleteUser(userId);
      const response = await axiosInstance.get('/api/users', {
        params: { search, sort, limit, page },
      });
      setUsers(response.data.users || []);
      setTotal(response.data.total || 0);
      setSnackbar({
        open: true,
        message: 'User deleted successfully!',
        severity: 'success',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
      console.error('Delete error:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to delete user',
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const totalPages = Math.ceil(total / limit);
  const paginate = (direction) => {
    if (direction === 'prev' && page > 1) setPage((prev) => prev - 1);
    if (direction === 'next' && page < totalPages) setPage((prev) => prev + 1);
  };

  if (loading) return <div className="text-center p-6 text-black">Loading...</div>;
  if (error) return <div className="text-center p-6 text-black text-red-500">{error}</div>;

  return (
    <>
      <h1 className="text-3xl font-bold mb-6 text-black">User Management</h1>
      
      {editingUser ? (
        <UserForm
          initialData={editingUser}
          onSubmit={handleSubmit}
          onCancel={() => {
            setEditingUser(null);
          }}
          isEditing={true}
          loading={loading}
          setLoading={setLoading}
          setSnackbar={setSnackbar}
        />
      ) : (
        <>
          <div className="mb-4">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email, or role..."
            className="p-2 border rounded text-black"
          />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow rounded-lg">
              <thead>
                <tr className="bg-gray-200 text-black">
                  <th className="py-2 px-4 text-left cursor-pointer" onClick={() => handleSort('name')}>
                    Name{' '}
                    {sort === 'name' ? <FaArrowUp className="inline" /> : sort === '-name' ? <FaArrowDown className="inline" /> : <><FaArrowUp className="inline" /> <FaArrowDown className="inline" /></>}
                  </th>
                  <th className="py-2 px-4 text-left cursor-pointer" onClick={() => handleSort('email')}>
                    Email{' '}
                    {sort === 'email' ? <FaArrowUp className="inline" /> : sort === '-email' ? <FaArrowDown className="inline" /> : <><FaArrowUp className="inline" /> <FaArrowDown className="inline" /></>}
                  </th>
                  <th className="py-2 px-4 text-left cursor-pointer" onClick={() => handleSort('role')}>
                    Role{' '}
                    {sort === 'role' ? <FaArrowUp className="inline" /> : sort === '-role' ? <FaArrowDown className="inline" /> : <><FaArrowUp className="inline" /> <FaArrowDown className="inline" /></>}
                  </th>
                  <th className="py-2 px-4 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-t">
                    <td className="py-2 px-4 text-black">{user.name}</td>
                    <td className="py-2 px-4 text-black">{user.email}</td>
                    <td className="py-2 px-4 text-black">{user.role}</td>
                    <td className="py-2 px-4">
                      <button onClick={() => handleEdit(user)} className="text-blue-500 mr-4">
                        <FaEdit className="mr-1" />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
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
      )}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default UserManagement;
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import MailIcon from '@mui/icons-material/Mail';
import axios from 'axios';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/users/forgot-password', { email });
      Swal.fire({
        icon: 'success',
        title: 'Reset Link Sent!',
        text: 'Check your inbox for the password reset link.',
        confirmButtonColor: '#3B82F6',
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: err.response?.data?.message || 'Could not send reset link. Please try again.',
        confirmButtonColor: '#3B82F6',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
            <Avatar sx={{ bgcolor: '#3B82F6' }}><MailIcon /></Avatar>
            <span className="text-2xl font-bold text-gray-900">EasyLearn</span>
          </Link>
          <Typography variant="h5" fontWeight="bold" color="textPrimary">Forgot Password?</Typography>
          <p className="mt-2 text-gray-600">Enter your email address to receive a password reset link.</p>
        </div>
        <Card elevation={3}>
          <CardHeader title="Reset Password" />
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <TextField
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  required
                  placeholder="Enter your email"
                  variant="outlined"
                  size="small"
                  sx={{ mt: 1 }}
                />
              </div>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                sx={{ textTransform: 'none', bgcolor: '#3B82F6', '&:hover': { bgcolor: '#2563EB' } }}
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </Button>
              <div className="text-center mt-4">
                <Link to="/login" className="flex items-center justify-center space-x-2 text-blue-600 hover:text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 19l-7-7 7-7" stroke="#3B82F6" strokeWidth="2" fill="none" strokeLinecap="round" />
                    <path d="M4 12h16" stroke="#3B82F6" strokeWidth="2" fill="none" />
                  </svg>
                  <span>Back to Login</span>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
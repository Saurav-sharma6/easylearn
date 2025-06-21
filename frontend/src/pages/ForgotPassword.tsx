import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import LockIcon from '@mui/icons-material/Lock';
import axios, { AxiosError } from 'axios';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [fieldTouched, setFieldTouched] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email: string): string => {
    if (!email.trim()) return 'Email address is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) return 'Please enter a valid email address';
    if (email.length > 100) return 'Email address is too long';
    return '';
  };

  const validateField = (value: string): boolean => {
    const error = validateEmail(value);
    setValidationError(error);
    return error === '';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (fieldTouched) validateField(value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setFieldTouched(true);
    validateField(value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if (!validateField(email)) {
      setLoading(false);
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/users/forgot-password', { email });
      Swal.fire({
        icon: 'success',
        title: 'Email Sent!',
        text: 'Check your inbox for the reset link.',
        confirmButtonColor: '#3B82F6',
      }).then(() => navigate('/login'));
    } catch (err) {
      const error = err as AxiosError;
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: error.response?.data?.message || 'Could not send reset email. Please try again.',
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
            <Avatar sx={{ bgcolor: '#3B82F6' }}><LockIcon /></Avatar>
            <span className="text-2xl font-bold text-gray-900">EasyLearn</span>
          </Link>
          <Typography variant="h5" fontWeight="bold" color="textPrimary">Forgot Password</Typography>
          <p className="mt-2 text-gray-600">Enter your email to reset your password.</p>
        </div>
        <Card elevation={3}>
          <CardHeader title="Reset Password Request" />
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                <TextField
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  required
                  placeholder="Enter your email"
                  variant="outlined"
                  size="small"
                  error={fieldTouched && !!validationError}
                  helperText={fieldTouched ? validationError : ""}
                  sx={{ mt: 1 }}
                />
              </div>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading || !!validationError}
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

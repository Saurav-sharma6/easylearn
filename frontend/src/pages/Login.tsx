import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

// MUI Components
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

// Axios Instance
import axiosInstance from '../helpers/axiosInstance';

// SweetAlert2
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

interface ValidationErrors {
  email?: string;
  password?: string;
}

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState({ email: false, password: false });

  const navigate = useNavigate();

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Validation functions
  const validateEmail = (email: string): string => {
    if (!email.trim()) {
      return 'Email is required';
    }
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (password: string): string => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    return '';
  };

  // Real-time validation
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    if (touched.email) {
      const emailError = validateEmail(value);
      setValidationErrors(prev => ({ ...prev, email: emailError }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    
    if (touched.password) {
      const passwordError = validatePassword(value);
      setValidationErrors(prev => ({ ...prev, password: passwordError }));
    }
  };

  // Handle field blur (when user leaves the field)
  const handleEmailBlur = () => {
    setTouched(prev => ({ ...prev, email: true }));
    const emailError = validateEmail(email);
    setValidationErrors(prev => ({ ...prev, email: emailError }));
  };

  const handlePasswordBlur = () => {
    setTouched(prev => ({ ...prev, password: true }));
    const passwordError = validatePassword(password);
    setValidationErrors(prev => ({ ...prev, password: passwordError }));
  };

  // Validate entire form
  const validateForm = (): boolean => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    setValidationErrors({
      email: emailError,
      password: passwordError,
    });

    setTouched({ email: true, password: true });

    return !emailError && !passwordError;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Send login request
      const response = await axiosInstance.post('/api/users/login', {
        email,
        password,
      });
      const { accessToken, refreshToken, user } = response.data;

      // Save tokens and user data
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      // Set session expiry (2 minutes from now)
      const sessionExpiry = Date.now() + 2 * 60 * 1000;
      localStorage.setItem('sessionExpiry', sessionExpiry.toString());

      window.dispatchEvent(new Event('storage'));

      // Show success alert with navigation button
      Swal.fire({
        icon: 'success',
        title: 'Logged In!',
        text: `Welcome back, ${user.name}!`,
        confirmButtonText: 'Dashboard',
        
      }).then((result) => {
        if (result.isConfirmed) {
          if (user.role === 'student') {
            navigate('/');
          } else if (user.role === 'instructor') {
            navigate('/instructor/dashboard');
          } else if (user.role === 'admin') {
            navigate('/admin/dashboard');
          } else {
            navigate('/');
          }
        }
      });

    } catch (err: any) {
      console.error(err);
      const errorMessage =
        err.response?.data?.message ||
        'Invalid email or password';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Check if form is valid for submit button
  const isFormValid = !validationErrors.email && !validationErrors.password && email && password;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
            <BookOpen className="h-10 w-10 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">EasyLearn</span>
          </Link>
          <Typography variant="h5" component="h2" fontWeight="bold" color="textPrimary">
            Sign in to your account
          </Typography>
          <p className="mt-2 text-gray-600">
            Or{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-500">
              create a new account
            </Link>
          </p>
        </div>

        <Card elevation={3}>
          <CardHeader title="Login" />
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert severity="error" className="mb-4">
                  {error}
                </Alert>
              )}

              {/* Email Address */}
              <div className="space-y-2">
                <Typography component="label" htmlFor="email" fontWeight="medium" display="block">
                  Email address
                </Typography>
                <TextField
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  fullWidth
                  required
                  placeholder="Enter your email"
                  variant="outlined"
                  size="small"
                  error={touched.email && !!validationErrors.email}
                  helperText={touched.email && validationErrors.email}
                  sx={{ mt: 1 }}
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Typography component="label" htmlFor="password" fontWeight="medium" display="block">
                  Password
                </Typography>
                <TextField
                  id="password"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  fullWidth
                  required
                  placeholder="Enter your password"
                  variant="outlined"
                  size="small"
                  error={touched.password && !!validationErrors.password}
                  helperText={touched.password && validationErrors.password}
                  sx={{ mt: 1 }}
                />
              </div>

              {/* Forgot Password */}
              <div className="flex items-center justify-between">
                <Typography variant="body2" color="textSecondary">
                  <Link to="/forgot-password" className="text-blue-600 hover:text-blue-500">
                    Forgot your password?
                  </Link>
                </Typography>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading || !isFormValid}
                sx={{
                  mt: 2,
                  textTransform: 'none',
                  bgcolor: '#3B82F6',
                  '&:hover': {
                    bgcolor: '#2563EB',
                  },
                  '&:disabled': {
                    bgcolor: '#9CA3AF',
                  },
                }}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
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

interface PasswordValidation {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  specialChar: boolean;
}

interface ValidationErrors {
  password: string;
  confirmPassword: string;
}

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    password: '',
    confirmPassword: '',
  });
  const [fieldTouched, setFieldTouched] = useState({
    password: false,
    confirmPassword: false,
  });
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const validatePassword = (password: string): string => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    if (password.length > 128) return 'Password must be less than 128 characters';
    if (!/[A-Z]/.test(password)) return 'One uppercase letter required';
    if (!/[a-z]/.test(password)) return 'One lowercase letter required';
    if (!/\d/.test(password)) return 'One number required';
    if (!/[^A-Za-z0-9]/.test(password)) return 'One special character required';
    return '';
  };

  const validateConfirmPassword = (confirmPassword: string): string => {
    if (!confirmPassword) return 'Confirm password is required';
    if (confirmPassword !== password) return 'Passwords do not match';
    return '';
  };

  const updatePasswordValidation = (password: string) => {
    const newValidation: PasswordValidation = {
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[^A-Za-z0-9]/.test(password),
    };
    setPasswordValidation(newValidation);
  };

  const validateField = (name: keyof ValidationErrors, value: string): boolean => {
    let error = '';
    switch (name) {
      case 'password':
        error = validatePassword(value);
        updatePasswordValidation(value);
        break;
      case 'confirmPassword':
        error = validateConfirmPassword(value);
        break;
    }
    setValidationErrors(prev => ({ ...prev, [name]: error }));
    return error === '';
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(confirmPassword),
    };
    setValidationErrors(errors);
    setFieldTouched({ password: true, confirmPassword: true });
    return Object.values(errors).every(error => error === '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'password' | 'confirmPassword') => {
    const value = e.target.value;
    if (field === 'password') setPassword(value);
    else setConfirmPassword(value);
    if (fieldTouched[field]) validateField(field, value);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFieldTouched(prev => ({ ...prev, [name]: true }));
    validateField(name as keyof ValidationErrors, value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if (!validateForm()) {
      setLoading(false);
      return;
    }
    try {
      await axios.post(`http://localhost:5000/api/users/reset-password/${token}`, { password });
      Swal.fire({
        icon: 'success',
        title: 'Password Reset!',
        text: 'Your password has been updated. Please log in.',
        confirmButtonColor: '#3B82F6',
      }).then(() => navigate('/login'));
    } catch (err) {
      const error = err as AxiosError;
      Swal.fire({
        icon: 'error',
        title: 'Failed',
        text: error.response?.data?.message || 'Could not reset password. Please try again.',
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
          <Typography variant="h5" fontWeight="bold" color="textPrimary">Reset Password</Typography>
          <p className="mt-2 text-gray-600">Enter your new password below.</p>
        </div>
        <Card elevation={3}>
          <CardHeader title="Set New Password" />
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
                <TextField
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => handleChange(e, 'password')}
                  onBlur={handleBlur}
                  fullWidth
                  required
                  placeholder="Enter new password"
                  variant="outlined"
                  size="small"
                  error={fieldTouched.password && !!validationErrors.password}
                  helperText={fieldTouched.password ? validationErrors.password : ""}
                  sx={{ mt: 1 }}
                />
                <div className="mt-2 text-sm">
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Password requirements:
                  </Typography>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2">
                      {passwordValidation.length ? '✔️' : '✖️'}
                      <span style={{ color: passwordValidation.length ? '#2e7d32' : 'inherit' }}>
                        At least 6 characters
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      {passwordValidation.uppercase ? '✔️' : '✖️'}
                      <span style={{ color: passwordValidation.uppercase ? '#2e7d32' : 'inherit' }}>
                        One uppercase letter
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      {passwordValidation.lowercase ? '✔️' : '✖️'}
                      <span style={{ color: passwordValidation.lowercase ? '#2e7d32' : 'inherit' }}>
                        One lowercase letter
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      {passwordValidation.number ? '✔️' : '✖️'}
                      <span style={{ color: passwordValidation.number ? '#2e7d32' : 'inherit' }}>
                        One number
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      {passwordValidation.specialChar ? '✔️' : '✖️'}
                      <span style={{ color: passwordValidation.specialChar ? '#2e7d32' : 'inherit' }}>
                        One special character
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <TextField
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => handleChange(e, 'confirmPassword')}
                  onBlur={handleBlur}
                  fullWidth
                  required
                  placeholder="Confirm new password"
                  variant="outlined"
                  size="small"
                  error={fieldTouched.confirmPassword && !!validationErrors.confirmPassword}
                  helperText={fieldTouched.confirmPassword ? validationErrors.confirmPassword : ""}
                  sx={{ mt: 1 }}
                />
              </div>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading || !Object.values(validationErrors).every(err => !err)}
                sx={{ textTransform: 'none', bgcolor: '#3B82F6', '&:hover': { bgcolor: '#2563EB' } }}
              >
                {loading ? 'Submitting...' : 'Reset Password'}
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

export default ResetPassword;

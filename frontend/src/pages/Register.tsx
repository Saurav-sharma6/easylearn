import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";

// MUI Components
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardHeader from "@mui/material/CardHeader";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Select, { type SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import FormHelperText from "@mui/material/FormHelperText";

// SweetAlert2
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// Axios
import axiosInstance from "../helpers/axiosInstance";

// Define Form Data Interface
interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

// Define Validation Errors Interface
interface ValidationErrors {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
}

// Define Field Touched Interface
interface FieldTouched {
  name: boolean;
  email: boolean;
  password: boolean;
  confirmPassword: boolean;
  role: boolean;
}

const Register = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  // Field touched state (to show errors only after user interaction)
  const [fieldTouched, setFieldTouched] = useState<FieldTouched>({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    role: false,
  });

  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  const navigate = useNavigate();

  // Validation functions
  const validateName = (name: string): string => {
    if (!name.trim()) {
      return "Full name is required";
    }
    if (name.trim().length < 2) {
      return "Name must be at least 2 characters long";
    }
    if (name.trim().length > 50) {
      return "Name must be less than 50 characters";
    }
    if (!/^[a-zA-Z\s'-]+$/.test(name.trim())) {
      return "Name can only contain letters, spaces, hyphens, and apostrophes";
    }
    return "";
  };

  const validateEmail = (email: string): string => {
    if (!email.trim()) {
      return "Email address is required";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return "Please enter a valid email address";
    }
    if (email.length > 100) {
      return "Email address is too long";
    }
    return "";
  };

  const validatePassword = (password: string): string => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters long";
    }
    if (password.length > 128) {
      return "Password must be less than 128 characters";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/\d/.test(password)) {
      return "Password must contain at least one number";
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      return "Password must contain at least one special character";
    }
    return "";
  };

  const validateConfirmPassword = (confirmPassword: string, password: string): string => {
    if (!confirmPassword) {
      return "Please confirm your password";
    }
    if (confirmPassword !== password) {
      return "Passwords do not match";
    }
    return "";
  };

  const validateRole = (role: string): string => {
    if (!role) {
      return "Please select a role";
    }
    if (!["student", "instructor"].includes(role)) {
      return "Please select a valid role";
    }
    return "";
  };

  // Update password validation indicators
  const updatePasswordValidation = (password: string) => {
    setPasswordValidation({
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[^A-Za-z0-9]/.test(password),
    });
  };

  // Validate single field
  const validateField = (name: keyof FormData, value: string) => {
    let error = "";
    
    switch (name) {
      case "name":
        error = validateName(value);
        break;
      case "email":
        error = validateEmail(value);
        break;
      case "password":
        error = validatePassword(value);
        updatePasswordValidation(value);
        // Also revalidate confirm password if it exists
        if (formData.confirmPassword) {
          setValidationErrors(prev => ({
            ...prev,
            confirmPassword: validateConfirmPassword(formData.confirmPassword, value)
          }));
        }
        break;
      case "confirmPassword":
        error = validateConfirmPassword(value, formData.password);
        break;
      case "role":
        error = validateRole(value);
        break;
    }

    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));

    return error === "";
  };

  // Validate entire form
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.confirmPassword, formData.password),
      role: validateRole(formData.role),
    };

    setValidationErrors(errors);
    
    // Mark all fields as touched
    setFieldTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
      role: true,
    });

    // Return true if no errors
    return Object.values(errors).every(error => error === "");
  };

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Validate field if it has been touched
    if (fieldTouched[name as keyof FieldTouched]) {
      validateField(name as keyof FormData, value);
    }
  };

  // Handle field blur (when user leaves the field)
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFieldTouched(prev => ({
      ...prev,
      [name]: true
    }));
    validateField(name as keyof FormData, value);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validate entire form
    if (!validateForm()) {
      setError("Please fix all validation errors before submitting");
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.post("/api/auth/register", {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        role: formData.role,
      });

      // Show success alert and redirect
      Swal.fire({
        icon: "success",
        title: "Registration Successful!",
        text: "You can now log in with your credentials.",
        confirmButtonText: "Go to Login",
      }).then(() => {
        navigate("/login");
      });

    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Registration failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle Select change
  const handleRoleChange = (e: SelectChangeEvent) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      role: value
    }));
    
    if (fieldTouched.role) {
      validateField("role", value);
    }
  };

  // Handle role field blur
  const handleRoleBlur = () => {
    setFieldTouched(prev => ({
      ...prev,
      role: true
    }));
    validateField("role", formData.role);
  };

  // Check if form is valid for submit button
  const isFormValid = () => {
    return Object.values(validationErrors).every(error => error === "") &&
           Object.values(formData).every(value => value.trim() !== "");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link
            to="/"
            className="flex items-center justify-center space-x-2 mb-8"
          >
            <BookOpen className="h-10 w-10 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">EasyLearn</span>
          </Link>
          <Typography
            variant="h5"
            component="h2"
            fontWeight="bold"
            color="textPrimary"
          >
            Create your account
          </Typography>
          <p className="mt-2 text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:text-blue-500">
              Sign in here
            </Link>
          </p>
        </div>

        <Card elevation={3}>
          <CardHeader title="Sign Up" />
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert severity="error" className="mb-4">
                  {error}
                </Alert>
              )}

              {/* Full Name */}
              <div className="space-y-2">
                <Typography
                  component="label"
                  htmlFor="name"
                  fontWeight="medium"
                  display="block"
                >
                  Full Name
                </Typography>
                <TextField
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  required
                  placeholder="Enter your full name"
                  variant="outlined"
                  size="small"
                  error={fieldTouched.name && !!validationErrors.name}
                  helperText={fieldTouched.name ? validationErrors.name : ""}
                  sx={{ mt: 1 }}
                />
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <Typography
                  component="label"
                  htmlFor="email"
                  fontWeight="medium"
                  display="block"
                >
                  Email address
                </Typography>
                <TextField
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  required
                  placeholder="Enter your email"
                  variant="outlined"
                  size="small"
                  error={fieldTouched.email && !!validationErrors.email}
                  helperText={fieldTouched.email ? validationErrors.email : ""}
                  sx={{ mt: 1 }}
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <InputLabel id="role-label">I want to be a</InputLabel>
                <FormControl 
                  fullWidth 
                  error={fieldTouched.role && !!validationErrors.role}
                >
                  <Select
                    labelId="role-label"
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleRoleChange}
                    onBlur={handleRoleBlur}
                    size="small"
                    required
                  >
                    <MenuItem value="student">Learner (Student)</MenuItem>
                    <MenuItem value="instructor">Teacher (Instructor)</MenuItem>
                  </Select>
                  {fieldTouched.role && validationErrors.role && (
                    <FormHelperText>{validationErrors.role}</FormHelperText>
                  )}
                </FormControl>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Typography
                  component="label"
                  htmlFor="password"
                  fontWeight="medium"
                  display="block"
                >
                  Password
                </Typography>
                <TextField
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  required
                  placeholder="Enter your password"
                  variant="outlined"
                  size="small"
                  error={fieldTouched.password && !!validationErrors.password}
                  helperText={fieldTouched.password ? validationErrors.password : ""}
                  sx={{ mt: 1 }}
                />

                {/* Password Criteria Feedback */}
                <div className="mt-2 text-sm">
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Password requirements:
                  </Typography>
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2">
                      {passwordValidation.length ? (
                        <span className="text-green-500">✔️</span>
                      ) : (
                        <span className="text-red-500">✖️</span>
                      )}
                      <span className={passwordValidation.length ? "text-green-600" : "text-gray-600"}>
                        At least 6 characters
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      {passwordValidation.uppercase ? (
                        <span className="text-green-500">✔️</span>
                      ) : (
                        <span className="text-red-500">✖️</span>
                      )}
                      <span className={passwordValidation.uppercase ? "text-green-600" : "text-gray-600"}>
                        One uppercase letter
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      {passwordValidation.lowercase ? (
                        <span className="text-green-500">✔️</span>
                      ) : (
                        <span className="text-red-500">✖️</span>
                      )}
                      <span className={passwordValidation.lowercase ? "text-green-600" : "text-gray-600"}>
                        One lowercase letter
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      {passwordValidation.number ? (
                        <span className="text-green-500">✔️</span>
                      ) : (
                        <span className="text-red-500">✖️</span>
                      )}
                      <span className={passwordValidation.number ? "text-green-600" : "text-gray-600"}>
                        One number
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      {passwordValidation.specialChar ? (
                        <span className="text-green-500">✔️</span>
                      ) : (
                        <span className="text-red-500">✖️</span>
                      )}
                      <span className={passwordValidation.specialChar ? "text-green-600" : "text-gray-600"}>
                        One special character (!@#$%^&*)
                      </span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Typography
                  component="label"
                  htmlFor="confirmPassword"
                  fontWeight="medium"
                  display="block"
                >
                  Confirm Password
                </Typography>
                <TextField
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  fullWidth
                  required
                  placeholder="Confirm your password"
                  variant="outlined"
                  size="small"
                  error={fieldTouched.confirmPassword && !!validationErrors.confirmPassword}
                  helperText={fieldTouched.confirmPassword ? validationErrors.confirmPassword : ""}
                  sx={{ mt: 1 }}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading || !isFormValid()}
                sx={{
                  mt: 2,
                  textTransform: "none",
                  bgcolor: "#3B82F6",
                  "&:hover": {
                    bgcolor: "#2563EB",
                  },
                  "&:disabled": {
                    bgcolor: "#94A3B8",
                  },
                }}
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Register;
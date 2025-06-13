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

// SweetAlert2
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// Axios
import axiosInstance from "../helpers/axiosInstance"; // Make sure path is correct

// Define Form Data Interface
interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
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

  // Password validation state
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Validate password as user types
  const validatePassword = (password: string) => {
    setPasswordValidation({
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[^A-Za-z0-9]/.test(password),
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { length, uppercase, lowercase, number, specialChar } = passwordValidation;

    // Frontend validation before sending request
    if (!length || !uppercase || !lowercase || !number || !specialChar) {
      setError("Password must meet all requirements");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      await axiosInstance.post("/api/auth/register", {
        name: formData.name,
        email: formData.email,
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
    const target = e.target as HTMLSelectElement;
    handleChange({ target } as React.ChangeEvent<HTMLSelectElement>);
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
            <span className="text-2xl font-bold text-gray-900">SkillUp</span>
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange(e)
                  }
                  fullWidth
                  required
                  placeholder="Enter your full name"
                  variant="outlined"
                  size="small"
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange(e)
                  }
                  fullWidth
                  required
                  placeholder="Enter your email"
                  variant="outlined"
                  size="small"
                  sx={{ mt: 1 }}
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <InputLabel id="role-label">I want a</InputLabel>
                <FormControl fullWidth>
                  
                  <Select
                    labelId="role-label"
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleRoleChange}
                    size="small"
                    label="I want to"
                  >
                    <MenuItem value="student">Learner (Student)</MenuItem>
                    <MenuItem value="instructor">Teacher (Instructor)</MenuItem>
                  </Select>
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    handleChange(e);
                    validatePassword(e.target.value);
                  }}
                  fullWidth
                  required
                  placeholder="Enter your password"
                  variant="outlined"
                  size="small"
                  sx={{ mt: 1 }}
                />

                {/* Password Criteria Feedback */}
                <div className="mt-2 text-sm">
                  <ul className="space-y-1">
                    <li className="flex items-center gap-2">
                      {passwordValidation.length ? (
                        <span className="text-green-500">✔️</span>
                      ) : (
                        <span className="text-red-500">✖️</span>
                      )}
                      <span>At least 6 characters</span>
                    </li>
                    <li className="flex items-center gap-2">
                      {passwordValidation.uppercase ? (
                        <span className="text-green-500">✔️</span>
                      ) : (
                        <span className="text-red-500">✖️</span>
                      )}
                      <span>One uppercase letter</span>
                    </li>
                    <li className="flex items-center gap-2">
                      {passwordValidation.lowercase ? (
                        <span className="text-green-500">✔️</span>
                      ) : (
                        <span className="text-red-500">✖️</span>
                      )}
                      <span>One lowercase letter</span>
                    </li>
                    <li className="flex items-center gap-2">
                      {passwordValidation.number ? (
                        <span className="text-green-500">✔️</span>
                      ) : (
                        <span className="text-red-500">✖️</span>
                      )}
                      <span>One number</span>
                    </li>
                    <li className="flex items-center gap-2">
                      {passwordValidation.specialChar ? (
                        <span className="text-green-500">✔️</span>
                      ) : (
                        <span className="text-red-500">✖️</span>
                      )}
                      <span>One special character (!@#$%^&*)</span>
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange(e)
                  }
                  fullWidth
                  required
                  placeholder="Confirm your password"
                  variant="outlined"
                  size="small"
                  sx={{ mt: 1 }}
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
                sx={{
                  mt: 2,
                  textTransform: "none",
                  bgcolor: "#3B82F6",
                  "&:hover": {
                    bgcolor: "#2563EB",
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
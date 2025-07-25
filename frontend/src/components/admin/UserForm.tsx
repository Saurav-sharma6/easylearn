import React, { useState } from "react";
import {
  Button,
  Card,
  TextField,
  Typography,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { FaArrowLeft } from "react-icons/fa";
import axiosInstance from "../../helpers/axiosInstance";

interface UserFormProps {
  initialData?: {
    _id?: string;
    name: string;
    email: string;
    role: "student" | "instructor" | "admin";
  };
  onSubmit: (formData: any) => Promise<void>;
  onCancel: () => void;
  isEditing: boolean;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  setSnackbar: (snackbar: { open: boolean; message: string; severity: "success" | "error" }) => void;
}

const UserForm: React.FC<UserFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEditing,
  loading,
  setLoading,
  setSnackbar,
}) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    email: initialData?.email || "",
    role: initialData?.role || "student",
  });

  const roles = ["student", "instructor", "admin"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setSnackbar({ open: false, message: "", severity: "success" });

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.message || "Failed to save user",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white p-6 rounded-xl shadow-md">
      <Button
        variant="outlined"
        onClick={onCancel}
        disabled={loading}
        sx={{
          borderRadius: "8px",
          fontWeight: 600,
          borderColor: "#d1d5db",
          color: "#4b50af",
          marginBottom: "1.5rem",
          "&:hover": {
            borderColor: "#9ca3af",
            bgcolor: "#f3f4f6",
          },
        }}
      >
        <FaArrowLeft className="mr-2" />
        Back
      </Button>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        {isEditing ? "Edit User" : "Create User"}
      </Typography>
      <form onSubmit={handleSubmit} className="space-y-5">
        <TextField
          fullWidth
          label="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          margin="normal"
          required
          disabled={loading}
          InputLabelProps={{ shrink: true }}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
        />
        <TextField
          fullWidth
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          margin="normal"
          required
          disabled={loading}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
        />
        <TextField
          select
          fullWidth
          label="Role"
          value={formData.role}
          onChange={(e) => setFormData({ ...formData, role: e.target.value as "student" | "instructor" | "admin" })}
          margin="normal"
          required
          disabled={loading}
          sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
        >
          {roles.map((role) => (
            <MenuItem key={role} value={role}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </MenuItem>
          ))}
        </TextField>
        <div className="flex gap-4 mt-4">
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              bgcolor: "#4f46e5",
              "&:hover": { bgcolor: "#3730a3" },
              borderRadius: "8px",
              fontWeight: 600,
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={24} sx={{ color: "white", mr: 1 }} />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : isEditing ? "Update User" : "Create User"}
          </Button>
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={loading}
            sx={{
              borderRadius: "8px",
              fontWeight: 600,
              borderColor: "#d1d5db",
              color: "#4b50af",
              "&:hover": {
                borderColor: "#9ca3af",
                bgcolor: "#f3f4f6",
              },
            }}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default UserForm;
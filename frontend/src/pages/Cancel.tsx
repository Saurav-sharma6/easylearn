import { useNavigate } from "react-router-dom";
import ErrorIcon from "@mui/icons-material/Error";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

const Cancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <ErrorIcon className="text-red-500" style={{ fontSize: 60 }} />
        </div>
        <Typography variant="h5" className="text-gray-800 mb-2">
          Payment Cancelled
        </Typography>
        <Typography className="text-gray-600 mb-6">
          Your payment was not completed. Please try again or contact support if the issue persists.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/")} // Redirect to home or course page
          className="bg-blue-600 hover:bg-blue-700"
        >
          Return to Home
        </Button>
      </div>
    </div>
  );
};

export default Cancel;
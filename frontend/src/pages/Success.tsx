import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import axiosInstance from "../helpers/axiosInstance";

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const confirmPayment = async () => {
      const sessionId = new URLSearchParams(location.search).get("session_id");

      if (sessionId) {
        try {
          console.log("Confirming payment with session ID:", sessionId);
          const response = await axiosInstance.post("/api/payment/confirm", {
            sessionId,
          });
          console.log("Payment confirmation response:", response.data);
          alert("Enrollment confirmed! You now have access to the course.");
        } catch (error) {
          console.error("Payment confirmation error:", error);
          alert("Failed to confirm enrollment. Please contact support.");
        }
      }
    };

    confirmPayment();
  }, [location]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <CheckCircleIcon className="text-green-500" style={{ fontSize: 60 }} />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-600 mb-6">
          Thank you for enrolling. You now have full access to the course.
        </p>
        <button
          onClick={() => navigate("/")} // Redirect to user dashboard or course page
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Success;
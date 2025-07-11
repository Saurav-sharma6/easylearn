
import React from 'react';

interface Props {
  courseId: string;
  courseName: string;
  price: number;
  userId: string;
}

const CheckoutButton: React.FC<Props> = ({ courseId, courseName, price, userId }) => {
  const handleCheckout = async () => {
    const res = await fetch("/api/payment/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId, courseName, price, userId }),
    });

    const data = await res.json();
    window.location.href = data.url;
  };

  return (
    <button onClick={handleCheckout} className="btn">
      Enroll Now
    </button>
  );
};

export default CheckoutButton;
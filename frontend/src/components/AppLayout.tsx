// src/components/AppLayout.tsx
import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './layout/Header';

export const AppLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkExpiry = () => {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');
      const sessionExpiry = localStorage.getItem('sessionExpiry');

      // console.log('Checking expiry:', { token, refreshToken, sessionExpiry }); // Debug log

      if (token && refreshToken && sessionExpiry) {
        const expiryTime = parseInt(sessionExpiry, 10);
        if (!isNaN(expiryTime) && Date.now() > expiryTime) {
          // console.log('Session expired, redirecting to /login');
          localStorage.clear();
          window.dispatchEvent(new Event('storage'));
          navigate('/', { replace: true });
        }
      }
    };

    const timer = setTimeout(() => {
      checkExpiry();
      const interval = setInterval(checkExpiry, 60000); // Check every minute
      return () => clearInterval(interval);
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <>
      <Header />
      <Outlet /> {/* Renders the matched route component */}
    </>
  );
};

export default AppLayout;
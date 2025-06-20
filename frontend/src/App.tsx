import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';


import Login from "./pages/Login.tsx"
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword.tsx';
import ResetPassword from './pages/ResetPassword.tsx';

// Material UI Components
import { SnackbarProvider } from 'notistack'; // For global toast notifications
import { ThemeProvider, createTheme } from '@mui/material/styles'; // Optional: for theme customization

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Your brand color
    },
  },
});

const App = () => (
  <ThemeProvider theme={theme}>
    <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
      <BrowserRouter>
        
          <Routes>
            <Route path="/" element={<Home />} />
            {/* Add more routes as needed */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
          </Routes>
        
      </BrowserRouter>
    </SnackbarProvider>
  </ThemeProvider>
);

export default App;
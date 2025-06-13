import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { BookOpen, Search, User } from 'lucide-react';

// MUI Components
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import Avatar from '@mui/material/Avatar';

interface User {
  name: string;
  role: 'student' | 'instructor' | 'admin';
}

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (err) {
        console.error("Failed to parse user from localStorage");
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
    window.location.reload(); // Force re-render to update header
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">EasyLearn</span>
          </Link>

          {/* Search Bar (optional) */}
          <div className="flex-1 max-w-lg mx-8 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <InputBase
                placeholder="Search for courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                inputProps={{ 'aria-label': 'search' }}
                sx={{
                  paddingLeft: '2.5rem',
                  width: '100%',
                  backgroundColor: '#F3F4F6', // Tailwind gray-200
                  borderRadius: 1,
                  height: '2.5rem',
                  fontSize: '0.875rem',
                  color: '#111827',
                  '& .MuiInputBase-input': {
                    padding: '8px',
                  },
                }}
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {user.role === 'instructor' && (
                  <Link to="/instructor/dashboard">
                    <Button variant="text" color="primary" sx={{ textTransform: 'none' }}>
                      Instructor Dashboard
                    </Button>
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin/dashboard">
                    <Button variant="text" color="primary" sx={{ textTransform: 'none' }}>
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
                {user.role === 'student' && (
                  <Link to="/my-courses">
                    <Button variant="text" color="primary" sx={{ textTransform: 'none' }}>
                      My Learning
                    </Button>
                  </Link>
                )}

                <div className="flex items-center space-x-2">
                  <Avatar sx={{ width: 24, height: 24, bgcolor: 'blueGrey.300' }}>
                    <User style={{ fontSize: 16 }} />
                  </Avatar>
                  <span className="text-sm text-gray-700">{user.name}</span>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleLogout}
                    sx={{
                      textTransform: 'none',
                      borderColor: 'gray.300',
                      color: 'gray.700',
                      fontSize: '0.75rem',
                      padding: '4px 12px',
                      '&:hover': {
                        borderColor: 'gray.400',
                        backgroundColor: 'gray.50',
                      },
                    }}
                  >
                    Logout
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="text" color="primary" sx={{ textTransform: 'none' }}>
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{
                      textTransform: 'none',
                      backgroundColor: '#3B82F6',
                      '&:hover': {
                        backgroundColor: '#2563EB',
                      },
                    }}
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
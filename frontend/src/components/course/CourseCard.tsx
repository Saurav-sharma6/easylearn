import React from 'react';
import { NavLink } from 'react-router-dom'; // <-- Replaced with NavLink

// MUI Components
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';

// Icons
import StarIcon from '@mui/icons-material/Star';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

// Types
export interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  price: number;
  originalPrice?: number | null;
  rating: number;
  students: number;
  duration: string;
  image: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  isEnrolled?: boolean;
  isNew?: boolean; // optional field
}

const CourseCard: React.FC<{ course: Course }> = ({ course }) => {
  const {
    _id,
    title,
    description,
    instructor,
    price,
    originalPrice,
    rating,
    students,
    duration,
    image,
    level,
    isEnrolled,
    isNew = false,
  } = course;

  return (
    <Card
      className="overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200"
      sx={{
        '&:hover': {
          borderColor: 'rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      {/* Image Section */}
      <div className="relative h-48 w-full">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <Chip
            label={level}
            size="small"
            sx={{ bgcolor: 'rgba(0,0,0,0.7)', color: '#fff', fontWeight: 600, fontSize: '0.65rem' }}
          />
          {isNew && (
            <Chip
              label="New"
              size="small"
              color="error"
              sx={{ fontSize: '0.65rem', fontWeight: 600 }}
            />
          )}
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-4">
        {/* Title */}
        <Typography
          variant="h6"
          fontWeight="bold"
          gutterBottom
          component="div"
          className="line-clamp-1"
        >
          <NavLink
            to={`/course/${_id}`}
            className={({ isActive }) =>
              isActive
                ? "text-blue-600 underline no-underline"
                : "text-gray-900 hover:text-blue-600 no-underline hover:underline"
            }
          >
            {title}
          </NavLink>
        </Typography>

        {/* Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          paragraph
          className="line-clamp-2 text-sm mb-3"
        >
          {description}
        </Typography>

        {/* Instructor */}
        <Box display="flex" alignItems="center" mb={1}>
          <PersonIcon fontSize="small" color="action" />
          <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
            {instructor}
          </Typography>
        </Box>

        {/* Rating, Duration, Students */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" gap={2} color="text.secondary" sx={{ fontSize: '0.8rem' }}>
            <Box display="flex" alignItems="center">
              <StarIcon fontSize="small" color="warning" />
              <Typography variant="body2" sx={{ ml: 0.5 }}>
                {rating.toFixed(1)}
              </Typography>
            </Box>
            <Box display="flex" alignItems="center">
              <AccessTimeIcon fontSize="small" color="action" />
              <Typography variant="body2" sx={{ ml: 0.5 }}>
                {duration}
              </Typography>
            </Box>
          </Box>
          <Typography variant="caption" color="textSecondary">
            {students} enrolled
          </Typography>
        </Box>

        {/* Price & Enroll Button */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
          <Box display="flex" alignItems="center">
            <LocalOfferIcon fontSize="small" color="action" />
            <Typography variant="subtitle1" fontWeight="bold" sx={{ ml: 1 }}>
              {price === 0 ? 'Free' : `$${price}`}
            </Typography>
            {originalPrice && price > 0 && (
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ ml: 1, textDecoration: 'line-through' }}
              >
                ${originalPrice}
              </Typography>
            )}
          </Box>

          {/* Enroll / View Course Button */}
          {isEnrolled ? (
            <Button
              component={NavLink} // <-- NavLink as component
              to={`/course/${_id}/learn`}
              size="small"
              variant="contained"
              disableElevation
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                bgcolor: '#3b82f6',
                color: 'white',
                '&:hover': { bgcolor: '#2563eb' },
              }}
            >
              Continue Learning
            </Button>
          ) : (
            <Button
              component={NavLink} // <-- NavLink as component
              to={`/course/${_id}`}
              size="small"
              variant={price === 0 ? 'contained' : 'outlined'}
              color={price === 0 ? 'success' : 'primary'}
              disableElevation
              sx={{
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
              }}
            >
              {price === 0 ? 'Enroll Now' : 'View Course'}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
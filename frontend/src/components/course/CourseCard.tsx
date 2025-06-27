import React from 'react';
import { Link } from 'react-router-dom';

// MUI Components
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

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
  } = course;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300 border rounded-md">
      {/* Course Image */}
      <div className="relative h-48 w-full">
        <img src={image} alt={title} className="w-full h-full object-cover" />
        <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium">
          {level}
        </div>
      </div>

      {/* Course Info */}
      <CardContent className="p-4">
        {/* Title */}
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          <Link to={`/course/${_id}`} className="hover:text-blue-600 no-underline">
            {title}
          </Link>
        </Typography>

        {/* Description */}
        <Typography variant="body2" color="text.secondary" paragraph className="line-clamp-2">
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
        <Box display="flex" justifyContent="space-between" alignItems="center">
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
              component={Link}
              to={`/course/${_id}/learn`}
              size="small"
              variant="contained"
              sx={{ textTransform: 'none' }}
            >
              Continue Learning
            </Button>
          ) : (
            <Button
              component={Link}
              to={`/course/${_id}`}
              size="small"
              variant={price === 0 ? 'contained' : 'outlined'}
              color={price === 0 ? 'success' : 'primary'}
              sx={{ textTransform: 'none' }}
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
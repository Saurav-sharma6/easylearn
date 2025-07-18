import { useState, useEffect } from "react";

// MUI Components
import Button from "@mui/material/Button";

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import Badge from "@mui/material/Badge";

// Course Card Component
import CourseCard from "./CourseCard";

// Axios for API calls
import axiosInstance from "../../helpers/axiosInstance";

// Types
interface Course {
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
  level: "Beginner" | "Intermediate" | "Advanced";
  isEnrolled?: boolean;
  isFeatured: boolean;
  isPopular: boolean;
}

const AllCourses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("popularity");

  // Get unique categories from courses
  const categories = [
    "all",
    ...new Set(courses.map((course) => course.category)),
  ] as string[];

  // Load courses from backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axiosInstance.get("/api/courses");
        setCourses(response.data.courses || []);
      } catch (err) {
        console.error("Failed to load courses:", err);
      }
    };

    fetchCourses();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...courses];

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(term) ||
          course.description.toLowerCase().includes(term) ||
          course.instructor.toLowerCase().includes(term) ||
          course.category.toLowerCase().includes(term)
      );
    }

    // Category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (course) => course.category === selectedCategory
      );
    }

    // Level
    if (selectedLevel !== "all") {
      filtered = filtered.filter((course) => course.level === selectedLevel);
    }

    // Price
    if (priceFilter === "free") {
      filtered = filtered.filter((course) => course.price === 0);
    } else if (priceFilter === "paid") {
      filtered = filtered.filter((course) => course.price > 0);
    }

    // Sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // popularity (most students)
        filtered.sort((a, b) => b.students - a.students);
        break;
    }

    setFilteredCourses(filtered);
  }, [
    courses,
    searchTerm,
    selectedCategory,
    selectedLevel,
    priceFilter,
    sortBy,
  ]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedLevel("all");
    setPriceFilter("all");
    setSortBy("popularity");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Container maxWidth="lg" className="py-12">

        <Box textAlign="center" mb={12}>
            <Typography variant="h4" fontWeight="bold" color="textPrimary">
              All Courses
            </Typography>

            <Typography
              variant="body1"
              color="textSecondary"
              component="p"
              maxWidth="xl"
              mx="auto"
            >
              Discover our most popular courses, carefully selected by our
              expert instructors
            </Typography>
          </Box>
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-64 space-y-6">
            <Typography variant="h6" fontWeight="bold" sx={{ color: "black" }}>
              Filters
            </Typography>

            {/* Search */}
            <div className="relative flex-1 w-full"></div>

            {/* Category */}
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
                sx={{ mt: 2 }}
              >
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category === "all" ? "All Categories" : category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <div className="relative flex-1 w-full"></div>

            {/* Level */}
            <FormControl fullWidth>
              <InputLabel>Level</InputLabel>
              <Select
                value={selectedLevel}
                label="Level"
                onChange={(e) => setSelectedLevel(e.target.value)}
                sx={{ mt: 2 }}
              >
                <MenuItem value="all">All Levels</MenuItem>
                <MenuItem value="Beginner">Beginner</MenuItem>
                <MenuItem value="Intermediate">Intermediate</MenuItem>
                <MenuItem value="Advanced">Advanced</MenuItem>
              </Select>
            </FormControl>

            <div className="relative flex-1 w-full"></div>

            {/* Price Filter */}
            <FormControl fullWidth>
              <InputLabel>Price</InputLabel>
              <Select
                value={priceFilter}
                label="Price"
                onChange={(e) => setPriceFilter(e.target.value)}
                sx={{ mt: 2 }}
              >
                <MenuItem value="all">All Prices</MenuItem>
                <MenuItem value="free">Free</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
              </Select>
            </FormControl>

            <div className="relative flex-1 w-full"></div>

            {/* Sort By */}
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                label="Sort By"
                onChange={(e) => setSortBy(e.target.value)}
                sx={{ mt: 2 }}
              >
                <MenuItem value="popularity">Most Popular</MenuItem>
                <MenuItem value="price-low">Price: Low to High</MenuItem>
                <MenuItem value="price-high">Price: High to Low</MenuItem>
                <MenuItem value="rating">Highest Rated</MenuItem>
              </Select>
            </FormControl>

            <div className="relative flex-1 w-full"></div>

            {/* Clear Filters */}
            <Button
              variant="outlined"
              fullWidth
              onClick={clearFilters}
              sx={{ mt: 2 }}
            >
              Clear Filters
            </Button>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Applied Filters Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {searchTerm && (
                <Badge className="flex items-center gap-1">
                  Search: {searchTerm}
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-1 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedCategory !== "all" && (
                <Badge className="flex items-center gap-1">
                  Category: {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className="ml-1 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedLevel !== "all" && (
                <Badge className="flex items-center gap-1">
                  Level: {selectedLevel}
                  <button
                    onClick={() => setSelectedLevel("all")}
                    className="ml-1 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {priceFilter !== "all" && (
                <Badge className="flex items-center gap-1">
                  Price: {priceFilter === "free" ? "Free" : "Paid"}
                  <button
                    onClick={() => setPriceFilter("all")}
                    className="ml-1 hover:bg-gray-300 rounded-full w-4 h-4 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <div
                    key={course._id}
                    className="transform hover:scale-105 transition-transform duration-300"
                  >
                    <CourseCard course={course} />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center text-gray-500 py-6">
                  No courses found matching your criteria.
                </div>
              )}
            </div>
          </main>
        </div>
      </Container>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <Container maxWidth="lg">
          <Box textAlign="center">
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Ready to Start Learning?
            </Typography>
            <Typography
              variant="body1"
              color="textSecondary"
              gutterBottom
              maxWidth="md"
              mx="auto"
              mb={4}
            >
              Join millions of students and start your learning journey today.
              Choose from thousands of courses.
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: "#2563eb",
                "&:hover": { bgcolor: "#1d4ed8" },
                textTransform: "none",
                paddingX: 4,
                fontWeight: 600,
              }}
            >
              Get Started Now
            </Button>
          </Box>
        </Container>
      </section>
    </div>
  );
};

export default AllCourses;

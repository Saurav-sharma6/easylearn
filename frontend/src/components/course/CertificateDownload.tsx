import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle } from 'lucide-react';

// Material UI imports
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import LinearProgress from '@mui/material/LinearProgress';

// Icons
import DownloadIcon from '@mui/icons-material/Download';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// import { useToast } from '@/hooks/use-toast';

const CertificateDownload: React.FC<CertificateDownloadProps> = ({
  courseTitle,
  instructorName,
  completionDate,
  studentName,
  isVisible = true
}) => {
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    setDownloading(true);

    try {
      // Simulate PDF generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create a mock certificate file
      const element = document.createElement('a');
      element.href = 'data:text/plain;charset=utf-8,Certificate of Completion';
      element.download = `${courseTitle.replace(/\s+/g, '_')}_certificate.pdf`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      toast({
        title: "Certificate Downloaded!",
        description: "Your certificate has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download certificate. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <Card className="w-full shadow-md rounded-lg border-l-4 border-green-500 bg-green-50">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row items-start gap-4">
          {/* Icon Section */}
          <div className="bg-green-100 p-3 rounded-full text-green-600">
            <EmojiEventsIcon fontSize="large" />
          </div>

          {/* Content Section */}
          <div className="flex-1 space-y-4">
            <Typography variant="h6" fontWeight="bold" color="textPrimary">
              Congratulations! You've completed the course
            </Typography>
            <Typography variant="body2" color="textSecondary">
              You can now download your certificate of completion
            </Typography>

            {/* Certificate Info */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" display="flex" alignItems="center">
                <PersonIcon fontSize="small" sx={{ mr: 1 }} /> Student: <strong>{studentName}</strong>
              </Typography>
              <Typography variant="body2" display="flex" alignItems="center">
                <EmojiEventsIcon fontSize="small" sx={{ mr: 1 }} /> Course: <strong>{courseTitle}</strong>
              </Typography>
              <Typography variant="body2" display="flex" alignItems="center">
                <PersonIcon fontSize="small" sx={{ mr: 1 }} /> Instructor: <strong>{instructorName}</strong>
              </Typography>
              <Typography variant="body2" display="flex" alignItems="center">
                <CalendarTodayIcon fontSize="small" sx={{ mr: 1 }} /> Completed: <strong>{completionDate}</strong>
              </Typography>
            </Box>

            {/* Download Button */}
            <Button
              onClick={handleDownload}
              disabled={downloading}
              variant="contained"
              color="success"
              startIcon={<DownloadIcon />}
              fullWidth
              sx={{
                mt: 2,
                bgcolor: '#10B981',
                '&:hover': { bgcolor: '#065F46' },
              }}
            >
              {downloading ? 'Generating Certificate...' : 'Download Certificate'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
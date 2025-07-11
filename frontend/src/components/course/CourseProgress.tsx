import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock } from 'lucide-react';

interface CourseProgressProps {
  completed: number;
  total: number;
  showDetails?: boolean;
  className?: string;
}

const CourseProgress: React.FC<CourseProgressProps> = ({ 
  completed, 
  total, 
  showDetails = true,
  className = "" 
}) => {
  const progressPercentage = total > 0 ? (completed / total) * 100 : 0;
  const isCompleted = completed === total && total > 0;

  return (
    <div className={`space-y-2 ${className}`}>
      {showDetails && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            {isCompleted ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <Clock className="h-4 w-4 text-gray-500" />
            )}
            <span className="text-gray-600">
              {completed} of {total} lessons completed
            </span>
          </div>
          <span className="font-medium text-gray-900">
            {Math.round(progressPercentage)}%
          </span>
        </div>
      )}
      
      <Progress 
        value={progressPercentage} 
        className="h-2"
      />
      
      {isCompleted && showDetails && (
        <div className="text-sm text-green-600 font-medium">
          Course completed! 🎉
        </div>
      )}
    </div>
  );
};

export default CourseProgress;
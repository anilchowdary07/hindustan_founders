import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, UserCircle, Building, MapPin, FileText, X } from 'lucide-react';
import { useLocation } from 'wouter';

interface WelcomeGuideProps {
  onDismiss?: () => void;
}

export default function WelcomeGuide({ onDismiss }: WelcomeGuideProps) {
  const { user } = useAuth();
  const [_, navigate] = useLocation();
  const [progress, setProgress] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  // Check if the guide has been dismissed before
  useEffect(() => {
    const isDismissed = localStorage.getItem('welcomeGuideDismissed');
    if (isDismissed === 'true') {
      setDismissed(true);
    }
  }, []);

  // Calculate profile completion
  useEffect(() => {
    if (!user) return;

    let completed = 0;
    const totalSteps = 5;

    if (user.name) completed++;
    if (user.title) completed++;
    if (user.company) completed++;
    if (user.location) completed++;
    if (user.bio) completed++;

    const percentage = Math.round((completed / totalSteps) * 100);
    setProgress(percentage);
  }, [user]);

  const handleDismiss = () => {
    localStorage.setItem('welcomeGuideDismissed', 'true');
    setDismissed(true);
    if (onDismiss) onDismiss();
  };

  const goToProfile = () => {
    navigate('/profile');
  };

  if (dismissed || !user || progress >= 100) return null;

  return (
    <Card className="mb-6 border-blue-100 bg-blue-50">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl text-blue-800">Welcome to Founder Network!</CardTitle>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={handleDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription className="text-blue-700">
          Complete your profile to connect with other founders and investors.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-blue-800">Profile completion</span>
            <span className="text-sm font-medium text-blue-800">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-3">
          <div className="flex items-center">
            {user?.name ? (
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            ) : (
              <UserCircle className="h-5 w-5 text-blue-600 mr-2" />
            )}
            <span className={user?.name ? "text-green-700" : "text-blue-700"}>
              {user?.name ? "Name added" : "Add your name"}
            </span>
          </div>
          
          <div className="flex items-center">
            {user?.title ? (
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            ) : (
              <UserCircle className="h-5 w-5 text-blue-600 mr-2" />
            )}
            <span className={user?.title ? "text-green-700" : "text-blue-700"}>
              {user?.title ? "Professional title added" : "Add your professional title"}
            </span>
          </div>
          
          <div className="flex items-center">
            {user?.company ? (
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            ) : (
              <Building className="h-5 w-5 text-blue-600 mr-2" />
            )}
            <span className={user?.company ? "text-green-700" : "text-blue-700"}>
              {user?.company ? "Company added" : "Add your company"}
            </span>
          </div>
          
          <div className="flex items-center">
            {user?.location ? (
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            ) : (
              <MapPin className="h-5 w-5 text-blue-600 mr-2" />
            )}
            <span className={user?.location ? "text-green-700" : "text-blue-700"}>
              {user?.location ? "Location added" : "Add your location"}
            </span>
          </div>
          
          <div className="flex items-center">
            {user?.bio ? (
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            ) : (
              <FileText className="h-5 w-5 text-blue-600 mr-2" />
            )}
            <span className={user?.bio ? "text-green-700" : "text-blue-700"}>
              {user?.bio ? "Bio added" : "Add your bio"}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={goToProfile} className="w-full bg-blue-600 hover:bg-blue-700">
          Complete Your Profile
        </Button>
      </CardFooter>
    </Card>
  );
}
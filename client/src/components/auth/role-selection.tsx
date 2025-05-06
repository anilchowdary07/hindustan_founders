import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, LightbulbIcon, GraduationCapIcon, BriefcaseIcon, TrendingUpIcon, EyeIcon } from "lucide-react";
import { UserRole, UserRoleType } from "@shared/schema";

interface RoleOption {
  id: UserRoleType;
  title: string;
  icon: React.ReactNode;
}

export default function RoleSelection() {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRoleType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  const roleOptions: RoleOption[] = [
    {
      id: UserRole.FOUNDER,
      title: "I'm a Founder / Startup",
      icon: <LightbulbIcon className="h-5 w-5" />,
    },
    {
      id: UserRole.STUDENT,
      title: "I'm a Student / Intern",
      icon: <GraduationCapIcon className="h-5 w-5" />,
    },
    {
      id: UserRole.JOB_SEEKER,
      title: "I'm a Job Seeker",
      icon: <BriefcaseIcon className="h-5 w-5" />,
    },
    {
      id: UserRole.INVESTOR,
      title: "I'm an Investor",
      icon: <TrendingUpIcon className="h-5 w-5" />,
    },
    {
      id: UserRole.EXPLORER,
      title: "Just Exploring",
      icon: <EyeIcon className="h-5 w-5" />,
    },
  ];

  const handleRoleSelect = async () => {
    if (!selectedRole || !user) return;

    setIsSubmitting(true);
    try {
      const response = await apiRequest(`/api/users/${user.id}`, "PATCH", {
        role: selectedRole,
      });
      
      if (response.error) {
        throw new Error(response.error.message || "Failed to update role");
      }
      
      // Update the user data in the cache
      queryClient.setQueryData(["user"], {
        ...user,
        role: selectedRole
      });
      
      toast({
        title: "Role selected",
        description: "Your profile has been updated successfully",
      });
      
      navigate("/");
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update your role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
      <h1 className="text-2xl font-bold text-center mb-6">Choose Your Role</h1>
      <p className="text-gray-600 text-center mb-8">Help us personalize your experience.</p>
      
      <div className="space-y-4">
        {roleOptions.map((role) => (
          <button
            key={role.id}
            className={`w-full flex items-center p-4 border rounded-lg transition
              ${selectedRole === role.id 
                ? 'border-primary bg-blue-50 text-primary' 
                : 'border-gray-200 hover:border-primary hover:bg-blue-50'
              }`}
            onClick={() => setSelectedRole(role.id)}
          >
            <div className="w-8 h-8 mr-4 flex items-center justify-center text-gray-600">
              {role.icon}
            </div>
            <span className="text-lg">{role.title}</span>
          </button>
        ))}
      </div>
      
      <Button
        className="w-full mt-8"
        disabled={!selectedRole || isSubmitting}
        onClick={handleRoleSelect}
      >
        {isSubmitting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : null}
        Continue
      </Button>
      
      <p className="text-xs text-gray-500 mt-4 text-center">
        This information helps us tailor your experience. Investor status can be verified separately through our verification process.
      </p>
    </div>
  );
}

import { Card, CardContent } from "@/components/ui/card";
import { Briefcase } from "lucide-react";

interface ExperienceItemProps {
  experience: {
    id: number;
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description?: string;
    current: boolean;
  };
}

export default function ExperienceItem({ experience }: ExperienceItemProps) {
  const formatDate = (dateString: string) => {
    // Simple date formatting, could be enhanced
    return dateString;
  };
  
  const getDateRange = () => {
    const start = formatDate(experience.startDate);
    const end = experience.current ? 'Present' : 
      (experience.endDate ? formatDate(experience.endDate) : '');
    
    return `${start} - ${end}`;
  };
  
  return (
    <div className="flex mb-6">
      <div className="h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center flex-shrink-0">
        <Briefcase className="h-6 w-6 text-gray-500" />
      </div>
      <div className="ml-4">
        <h4 className="font-medium">{experience.title}</h4>
        <h5 className="text-gray-600">{experience.company}</h5>
        <p className="text-sm text-gray-500">{getDateRange()}</p>
        {experience.description && (
          <p className="text-gray-700 mt-2">{experience.description}</p>
        )}
      </div>
    </div>
  );
}

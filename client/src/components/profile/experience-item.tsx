import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExperienceItemProps {
  experience: {
    id: number;
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    description?: string;
    location?: string;
    current: boolean;
  };
  onEdit?: (experience: any) => void;
  isCurrentUser?: boolean;
}

export default function ExperienceItem({ experience, onEdit, isCurrentUser = false }: ExperienceItemProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short'
      });
    } catch (e) {
      return dateString;
    }
  };
  
  const getDateRange = () => {
    const start = formatDate(experience.startDate);
    const end = experience.current ? 'Present' : 
      (experience.endDate ? formatDate(experience.endDate) : '');
    
    return `${start} - ${end}`;
  };
  
  // Calculate duration
  const getDuration = () => {
    try {
      const startDate = new Date(experience.startDate);
      const endDate = experience.current ? new Date() : new Date(experience.endDate || '');
      
      const years = endDate.getFullYear() - startDate.getFullYear();
      const months = endDate.getMonth() - startDate.getMonth();
      
      let totalMonths = years * 12 + months;
      if (totalMonths < 0) totalMonths = 0;
      
      const durationYears = Math.floor(totalMonths / 12);
      const durationMonths = totalMonths % 12;
      
      let duration = '';
      if (durationYears > 0) {
        duration += `${durationYears} yr${durationYears > 1 ? 's' : ''}`;
      }
      if (durationMonths > 0 || durationYears === 0) {
        if (duration) duration += ' ';
        duration += `${durationMonths} mo${durationMonths > 1 ? 's' : ''}`;
      }
      
      return duration;
    } catch (e) {
      return '';
    }
  };
  
  return (
    <div className="flex mb-6 group relative">
      <div className="h-12 w-12 rounded-md bg-white border border-[#E0E0E0] flex items-center justify-center flex-shrink-0">
        <Briefcase className="h-6 w-6 text-[#0A66C2]" />
      </div>
      <div className="ml-4 flex-1">
        <h4 className="font-semibold text-[#191919] text-base">{experience.title}</h4>
        <h5 className="text-[#191919]">{experience.company}</h5>
        <p className="text-sm text-[#666666]">{getDateRange()} · {getDuration()}</p>
        {experience.location && (
          <p className="text-sm text-[#666666] mt-1">{experience.location}</p>
        )}
        {experience.description && (
          <p className="text-[#191919] mt-3 whitespace-pre-line text-sm">{experience.description}</p>
        )}
      </div>
      
      {/* Edit buttons that appear on hover - visible only to the profile owner */}
      {isCurrentUser && onEdit && (
        <div className="absolute right-0 top-0 hidden group-hover:flex">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 rounded-full text-[#666666] hover:bg-[#F3F2EF]"
            onClick={() => onEdit(experience)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

import { Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EducationItemProps {
  education: {
    id: number;
    school: string;
    degree: string;
    field?: string;
    startDate: string;
    endDate?: string;
    description?: string;
    location?: string;
    current: boolean;
  };
  onEdit?: (education: any) => void;
  isCurrentUser?: boolean;
}

export default function EducationItem({ education, onEdit, isCurrentUser = false }: EducationItemProps) {
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
    const start = formatDate(education.startDate);
    const end = education.current ? 'Present' : 
      (education.endDate ? formatDate(education.endDate) : '');
    
    return `${start} - ${end}`;
  };
  
  return (
    <div className="flex mb-6 group relative">
      <div className="h-12 w-12 rounded-md bg-white border border-[#E0E0E0] flex items-center justify-center flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-[#0A66C2]">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
          <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
        </svg>
      </div>
      <div className="ml-4 flex-1">
        <h4 className="font-semibold text-[#191919] text-base">{education.school}</h4>
        <h5 className="text-[#191919]">{education.degree}{education.field ? `, ${education.field}` : ''}</h5>
        <p className="text-sm text-[#666666]">{getDateRange()}</p>
        {education.location && (
          <p className="text-sm text-[#666666] mt-1">{education.location}</p>
        )}
        {education.description && (
          <p className="text-[#191919] mt-3 whitespace-pre-line text-sm">{education.description}</p>
        )}
      </div>
      
      {/* Edit buttons that appear on hover - visible only to the profile owner */}
      {isCurrentUser && onEdit && (
        <div className="absolute right-0 top-0 hidden group-hover:flex">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 rounded-full text-[#666666] hover:bg-[#F3F2EF]"
            onClick={() => onEdit(education)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
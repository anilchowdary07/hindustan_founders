import { Badge } from "@/components/ui/badge";
import { PlusCircle } from "lucide-react";

interface SkillItemProps {
  skill: string;
  endorsements?: number;
  onEndorse?: () => void;
  isCurrentUser?: boolean;
}

export default function SkillItem({ skill, endorsements = 0, onEndorse, isCurrentUser = false }: SkillItemProps) {
  return (
    <div className="flex items-center justify-between mb-3 group">
      <div className="flex-1">
        <div className="flex items-center">
          <span className="text-[#191919] font-medium">{skill}</span>
          {endorsements > 0 && (
            <Badge variant="outline" className="ml-2 text-xs bg-[#F3F2EF] border-[#E0E0E0] text-[#666666]">
              {endorsements} {endorsements === 1 ? 'endorsement' : 'endorsements'}
            </Badge>
          )}
        </div>
      </div>
      
      {!isCurrentUser && (
        <button 
          onClick={onEndorse}
          className="text-[#0A66C2] text-sm font-medium flex items-center opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          <span>Endorse</span>
        </button>
      )}
    </div>
  );
}
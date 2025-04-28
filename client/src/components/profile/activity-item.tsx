import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ThumbsUp, MessageSquare, Share2 } from "lucide-react";

interface ActivityItemProps {
  activity: {
    id: number;
    content: string;
    createdAt: Date;
    user: {
      id: number;
      name: string;
      avatarUrl?: string;
    };
  };
}

export default function ActivityItem({ activity }: ActivityItemProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getTimeAgo = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };

  return (
    <div className="mb-6">
      <div className="flex items-start">
        <Avatar className="h-12 w-12">
          <AvatarImage src={activity.user.avatarUrl || ""} />
          <AvatarFallback className="bg-primary text-white">
            {getInitials(activity.user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <p className="text-gray-700">
            <span className="font-medium">{activity.user.name}</span> shared this
          </p>
          <p className="text-gray-500 text-sm">{getTimeAgo(activity.createdAt)}</p>
        </div>
      </div>
      
      <div className="mt-3">
        <p className="text-gray-700">{activity.content}</p>
      </div>
      
      <div className="mt-4 flex">
        <Button variant="ghost" size="sm" className="flex items-center text-gray-600">
          <ThumbsUp className="mr-1 h-4 w-4" />
          <span>Like</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex items-center text-gray-600 ml-2">
          <MessageSquare className="mr-1 h-4 w-4" />
          <span>Comment</span>
        </Button>
        <Button variant="ghost" size="sm" className="flex items-center text-gray-600 ml-2">
          <Share2 className="mr-1 h-4 w-4" />
          <span>Share</span>
        </Button>
      </div>
    </div>
  );
}

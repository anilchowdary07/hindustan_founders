import React from "react";
import { cn } from "@/lib/utils";
import { LinkedInAvatar } from "./linkedin-avatar";
import { LinkedInCard, LinkedInCardContent, LinkedInCardActions, LinkedInCardActionButton } from "./linkedin-card";
import { ThumbsUp, MessageSquare, Repeat2, Send, MoreHorizontal, Globe } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface LinkedInPostCardProps {
  author: {
    name: string;
    title?: string;
    avatarUrl?: string;
    verified?: boolean;
  };
  content: string;
  timestamp: Date;
  likes?: number;
  comments?: number;
  shares?: number;
  images?: string[];
  video?: string;
  isLiked?: boolean;
  isShared?: boolean;
  isCommented?: boolean;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onSend?: () => void;
  onMore?: () => void;
  onAuthorClick?: () => void;
  className?: string;
}

/**
 * A post card component that follows LinkedIn's mobile design
 * 
 * @example
 * <LinkedInPostCard
 *   author={{
 *     name: "John Doe",
 *     title: "Software Engineer at Company",
 *     avatarUrl: "/path/to/avatar.jpg",
 *     verified: true
 *   }}
 *   content="This is a post content"
 *   timestamp={new Date()}
 *   likes={42}
 *   comments={5}
 *   shares={2}
 *   images={["/path/to/image.jpg"]}
 * />
 */
export function LinkedInPostCard({
  author,
  content,
  timestamp,
  likes = 0,
  comments = 0,
  shares = 0,
  images = [],
  video,
  isLiked = false,
  isShared = false,
  isCommented = false,
  onLike,
  onComment,
  onShare,
  onSend,
  onMore,
  onAuthorClick,
  className,
}: LinkedInPostCardProps) {
  // Format timestamp
  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true });
  
  return (
    <LinkedInCard className={cn("shadow-sm", className)}>
      {/* Post Header */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-start">
          <LinkedInAvatar
            src={author.avatarUrl}
            alt={author.name}
            fallback={author.name.substring(0, 2).toUpperCase()}
            size="md"
            verified={author.verified}
            onClick={onAuthorClick}
          />
          
          <div className="ml-3 flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h4 
                  className="font-medium text-[#191919] text-sm cursor-pointer hover:text-[#0A66C2] hover:underline"
                  onClick={onAuthorClick}
                >
                  {author.name}
                </h4>
                {author.title && (
                  <p className="text-xs text-[#666666] line-clamp-1">
                    {author.title}
                  </p>
                )}
                <div className="flex items-center text-xs text-[#666666] mt-0.5">
                  <span>{timeAgo}</span>
                  <span className="mx-1">•</span>
                  <Globe className="h-3 w-3 mr-0.5" />
                  <span>Public</span>
                </div>
              </div>
              
              <button 
                className="text-[#666666] hover:text-[#191919] p-1 rounded-full hover:bg-[#F3F2EF]"
                onClick={onMore}
                aria-label="More options"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Post Content */}
      <LinkedInCardContent className="pt-0 pb-1">
        <p className="text-sm text-[#191919] whitespace-pre-line">
          {content}
        </p>
      </LinkedInCardContent>
      
      {/* Post Media */}
      {images.length > 0 && (
        <div className={cn(
          "mt-2",
          images.length === 1 ? "px-0" : "px-4",
          "space-y-1"
        )}>
          {images.length === 1 ? (
            <img 
              src={images[0]} 
              alt="Post attachment" 
              className="w-full object-cover max-h-[400px]"
            />
          ) : (
            <div className={cn(
              "grid gap-1",
              images.length === 2 && "grid-cols-2",
              images.length === 3 && "grid-cols-2",
              images.length >= 4 && "grid-cols-2"
            )}>
              {images.slice(0, 4).map((image, index) => (
                <div 
                  key={index}
                  className={cn(
                    "relative",
                    images.length === 3 && index === 0 && "col-span-2"
                  )}
                >
                  <img 
                    src={image} 
                    alt={`Post attachment ${index + 1}`} 
                    className="w-full h-full object-cover rounded-md"
                    style={{ aspectRatio: images.length === 3 && index === 0 ? "2/1" : "1/1" }}
                  />
                  {images.length > 4 && index === 3 && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
                      <span className="text-white font-medium text-lg">+{images.length - 4}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Video */}
      {video && (
        <div className="mt-2 px-0">
          <video 
            src={video} 
            controls
            className="w-full"
            poster={images[0]}
          />
        </div>
      )}
      
      {/* Engagement Stats */}
      {(likes > 0 || comments > 0 || shares > 0) && (
        <div className="px-4 py-1 flex items-center justify-between text-xs text-[#666666]">
          <div className="flex items-center">
            <ThumbsUp className="h-3.5 w-3.5 text-[#0A66C2] mr-1 fill-[#0A66C2]" />
            <span>{likes}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {comments > 0 && (
              <button className="hover:text-[#0A66C2] hover:underline">
                {comments} {comments === 1 ? 'comment' : 'comments'}
              </button>
            )}
            {shares > 0 && (
              <button className="hover:text-[#0A66C2] hover:underline">
                {shares} {shares === 1 ? 'share' : 'shares'}
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      <LinkedInCardActions>
        <LinkedInCardActionButton 
          onClick={onLike}
          className={cn(isLiked && "text-[#0A66C2]")}
          icon={<ThumbsUp className={cn("h-5 w-5", isLiked && "fill-[#0A66C2]")} />}
          aria-label="Like"
        >
          Like
        </LinkedInCardActionButton>
        
        <LinkedInCardActionButton 
          onClick={onComment}
          className={cn(isCommented && "text-[#0A66C2]")}
          icon={<MessageSquare className="h-5 w-5" />}
          aria-label="Comment"
        >
          Comment
        </LinkedInCardActionButton>
        
        <LinkedInCardActionButton 
          onClick={onShare}
          className={cn(isShared && "text-[#0A66C2]")}
          icon={<Repeat2 className="h-5 w-5" />}
          aria-label="Repost"
        >
          Repost
        </LinkedInCardActionButton>
        
        <LinkedInCardActionButton 
          onClick={onSend}
          icon={<Send className="h-5 w-5" />}
          aria-label="Send"
        >
          Send
        </LinkedInCardActionButton>
      </LinkedInCardActions>
    </LinkedInCard>
  );
}
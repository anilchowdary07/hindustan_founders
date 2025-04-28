import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/layout/layout";
import ProfileCard from "@/components/home/profile-card";
import CreatePost from "@/components/home/create-post";
import PostItem from "@/components/home/post-item";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { user } = useAuth();
  
  const { 
    data: posts, 
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ["/api/posts"],
    enabled: !!user,
  });

  useEffect(() => {
    if (user) {
      refetch();
    }
  }, [user, refetch]);

  const renderPosts = () => {
    if (isLoading) {
      return Array(3).fill(0).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex items-center mb-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="ml-3 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ));
    }

    if (error) {
      return (
        <div className="bg-red-50 p-4 rounded-md text-red-800 mb-4">
          Failed to load posts. Please try again later.
        </div>
      );
    }

    if (posts?.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow-md p-6 text-center mb-4">
          <h3 className="text-lg font-medium mb-2">No posts yet</h3>
          <p className="text-gray-600">
            Be the first to share something with the community!
          </p>
        </div>
      );
    }

    return posts?.map((post: any) => (
      <PostItem key={post.id} post={post} />
    ));
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <ProfileCard />
        
        {/* Center Feed */}
        <div className="md:col-span-2 space-y-4">
          <CreatePost />
          {renderPosts()}
        </div>
      </div>
    </Layout>
  );
}

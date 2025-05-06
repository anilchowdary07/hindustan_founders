import { useEffect } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/layout/layout";
import PitchForm from "@/components/pitch/pitch-form";
import { BusinessPitch } from "@/types/pitch";

export default function EditPitchPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const { id } = router.query;
  
  // Fetch pitch details
  const {
    data: pitch,
    isLoading: pitchLoading,
    error
  } = useQuery({
    queryKey: [`/api/pitches/${id}`],
    queryFn: async () => {
      if (!id) return null;
      
      try {
        const response = await fetch(`/api/pitches/${id}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error("Failed to fetch pitch");
        }
        
        return await response.json();
      } catch (error) {
        console.error("Error fetching pitch:", error);
        throw error;
      }
    },
    enabled: !!id
  });
  
  // Check if user is authorized to edit this pitch
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=/pitches/edit/${id}`);
      return;
    }
    
    if (pitch && user && pitch.userId !== user.id) {
      toast({
        title: "Unauthorized",
        description: "You don't have permission to edit this pitch",
        variant: "destructive",
      });
      router.push(`/pitches/${id}`);
    }
  }, [user, authLoading, pitch, id, router, toast]);
  
  const isLoading = authLoading || pitchLoading;
  
  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-red-500 mb-2">Failed to load pitch details</div>
            <button 
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
              onClick={() => router.push('/pitches')}
            >
              Back to Pitches
            </button>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!pitch) {
    return null;
  }
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PitchForm initialData={pitch as BusinessPitch} isEditing={true} />
      </div>
    </Layout>
  );
}
import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/use-auth";
import Layout from "@/components/layout/layout";
import PitchForm from "@/components/pitch/pitch-form";

export default function CreatePitchPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/pitches/create');
    }
  }, [user, isLoading, router]);
  
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
  
  if (!user) {
    return null; // Will redirect to login
  }
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PitchForm />
      </div>
    </Layout>
  );
}
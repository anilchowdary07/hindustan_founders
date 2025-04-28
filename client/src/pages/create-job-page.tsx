import Layout from "@/components/layout/layout";
import CreateJobForm from "@/components/jobs/create-job-form";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

export default function CreateJobPage() {
  const { user, isLoading } = useAuth();

  // Redirect to auth page if not logged in
  if (!isLoading && !user) {
    return <Redirect to="/auth" />;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Post a Job</h1>
        <div className="bg-card rounded-lg border p-6 shadow-sm">
          <CreateJobForm />
        </div>
      </div>
    </Layout>
  );
}
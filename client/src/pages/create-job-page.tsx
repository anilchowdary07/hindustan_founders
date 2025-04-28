import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/layout/layout";
import CreateJobForm from "@/components/jobs/create-job-form";
import { Button } from "@/components/ui/button";

export default function CreateJobPage() {
  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-6 px-4">
        <div className="mb-6">
          <Link href="/jobs">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" /> 
              Back to Jobs
            </Button>
          </Link>
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Post a New Job</h1>
          <p className="text-muted-foreground mt-2">
            Fill out the form below to list a new job opportunity on Hindustan Founders.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <CreateJobForm />
        </div>
      </div>
    </Layout>
  );
}
import Layout from "@/components/layout/layout";
import JobList from "@/components/jobs/job-list";

export default function JobsPage() {
  return (
    <Layout>
      <div className="container max-w-6xl mx-auto py-6 px-4">
        <JobList />
      </div>
    </Layout>
  );
}
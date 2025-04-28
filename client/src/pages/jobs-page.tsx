import Layout from "@/components/layout/layout";
import JobList from "@/components/jobs/job-list";

export default function JobsPage() {
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <JobList />
      </div>
    </Layout>
  );
}
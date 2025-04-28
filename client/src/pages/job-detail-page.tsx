import Layout from "@/components/layout/layout";
import JobDetail from "@/components/jobs/job-detail";

export default function JobDetailPage() {
  return (
    <Layout>
      <div className="container max-w-6xl mx-auto py-6 px-4">
        <JobDetail />
      </div>
    </Layout>
  );
}
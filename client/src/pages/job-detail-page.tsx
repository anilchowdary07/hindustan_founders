import Layout from "@/components/layout/layout";
import JobDetail from "@/components/jobs/job-detail";

export default function JobDetailPage() {
  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <JobDetail />
      </div>
    </Layout>
  );
}
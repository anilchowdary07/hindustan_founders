import { useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/layout/layout";
import PitchList from "@/components/pitch/pitch-list";
import { PitchFilters } from "@/types/pitch";

export default function PitchesPage() {
  const router = useRouter();
  const { category, stage, status, search, sort } = router.query;
  
  // Parse query params for filters
  const initialFilters: Partial<PitchFilters> = {
    category: category as string || 'All',
    stage: stage as string || 'All',
    status: status as string || 'All',
    search: search as string || '',
    sort: sort as 'newest' | 'popular' | 'trending' | 'funding' || 'newest',
  };
  
  // Update URL when filters change
  useEffect(() => {
    // This is handled by the PitchList component internally
  }, []);
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PitchList 
          title="Startup Pitches"
          initialFilters={initialFilters}
          showFilters={true}
          showCreate={true}
          variant="default"
          columns={3}
        />
      </div>
    </Layout>
  );
}
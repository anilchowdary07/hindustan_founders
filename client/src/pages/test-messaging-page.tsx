import Layout from "@/components/layout/layout";

export default function TestMessagingPage() {
  return (
    <Layout>
      <div className="container mx-auto py-4">
        <div className="bg-white p-8 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-4">Test Messaging Page</h1>
          <p className="text-gray-600 mb-4">This is a simple test page to check if routing works correctly.</p>
          <div className="p-4 bg-blue-100 rounded">
            <p>If you can see this, the page is rendering correctly!</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
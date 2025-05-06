import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bookmark, Info, BookmarkX, ExternalLink } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useSavedItems } from "@/hooks/use-saved-items";
import { useToast } from "@/hooks/use-toast";

export default function SavedPostsPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { savedItems, removeItem, isLoading, getItemsByType } = useSavedItems();
  
  // Get only posts and articles
  const savedPosts = savedItems.filter(item => 
    item.type === 'post' || item.type === 'article'
  );

  const handleRemoveItem = (id: string) => {
    removeItem(id);
    toast({
      title: "Item removed",
      description: "The item has been removed from your saved items."
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Layout>
      <div className="container max-w-4xl mx-auto py-6 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bookmark className="h-6 w-6" />
            Saved Posts
          </h1>
          <p className="text-muted-foreground mt-2">
            View and manage your saved posts and articles
          </p>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin h-8 w-8 border-2 border-[#0077B5] border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-2 text-[#666666]">Loading saved posts...</p>
          </div>
        ) : savedPosts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>No saved posts yet</AlertTitle>
                <AlertDescription>
                  When you save posts, they will appear here for easy access.
                </AlertDescription>
              </Alert>
              <div className="mt-4 text-center">
                <Button onClick={() => navigate('/saved-items')}>
                  View All Saved Items
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {savedPosts.map((post) => (
              <Card key={post.id} className="relative group">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{post.title}</CardTitle>
                      <CardDescription>Saved on {formatDate(post.savedAt)}</CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-[#666666] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveItem(post.id)}
                    >
                      <BookmarkX className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {post.description && (
                    <p className="text-[#666666] mb-4">{post.description}</p>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-[#0A66C2]"
                    onClick={() => navigate(post.url)}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View {post.type}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
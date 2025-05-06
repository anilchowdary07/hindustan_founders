import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, AlertCircle, CheckCircle2, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api";
import { initializeDemoData } from "@/lib/demo-data";

export function DemoDataLoader() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const loadDemoData = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);
      setStatus("loading");
      setStatusMessage("Initializing demo data...");
      setProgress(10);

      // Add progress updates
      const updateProgress = (message: string, progressValue: number) => {
        setStatusMessage(message);
        setProgress(progressValue);
      };

      // Simulate progress steps
      updateProgress("Adding demo users...", 20);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      updateProgress("Adding demo posts and comments...", 35);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      updateProgress("Adding demo jobs and pitches...", 50);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      updateProgress("Adding demo articles and events...", 65);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      updateProgress("Adding connections and messages...", 80);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      updateProgress("Finalizing demo data...", 95);

      // Initialize demo data
      const result = await initializeDemoData(apiRequest);

      if (result.success) {
        setStatus("success");
        setStatusMessage("Demo data loaded successfully!");
        setProgress(100);
        toast({
          title: "Success",
          description: "Demo data has been loaded successfully.",
        });
      } else {
        throw new Error(result.error ? result.error.toString() : "Failed to load demo data");
      }
    } catch (error) {
      console.error("Error loading demo data:", error);
      setStatus("error");
      setStatusMessage(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      toast({
        title: "Error",
        description: "Failed to load demo data. See console for details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-primary" />
          <CardTitle>Demo Data Loader</CardTitle>
        </div>
        <CardDescription>
          Load sample data into the application for testing and demonstration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          This will populate the application with sample:
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">Users</Badge>
          <Badge variant="outline">Posts</Badge>
          <Badge variant="outline">Comments</Badge>
          <Badge variant="outline">Jobs</Badge>
          <Badge variant="outline">Articles</Badge>
          <Badge variant="outline">Events</Badge>
          <Badge variant="outline">Pitches</Badge>
          <Badge variant="outline">Messages</Badge>
          <Badge variant="outline">Connections</Badge>
          <Badge variant="outline">Notifications</Badge>
        </div>

        {status !== "idle" && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <div className="flex items-center gap-2 text-sm">
              {status === "loading" && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
              {status === "success" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              {status === "error" && <AlertCircle className="h-4 w-4 text-destructive" />}
              <span className={status === "error" ? "text-destructive" : ""}>{statusMessage}</span>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={loadDemoData} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading Demo Data...
            </>
          ) : (
            "Load Demo Data"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

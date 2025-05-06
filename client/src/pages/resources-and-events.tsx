import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/hooks/use-auth";
import ArticleBrowser from "@/components/resources/article-browser";
import EventBrowser from "@/components/events/event-browser";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Calendar,
  ChevronRight,
  FileText,
  CalendarPlus,
  Bookmark,
  Users,
} from "lucide-react";

export default function ResourcesAndEventsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { tab } = router.query;
  
  const [activeTab, setActiveTab] = useState(
    typeof tab === 'string' ? tab : 'articles'
  );
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resources & Events</h1>
          <p className="text-gray-600 mt-1">
            Discover insights, connect with the community, and grow your startup
          </p>
        </div>
        
        {user && (
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => router.push('/resources-dashboard')}
            >
              Manage Content
            </Button>
            <Button 
              onClick={() => router.push(activeTab === 'articles' ? '/resources/create' : '/events/create')}
              className="bg-primary hover:bg-primary/90"
            >
              {activeTab === 'articles' ? (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Create Article
                </>
              ) : (
                <>
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  Host Event
                </>
              )}
            </Button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => router.push('/resources?tab=trending')}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Trending Articles
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => router.push('/events?tab=featured')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Featured Events
              </Button>
              {user && (
                <>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => router.push('/resources?tab=bookmarked')}
                  >
                    <Bookmark className="h-4 w-4 mr-2" />
                    Saved Articles
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={() => router.push('/events?tab=registered')}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    My Events
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Featured Resources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium text-sm mb-2">Startup Guides</h3>
                <ul className="space-y-1">
                  <li>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-sm"
                      onClick={() => router.push('/resources/articles/startup-guide')}
                    >
                      The Ultimate Startup Guide
                    </Button>
                  </li>
                  <li>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-sm"
                      onClick={() => router.push('/resources/articles/fundraising')}
                    >
                      Fundraising Strategies
                    </Button>
                  </li>
                  <li>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-sm"
                      onClick={() => router.push('/resources/articles/product-market-fit')}
                    >
                      Finding Product-Market Fit
                    </Button>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-sm mb-2">Upcoming Events</h3>
                <ul className="space-y-1">
                  <li>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-sm"
                      onClick={() => router.push('/events/pitch-competition')}
                    >
                      Founder Pitch Competition
                    </Button>
                  </li>
                  <li>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-sm"
                      onClick={() => router.push('/events/networking-mixer')}
                    >
                      Networking Mixer
                    </Button>
                  </li>
                  <li>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-sm"
                      onClick={() => router.push('/events/workshop')}
                    >
                      Growth Marketing Workshop
                    </Button>
                  </li>
                </ul>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => router.push('/resources/featured')}
              >
                View All Featured Resources
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
              <TabsTrigger value="articles" className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2" />
                Articles & Insights
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Events & Meetups
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="articles" className="mt-0">
              <ArticleBrowser showCreateButton={false} />
            </TabsContent>
            
            <TabsContent value="events" className="mt-0">
              <EventBrowser showCreateButton={false} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
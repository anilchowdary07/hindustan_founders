import React, { useState } from "react";
import { useLocation } from "wouter";
import { 
  LinkedInCard, 
  LinkedInCardContent, 
  LinkedInCardHeader,
  LinkedInCardFooter,
  LinkedInButton,
  LinkedInTabs,
  LinkedInTabPanel
} from "../ui/linkedin-ui";
import { LinkedInAvatar } from "../ui/linkedin-avatar";
import { 
  UserPlus, 
  X, 
  Check, 
  Users, 
  Building2, 
  Calendar, 
  ChevronRight,
  Mail
} from "lucide-react";

interface Connection {
  id: string;
  name: string;
  title?: string;
  avatarUrl?: string;
  company?: string;
  mutualConnections?: number;
  isConnected?: boolean;
  isPending?: boolean;
}

interface LinkedInNetworkProps {
  connections: Connection[];
  pendingConnections: Connection[];
  suggestions: Connection[];
  events?: any[];
  groups?: any[];
  pages?: any[];
  isLoading?: boolean;
  onConnect?: (userId: string) => void;
  onIgnore?: (userId: string) => void;
  onAccept?: (userId: string) => void;
  onMessage?: (userId: string) => void;
}

export function LinkedInNetwork({ 
  connections = [], 
  pendingConnections = [], 
  suggestions = [],
  events = [],
  groups = [],
  pages = [],
  isLoading = false,
  onConnect,
  onIgnore,
  onAccept,
  onMessage
}: LinkedInNetworkProps) {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("connections");
  
  // Network tabs
  const networkTabs = [
    { id: "connections", label: "Connections", count: connections.length },
    { id: "people", label: "People", count: suggestions.length },
    { id: "groups", label: "Groups", count: groups.length },
    { id: "pages", label: "Pages", count: pages.length },
    { id: "events", label: "Events", count: events.length },
  ];
  
  // Render connection card
  const renderConnectionCard = (connection: Connection) => (
    <div key={connection.id} className="flex items-start">
      <LinkedInAvatar
        src={connection.avatarUrl}
        alt={connection.name}
        fallback={connection.name.substring(0, 2).toUpperCase()}
        size="md"
        onClick={() => navigate(`/profile/${connection.id}`)}
      />
      
      <div className="ml-3 flex-1 min-w-0">
        <h3 
          className="text-sm font-medium text-[#191919] hover:text-[#0A66C2] hover:underline cursor-pointer"
          onClick={() => navigate(`/profile/${connection.id}`)}
        >
          {connection.name}
        </h3>
        
        {connection.title && (
          <p className="text-xs text-[#666666] line-clamp-1 mt-0.5">
            {connection.title}
          </p>
        )}
        
        {connection.company && (
          <p className="text-xs text-[#666666] mt-0.5">
            {connection.company}
          </p>
        )}
        
        {connection.mutualConnections !== undefined && connection.mutualConnections > 0 && (
          <p className="text-xs text-[#666666] mt-1 flex items-center">
            <Users className="h-3 w-3 mr-1" />
            {connection.mutualConnections} mutual connection{connection.mutualConnections !== 1 ? 's' : ''}
          </p>
        )}
      </div>
    </div>
  );
  
  return (
    <div className="max-w-xl mx-auto">
      {/* Tabs */}
      <LinkedInTabs
        tabs={networkTabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        variant="underline"
        scrollable
        className="bg-white sticky top-14 z-10 mb-3"
      />
      
      {/* Pending Invitations */}
      {pendingConnections.length > 0 && activeTab === "connections" && (
        <LinkedInCard className="mb-3">
          <LinkedInCardHeader>
            <h2 className="text-base font-medium text-[#191919]">
              Pending invitations ({pendingConnections.length})
            </h2>
          </LinkedInCardHeader>
          
          <LinkedInCardContent className="p-0">
            <div className="divide-y divide-[#E0E0E0]">
              {pendingConnections.map((connection) => (
                <div key={connection.id} className="p-4">
                  <div className="flex items-start">
                    {renderConnectionCard(connection)}
                    
                    <div className="flex items-center ml-2 mt-1">
                      <button
                        className="p-1.5 text-[#666666] hover:text-[#191919] hover:bg-[#F3F2EF] rounded-full"
                        onClick={() => onIgnore && onIgnore(connection.id)}
                        aria-label="Ignore"
                      >
                        <X className="h-5 w-5" />
                      </button>
                      
                      <button
                        className="p-1.5 text-[#666666] hover:text-[#191919] hover:bg-[#F3F2EF] rounded-full ml-1"
                        onClick={() => onAccept && onAccept(connection.id)}
                        aria-label="Accept"
                      >
                        <Check className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </LinkedInCardContent>
          
          {pendingConnections.length > 3 && (
            <LinkedInCardFooter>
              <button 
                className="w-full text-center text-sm text-[#0A66C2] font-medium py-1 hover:bg-[#EEF3F8] rounded-md"
                onClick={() => navigate("/network/invitations")}
              >
                Show more
              </button>
            </LinkedInCardFooter>
          )}
        </LinkedInCard>
      )}
      
      {/* Tab Content */}
      <LinkedInTabPanel id="connections" activeTab={activeTab}>
        {connections.length > 0 ? (
          <LinkedInCard>
            <LinkedInCardHeader className="flex justify-between items-center">
              <h2 className="text-base font-medium text-[#191919]">
                Your connections ({connections.length})
              </h2>
              
              <button 
                className="text-sm text-[#0A66C2] font-medium"
                onClick={() => navigate("/network/connections")}
              >
                See all
              </button>
            </LinkedInCardHeader>
            
            <LinkedInCardContent className="p-0">
              <div className="divide-y divide-[#E0E0E0]">
                {connections.slice(0, 5).map((connection) => (
                  <div key={connection.id} className="p-4">
                    <div className="flex items-start justify-between">
                      {renderConnectionCard(connection)}
                      
                      <LinkedInButton
                        variant="secondary"
                        size="sm"
                        className="mt-1 ml-2"
                        onClick={() => onMessage && onMessage(connection.id)}
                        icon={<Mail className="h-4 w-4" />}
                      >
                        Message
                      </LinkedInButton>
                    </div>
                  </div>
                ))}
              </div>
            </LinkedInCardContent>
          </LinkedInCard>
        ) : (
          <LinkedInCard>
            <LinkedInCardContent>
              <div className="text-center py-8">
                <h3 className="text-lg font-medium text-[#191919] mb-2">No connections yet</h3>
                <p className="text-sm text-[#666666] mb-4">
                  Connect with people to grow your network
                </p>
                <LinkedInButton
                  variant="primary"
                  onClick={() => setActiveTab("people")}
                >
                  Find connections
                </LinkedInButton>
              </div>
            </LinkedInCardContent>
          </LinkedInCard>
        )}
      </LinkedInTabPanel>
      
      <LinkedInTabPanel id="people" activeTab={activeTab}>
        <LinkedInCard className="mb-3">
          <LinkedInCardHeader>
            <h2 className="text-base font-medium text-[#191919]">
              People you may know
            </h2>
          </LinkedInCardHeader>
          
          <LinkedInCardContent className="p-0">
            {suggestions.length > 0 ? (
              <div className="divide-y divide-[#E0E0E0]">
                {suggestions.map((suggestion) => (
                  <div key={suggestion.id} className="p-4">
                    <div className="flex items-start justify-between">
                      {renderConnectionCard(suggestion)}
                      
                      <LinkedInButton
                        variant="secondary"
                        size="sm"
                        className="mt-1 ml-2"
                        onClick={() => onConnect && onConnect(suggestion.id)}
                        icon={<UserPlus className="h-4 w-4" />}
                      >
                        Connect
                      </LinkedInButton>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-[#666666]">
                  No suggestions available at the moment
                </p>
              </div>
            )}
          </LinkedInCardContent>
        </LinkedInCard>
      </LinkedInTabPanel>
      
      <LinkedInTabPanel id="groups" activeTab={activeTab}>
        <LinkedInCard>
          <LinkedInCardHeader className="flex justify-between items-center">
            <h2 className="text-base font-medium text-[#191919]">
              Groups you might like
            </h2>
            
            <button 
              className="text-sm text-[#0A66C2] font-medium"
              onClick={() => navigate("/groups/discover")}
            >
              Discover more
            </button>
          </LinkedInCardHeader>
          
          <LinkedInCardContent className="p-0">
            {groups.length > 0 ? (
              <div className="divide-y divide-[#E0E0E0]">
                {groups.map((group) => (
                  <div key={group.id} className="p-4">
                    <div className="flex items-start">
                      <div className="h-10 w-10 bg-[#EEF3F8] rounded-md flex items-center justify-center mr-3">
                        <Users className="h-5 w-5 text-[#0A66C2]" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 
                          className="text-sm font-medium text-[#191919] hover:text-[#0A66C2] hover:underline cursor-pointer"
                          onClick={() => navigate(`/groups/${group.id}`)}
                        >
                          {group.name}
                        </h3>
                        
                        <p className="text-xs text-[#666666] mt-0.5">
                          {group.members} members
                        </p>
                        
                        <div className="mt-2">
                          <LinkedInButton
                            variant="secondary"
                            size="sm"
                          >
                            Join
                          </LinkedInButton>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-[#666666]">
                  No groups available at the moment
                </p>
                <LinkedInButton
                  variant="primary"
                  className="mt-3"
                  onClick={() => navigate("/groups/discover")}
                >
                  Discover groups
                </LinkedInButton>
              </div>
            )}
          </LinkedInCardContent>
        </LinkedInCard>
      </LinkedInTabPanel>
      
      <LinkedInTabPanel id="pages" activeTab={activeTab}>
        <LinkedInCard>
          <LinkedInCardHeader className="flex justify-between items-center">
            <h2 className="text-base font-medium text-[#191919]">
              Pages to follow
            </h2>
            
            <button 
              className="text-sm text-[#0A66C2] font-medium"
              onClick={() => navigate("/pages/discover")}
            >
              Discover more
            </button>
          </LinkedInCardHeader>
          
          <LinkedInCardContent className="p-0">
            {pages.length > 0 ? (
              <div className="divide-y divide-[#E0E0E0]">
                {pages.map((page) => (
                  <div key={page.id} className="p-4">
                    <div className="flex items-start">
                      <div className="h-10 w-10 bg-[#EEF3F8] rounded-md flex items-center justify-center mr-3">
                        <Building2 className="h-5 w-5 text-[#0A66C2]" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 
                          className="text-sm font-medium text-[#191919] hover:text-[#0A66C2] hover:underline cursor-pointer"
                          onClick={() => navigate(`/company/${page.id}`)}
                        >
                          {page.name}
                        </h3>
                        
                        <p className="text-xs text-[#666666] mt-0.5">
                          {page.followers} followers
                        </p>
                        
                        <div className="mt-2">
                          <LinkedInButton
                            variant="secondary"
                            size="sm"
                          >
                            Follow
                          </LinkedInButton>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-[#666666]">
                  No pages available at the moment
                </p>
                <LinkedInButton
                  variant="primary"
                  className="mt-3"
                  onClick={() => navigate("/pages/discover")}
                >
                  Discover pages
                </LinkedInButton>
              </div>
            )}
          </LinkedInCardContent>
        </LinkedInCard>
      </LinkedInTabPanel>
      
      <LinkedInTabPanel id="events" activeTab={activeTab}>
        <LinkedInCard>
          <LinkedInCardHeader className="flex justify-between items-center">
            <h2 className="text-base font-medium text-[#191919]">
              Upcoming events
            </h2>
            
            <button 
              className="text-sm text-[#0A66C2] font-medium"
              onClick={() => navigate("/events")}
            >
              See all
            </button>
          </LinkedInCardHeader>
          
          <LinkedInCardContent className="p-0">
            {events.length > 0 ? (
              <div className="divide-y divide-[#E0E0E0]">
                {events.map((event) => (
                  <div key={event.id} className="p-4">
                    <div className="flex items-start">
                      <div className="h-10 w-10 bg-[#EEF3F8] rounded-md flex items-center justify-center mr-3">
                        <Calendar className="h-5 w-5 text-[#0A66C2]" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 
                          className="text-sm font-medium text-[#191919] hover:text-[#0A66C2] hover:underline cursor-pointer"
                          onClick={() => navigate(`/events/${event.id}`)}
                        >
                          {event.title}
                        </h3>
                        
                        <p className="text-xs text-[#666666] mt-0.5">
                          {event.date} • {event.attendees} attendees
                        </p>
                        
                        <div className="mt-2">
                          <LinkedInButton
                            variant="secondary"
                            size="sm"
                          >
                            Interested
                          </LinkedInButton>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-[#666666]">
                  No events available at the moment
                </p>
                <LinkedInButton
                  variant="primary"
                  className="mt-3"
                  onClick={() => navigate("/events/discover")}
                >
                  Discover events
                </LinkedInButton>
              </div>
            )}
          </LinkedInCardContent>
        </LinkedInCard>
      </LinkedInTabPanel>
      
      {/* Manage Network Section */}
      {activeTab === "connections" && (
        <LinkedInCard className="mt-3">
          <LinkedInCardHeader>
            <h2 className="text-base font-medium text-[#191919]">
              Manage my network
            </h2>
          </LinkedInCardHeader>
          
          <LinkedInCardContent className="p-0">
            <div className="divide-y divide-[#E0E0E0]">
              <button 
                className="w-full p-4 flex items-center justify-between hover:bg-[#F3F2EF] transition-colors text-left"
                onClick={() => navigate("/network/connections")}
              >
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-[#666666] mr-3" />
                  <span className="text-sm text-[#191919]">Connections</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-[#666666] mr-2">{connections.length}</span>
                  <ChevronRight className="h-5 w-5 text-[#666666]" />
                </div>
              </button>
              
              <button 
                className="w-full p-4 flex items-center justify-between hover:bg-[#F3F2EF] transition-colors text-left"
                onClick={() => navigate("/network/contacts")}
              >
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-[#666666] mr-3" />
                  <span className="text-sm text-[#191919]">Contacts</span>
                </div>
                <ChevronRight className="h-5 w-5 text-[#666666]" />
              </button>
              
              <button 
                className="w-full p-4 flex items-center justify-between hover:bg-[#F3F2EF] transition-colors text-left"
                onClick={() => navigate("/network/following")}
              >
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-[#666666] mr-3" />
                  <span className="text-sm text-[#191919]">Following & followers</span>
                </div>
                <ChevronRight className="h-5 w-5 text-[#666666]" />
              </button>
              
              <button 
                className="w-full p-4 flex items-center justify-between hover:bg-[#F3F2EF] transition-colors text-left"
                onClick={() => navigate("/network/groups")}
              >
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-[#666666] mr-3" />
                  <span className="text-sm text-[#191919]">Groups</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-[#666666] mr-2">{groups.length}</span>
                  <ChevronRight className="h-5 w-5 text-[#666666]" />
                </div>
              </button>
              
              <button 
                className="w-full p-4 flex items-center justify-between hover:bg-[#F3F2EF] transition-colors text-left"
                onClick={() => navigate("/network/events")}
              >
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-[#666666] mr-3" />
                  <span className="text-sm text-[#191919]">Events</span>
                </div>
                <ChevronRight className="h-5 w-5 text-[#666666]" />
              </button>
              
              <button 
                className="w-full p-4 flex items-center justify-between hover:bg-[#F3F2EF] transition-colors text-left"
                onClick={() => navigate("/network/pages")}
              >
                <div className="flex items-center">
                  <Building2 className="h-5 w-5 text-[#666666] mr-3" />
                  <span className="text-sm text-[#191919]">Pages</span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-[#666666] mr-2">{pages.length}</span>
                  <ChevronRight className="h-5 w-5 text-[#666666]" />
                </div>
              </button>
            </div>
          </LinkedInCardContent>
        </LinkedInCard>
      )}
    </div>
  );
}
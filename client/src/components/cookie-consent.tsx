import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";

export default function CookieConsent() {
  const [, navigate] = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAcceptedCookies = localStorage.getItem("cookieConsent");
    if (!hasAcceptedCookies) {
      // Show the banner after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setIsVisible(false);
  };

  const declineCookies = () => {
    localStorage.setItem("cookieConsent", "declined");
    setIsVisible(false);
  };

  const viewCookiePolicy = () => {
    navigate("/cookie-policy");
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-4 md:p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-shrink-0 bg-primary/10 p-2 rounded-full hidden md:flex">
            <Cookie className="h-6 w-6 text-primary" />
          </div>
          
          <div className="flex-grow">
            <h3 className="text-lg font-medium mb-1 flex items-center">
              <Cookie className="h-5 w-5 text-primary mr-2 md:hidden" />
              Cookie Consent
            </h3>
            <p className="text-gray-600 text-sm md:text-base">
              We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies as described in our Cookie Policy.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={viewCookiePolicy}
              className="whitespace-nowrap"
            >
              Cookie Policy
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={declineCookies}
              className="whitespace-nowrap"
            >
              Decline
            </Button>
            <Button 
              size="sm" 
              onClick={acceptCookies}
              className="whitespace-nowrap"
            >
              Accept All
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={declineCookies} 
            className="absolute top-2 right-2 md:static"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
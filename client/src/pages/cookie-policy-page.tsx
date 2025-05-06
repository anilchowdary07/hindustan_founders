import Layout from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Cookie, Info, Clock, Database, Shield, Settings, ExternalLink } from "lucide-react";

export default function CookiePolicyPage() {
  const [, navigate] = useLocation();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
          <p className="text-xl text-gray-600">
            How we use cookies and similar technologies
          </p>
          <p className="text-gray-500 mt-2">Last updated: May 5, 2025</p>
        </div>

        {/* Introduction */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Cookie className="h-6 w-6 text-primary" />
              <CardTitle>Introduction</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              This Cookie Policy explains how Hindustan Founders Network ("we", "us", or "our") uses cookies and similar technologies to recognize you when you visit our website at <span className="font-medium">hindustanfounders.net</span> ("Website"). It explains what these technologies are and why we use them, as well as your rights to control our use of them.
            </p>
            <p>
              In some cases, we may use cookies to collect personal information, or that becomes personal information if we combine it with other information.
            </p>
            <p>
              This Cookie Policy should be read together with our Privacy Policy and Terms of Service.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Button variant="outline" size="sm" onClick={() => navigate("/privacy-policy")}>
                Privacy Policy
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate("/terms-of-service")}>
                Terms of Service
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* What are cookies */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Info className="h-6 w-6 text-primary" />
              <CardTitle>What Are Cookies?</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
            </p>
            <p>
              Cookies set by the website owner (in this case, Hindustan Founders Network) are called "first-party cookies". Cookies set by parties other than the website owner are called "third-party cookies". Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., advertising, interactive content, and analytics). The parties that set these third-party cookies can recognize your computer both when it visits the website in question and also when it visits certain other websites.
            </p>
          </CardContent>
        </Card>

        {/* Why we use cookies */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-primary" />
              <CardTitle>Why Do We Use Cookies?</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We use first and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our Online Properties. Third parties serve cookies through our Website for advertising, analytics, and other purposes.
            </p>
            <p>
              The specific types of first and third-party cookies served through our Website and the purposes they perform are described below:
            </p>
          </CardContent>
        </Card>

        {/* Types of cookies we use */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Database className="h-6 w-6 text-primary" />
              <CardTitle>Types of Cookies We Use</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Essential Cookies</h3>
              <p>
                These cookies are strictly necessary to provide you with services available through our Website and to use some of its features, such as access to secure areas. Because these cookies are strictly necessary to deliver the Website, you cannot refuse them without impacting how our Website functions.
              </p>
              <div className="bg-gray-50 p-4 rounded-md mt-3">
                <p className="text-sm font-medium">Examples:</p>
                <ul className="list-disc pl-5 text-sm mt-1 space-y-1">
                  <li>Session cookies for managing user authentication</li>
                  <li>Security cookies for detecting authentication abuses</li>
                  <li>Essential functionality cookies that remember your preferences</li>
                </ul>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-2">Performance and Functionality Cookies</h3>
              <p>
                These cookies are used to enhance the performance and functionality of our Website but are non-essential to their use. However, without these cookies, certain functionality may become unavailable.
              </p>
              <div className="bg-gray-50 p-4 rounded-md mt-3">
                <p className="text-sm font-medium">Examples:</p>
                <ul className="list-disc pl-5 text-sm mt-1 space-y-1">
                  <li>Cookies that remember your preferred language or region</li>
                  <li>Cookies that remember your registration information</li>
                  <li>Cookies that allow for personalized content</li>
                </ul>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-2">Analytics and Customization Cookies</h3>
              <p>
                These cookies collect information that is used either in aggregate form to help us understand how our Website is being used or how effective our marketing campaigns are, or to help us customize our Website for you in order to enhance your experience.
              </p>
              <div className="bg-gray-50 p-4 rounded-md mt-3">
                <p className="text-sm font-medium">Examples:</p>
                <ul className="list-disc pl-5 text-sm mt-1 space-y-1">
                  <li>Google Analytics cookies to track user behavior and measure site performance</li>
                  <li>Cookies that help us understand which pages are most popular</li>
                  <li>Cookies that remember your choices and preferences on our site</li>
                </ul>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-2">Advertising Cookies</h3>
              <p>
                These cookies are used to make advertising messages more relevant to you. They perform functions like preventing the same ad from continuously reappearing, ensuring that ads are properly displayed for advertisers, and in some cases selecting advertisements that are based on your interests.
              </p>
              <div className="bg-gray-50 p-4 rounded-md mt-3">
                <p className="text-sm font-medium">Examples:</p>
                <ul className="list-disc pl-5 text-sm mt-1 space-y-1">
                  <li>Cookies used by advertising partners to build a profile of your interests</li>
                  <li>Cookies that limit the number of times you see an advertisement</li>
                  <li>Cookies used to measure the effectiveness of advertising campaigns</li>
                </ul>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium mb-2">Social Media Cookies</h3>
              <p>
                These cookies are used to enable you to share pages and content that you find interesting on our Website through third-party social networking and other websites. These cookies may also be used for advertising purposes.
              </p>
              <div className="bg-gray-50 p-4 rounded-md mt-3">
                <p className="text-sm font-medium">Examples:</p>
                <ul className="list-disc pl-5 text-sm mt-1 space-y-1">
                  <li>Cookies set by Facebook, Twitter, and LinkedIn to enable content sharing</li>
                  <li>Cookies that help track referrals from social media platforms</li>
                  <li>Cookies used by social media platforms when you are logged in while browsing our site</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How to control cookies */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Settings className="h-6 w-6 text-primary" />
              <CardTitle>How Can You Control Cookies?</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in the Cookie Consent Manager. The Cookie Consent Manager allows you to select which categories of cookies you accept or reject. Essential cookies cannot be rejected as they are strictly necessary to provide you with services.
            </p>
            <p>
              The Cookie Consent Manager can be found in the notification banner and on our website. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted. You may also set or amend your web browser controls to accept or refuse cookies.
            </p>
            <p className="font-medium mt-4">
              Browser Controls:
            </p>
            <p>
              The specific way to manage cookies via your web browser controls varies from browser to browser. You should visit your browser's help menu for more information:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>
                <a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">
                  Chrome <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
              <li>
                <a href="https://support.mozilla.org/en-US/kb/enhanced-tracking-protection-firefox-desktop" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">
                  Firefox <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
              <li>
                <a href="https://support.microsoft.com/en-us/microsoft-edge/delete-cookies-in-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">
                  Microsoft Edge <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
              <li>
                <a href="https://support.apple.com/guide/safari/manage-cookies-and-website-data-sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center">
                  Safari <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Cookie Lifespan */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-primary" />
              <CardTitle>How Long Will Cookies Stay On Your Device?</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              The length of time that a cookie remains on your device depends on whether it is a "persistent" or "session" cookie. Session cookies last until you stop browsing and persistent cookies last until they expire or are deleted.
            </p>
            <p>
              Most of the cookies we use are persistent and will expire between 30 minutes and two years from the date they are downloaded to your device. See the section below on how to control cookies for more information on removing them before they expire.
            </p>
          </CardContent>
        </Card>

        {/* Updates to policy */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <CardTitle>Updates to This Cookie Policy</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore revisit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
            </p>
            <p>
              The date at the top of this Cookie Policy indicates when it was last updated.
            </p>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Us</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              If you have any questions about our use of cookies or other technologies, please contact us at:
            </p>
            <div className="mt-4">
              <p className="font-medium">Hindustan Founders Network</p>
              <p>Level 8, Cyber Tower</p>
              <p>Hitech City, Hyderabad</p>
              <p>Telangana, India - 500081</p>
              <p className="mt-2">Email: privacy@hindustanfounders.net</p>
              <p>Phone: +91 98765 43210</p>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              <Button onClick={() => navigate("/privacy-policy")}>
                Privacy Policy
              </Button>
              <Button variant="outline" onClick={() => navigate("/terms-of-service")}>
                Terms of Service
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, Check, Star } from "lucide-react";

export default function PremiumPage() {
  return (
    <Layout>
      <div className="container max-w-5xl mx-auto py-6 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-2 mb-4">
            <Crown className="h-8 w-8 text-yellow-500" />
            Hindustan Founders Premium
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock exclusive features and opportunities to accelerate your professional growth
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Basic Plan */}
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl">Basic</CardTitle>
              <CardDescription>Free forever</CardDescription>
              <div className="mt-4 text-3xl font-bold">₹0</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {[
                  "Professional profile",
                  "Connect with other professionals",
                  "Access to job listings",
                  "Basic messaging"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Current Plan</Button>
            </CardFooter>
          </Card>

          {/* Premium Plan */}
          <Card className="border-2 border-primary relative">
            <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-sm font-medium rounded-bl-lg rounded-tr-lg">
              POPULAR
            </div>
            <CardHeader>
              <CardTitle className="text-xl">Premium</CardTitle>
              <CardDescription>Monthly billing</CardDescription>
              <div className="mt-4 text-3xl font-bold">₹999<span className="text-sm font-normal text-muted-foreground">/month</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {[
                  "All Basic features",
                  "See who viewed your profile",
                  "Advanced search filters",
                  "Priority messaging",
                  "Featured job applications",
                  "Premium badge on profile"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Upgrade Now</Button>
            </CardFooter>
          </Card>

          {/* Enterprise Plan */}
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl">Enterprise</CardTitle>
              <CardDescription>For organizations</CardDescription>
              <div className="mt-4 text-3xl font-bold">₹4999<span className="text-sm font-normal text-muted-foreground">/month</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {[
                  "All Premium features",
                  "Company branding",
                  "Unlimited job postings",
                  "Team management",
                  "Analytics dashboard",
                  "API access",
                  "Dedicated support"
                ].map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">Contact Sales</Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Why Choose Premium?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Stand Out</h3>
              <p className="text-muted-foreground">Get featured in search results and job applications</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Exclusive Access</h3>
              <p className="text-muted-foreground">Connect with top investors and founders in India</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Advanced Tools</h3>
              <p className="text-muted-foreground">Access premium analytics and business tools</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
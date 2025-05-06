import { useState } from "react";
import Layout from "@/components/layout/layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Crown, 
  Check, 
  Star, 
  Zap, 
  Users, 
  BarChart, 
  Search, 
  MessageSquare, 
  Calendar, 
  FileText,
  Lock,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  X
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function PremiumFeaturesPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("features");

  // Premium features data
  const premiumFeatures = [
    {
      id: 1,
      title: "Enhanced Visibility",
      description: "Get featured in search results and recommendations to increase your profile visibility.",
      icon: <Star className="h-8 w-8 text-yellow-500" />,
      benefits: [
        "Featured profile in search results",
        "Priority placement in recommendations",
        "Highlighted profile badge",
        "Increased visibility in job applications",
        "Featured in 'Top Professionals' section"
      ]
    },
    {
      id: 2,
      title: "Advanced Networking",
      description: "Connect with high-profile professionals and access exclusive networking opportunities.",
      icon: <Users className="h-8 w-8 text-blue-500" />,
      benefits: [
        "Direct messaging to any member (no connection required)",
        "See who viewed your profile",
        "Advanced search filters",
        "Unlimited connection requests",
        "Access to exclusive networking events"
      ]
    },
    {
      id: 3,
      title: "Premium Content Access",
      description: "Unlock exclusive resources, courses, and tools to accelerate your professional growth.",
      icon: <FileText className="h-8 w-8 text-green-500" />,
      benefits: [
        "Access to premium templates and tools",
        "Exclusive industry reports and insights",
        "Premium courses and workshops",
        "Early access to new features",
        "Downloadable resources library"
      ]
    },
    {
      id: 4,
      title: "Analytics & Insights",
      description: "Get detailed analytics and insights to optimize your professional presence and strategy.",
      icon: <BarChart className="h-8 w-8 text-purple-500" />,
      benefits: [
        "Detailed profile analytics",
        "Competitive benchmarking",
        "Engagement metrics",
        "Audience insights",
        "Performance trends and recommendations"
      ]
    }
  ];

  // Premium plans data
  const premiumPlans = [
    {
      id: 1,
      name: "Basic",
      price: "₹0",
      billing: "Free forever",
      description: "Essential features for all professionals",
      features: [
        "Professional profile",
        "Connect with other professionals",
        "Access to job listings",
        "Basic messaging",
        "Join public groups"
      ],
      limitations: [
        "Limited connection requests",
        "No advanced search filters",
        "No profile analytics",
        "Limited messaging",
        "No premium content access"
      ],
      cta: "Current Plan",
      popular: false
    },
    {
      id: 2,
      name: "Premium",
      price: "₹999",
      billing: "per month",
      description: "Enhanced features for serious professionals",
      features: [
        "All Basic features",
        "Enhanced profile visibility",
        "Advanced search filters",
        "See who viewed your profile",
        "Priority messaging",
        "Featured job applications",
        "Premium badge on profile",
        "Access to premium content",
        "Basic analytics dashboard"
      ],
      limitations: [],
      cta: "Upgrade Now",
      popular: true
    },
    {
      id: 3,
      name: "Enterprise",
      price: "₹4999",
      billing: "per month",
      description: "Comprehensive solution for organizations",
      features: [
        "All Premium features",
        "Company branding",
        "Unlimited job postings",
        "Team management",
        "Advanced analytics dashboard",
        "API access",
        "Dedicated support",
        "Custom integrations",
        "Bulk messaging"
      ],
      limitations: [],
      cta: "Contact Sales",
      popular: false
    }
  ];

  // Premium testimonials data
  const testimonials = [
    {
      id: 1,
      quote: "The premium features have been a game-changer for my startup. The enhanced visibility helped me connect with key investors, and the analytics tools provide valuable insights for optimizing my professional presence.",
      author: "Rajiv Sharma",
      title: "Founder & CEO, TechSolutions",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      id: 2,
      quote: "As an investor, the advanced search filters and premium content access have been invaluable. I can quickly find promising startups and founders in specific sectors, saving me hours of research time.",
      author: "Priya Patel",
      title: "Partner, Venture Capital Firm",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      id: 3,
      quote: "The premium networking features helped me build meaningful connections with industry leaders. The ability to message anyone directly opened doors that would have been difficult to access otherwise.",
      author: "Vikram Singh",
      title: "Co-founder, GrowthLabs",
      avatar: "https://randomuser.me/api/portraits/men/62.jpg"
    }
  ];

  // FAQ data
  const faqs = [
    {
      question: "What is included in the Premium membership?",
      answer: "Premium membership includes enhanced visibility in search results, advanced networking features like direct messaging to any member, access to premium content and resources, and detailed analytics about your profile performance."
    },
    {
      question: "How much does Premium membership cost?",
      answer: "Premium membership costs ₹999 per month. We also offer annual billing at ₹9,990 per year, which gives you two months free compared to monthly billing."
    },
    {
      question: "Can I cancel my Premium membership anytime?",
      answer: "Yes, you can cancel your Premium membership at any time. Your premium features will remain active until the end of your current billing period."
    },
    {
      question: "Is there a free trial for Premium?",
      answer: "Yes, we offer a 7-day free trial for new Premium subscribers. You can experience all the premium features before being charged."
    },
    {
      question: "What's the difference between Premium and Enterprise plans?",
      answer: "While Premium is designed for individual professionals, Enterprise offers additional features for organizations such as company branding, team management, unlimited job postings, API access, and dedicated support."
    },
    {
      question: "Will my profile look different with Premium?",
      answer: "Yes, your profile will display a Premium badge, and you'll be featured more prominently in search results and recommendations. Your profile will also have enhanced visual elements."
    }
  ];

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto py-6 px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-yellow-100 text-yellow-800 px-3 py-1 text-sm">
            Premium Features
          </Badge>
          <h1 className="text-4xl font-bold flex items-center justify-center gap-2 mb-4">
            <Crown className="h-8 w-8 text-yellow-500" />
            Unlock Your Full Potential
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Elevate your professional journey with premium features designed to accelerate your growth and success
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" className="gap-2">
              Upgrade to Premium
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2" onClick={() => setActiveTab("plans")}>
              View Plans
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="plans">Plans</TabsTrigger>
            <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          </TabsList>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-12">
            <div className="grid md:grid-cols-2 gap-8">
              {premiumFeatures.map(feature => (
                <Card key={feature.id} className="overflow-hidden border-2">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-3 rounded-lg">
                        {feature.icon}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{feature.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {feature.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter className="bg-muted/50 flex justify-between">
                    <span className="text-sm text-muted-foreground">Included in Premium</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to unlock these premium features?</h2>
              <Button size="lg" className="gap-2">
                Upgrade to Premium
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>

          {/* Plans Tab */}
          <TabsContent value="plans" className="space-y-12">
            <div className="grid md:grid-cols-3 gap-6">
              {premiumPlans.map(plan => (
                <Card 
                  key={plan.id} 
                  className={`border-2 ${plan.popular ? 'border-primary relative' : 'border-gray-200'}`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-sm font-medium rounded-bl-lg rounded-tr-lg">
                      POPULAR
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4 text-3xl font-bold">{plan.price}<span className="text-sm font-normal text-muted-foreground">{plan.price !== "₹0" && `/${plan.billing.split(' ')[0]}`}</span></div>
                    <p className="text-sm text-muted-foreground">{plan.billing}</p>
                  </CardHeader>
                  <CardContent>
                    <h4 className="font-medium text-sm mb-2">What's included:</h4>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    {plan.limitations.length > 0 && (
                      <>
                        <h4 className="font-medium text-sm mb-2">Limitations:</h4>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, i) => (
                            <li key={i} className="flex items-start">
                              <X className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                              <span className="text-sm">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button 
                      variant={plan.name === "Basic" ? "outline" : "default"} 
                      className="w-full"
                    >
                      {plan.cta}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="bg-muted p-8 rounded-lg">
              <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {faqs.map((faq, index) => (
                  <div key={index}>
                    <h3 className="font-semibold mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Testimonials Tab */}
          <TabsContent value="testimonials" className="space-y-12">
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map(testimonial => (
                <Card key={testimonial.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full overflow-hidden">
                        <img 
                          src={testimonial.avatar} 
                          alt={testimonial.author} 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{testimonial.author}</CardTitle>
                        <CardDescription className="mt-0.5">
                          {testimonial.title}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <div className="absolute -top-2 -left-2 text-4xl text-primary opacity-20">"</div>
                      <p className="relative z-10 italic text-muted-foreground">
                        {testimonial.quote}
                      </p>
                      <div className="absolute -bottom-4 -right-2 text-4xl text-primary opacity-20">"</div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                      <Star className="h-4 w-4 fill-current" />
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>

            <div className="bg-primary/5 p-8 rounded-lg text-center">
              <h2 className="text-2xl font-bold mb-4">Join thousands of professionals who have upgraded</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Experience the difference premium features can make in your professional journey. Unlock enhanced visibility, advanced networking, premium content, and detailed analytics today.
              </p>
              <Button size="lg" className="gap-2">
                Upgrade to Premium
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Why Choose Premium Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Why Choose Premium?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Stand Out</h3>
              <p className="text-muted-foreground">Get featured in search results and job applications to increase your visibility</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Exclusive Access</h3>
              <p className="text-muted-foreground">Connect with top investors and founders in India with advanced networking features</p>
            </div>
            <div className="text-center">
              <div className="bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Accelerate Growth</h3>
              <p className="text-muted-foreground">Access premium analytics and resources to fast-track your professional journey</p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-primary text-primary-foreground p-8 rounded-lg text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to take your professional journey to the next level?</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Join thousands of professionals who have upgraded to Premium and experienced the difference.
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" variant="secondary" className="gap-2">
              Upgrade to Premium
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="gap-2 bg-transparent border-white text-white hover:bg-white/10">
              Learn More
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
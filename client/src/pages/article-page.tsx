import { useState, useEffect } from "react";
import Layout from "@/components/layout/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, MessageSquare, Share2, Bookmark, BookmarkCheck, Twitter, Linkedin, Facebook, Copy, Mail } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useParams } from "wouter";
import { useSavedItems } from "@/hooks/use-saved-items";

// Sample article data
const articles = [
  {
    id: "1",
    title: "10 Essential Strategies for Startup Success in India",
    content: `
# 10 Essential Strategies for Startup Success in India

Starting a business in India presents unique challenges and opportunities. The startup ecosystem has evolved dramatically over the past decade, with cities like Bangalore, Mumbai, and Hyderabad becoming vibrant hubs of innovation and entrepreneurship.

## 1. Solve a Real Problem

The most successful startups address genuine pain points in the market. Before diving into execution, spend time understanding the problem you're trying to solve. Conduct thorough market research, talk to potential customers, and validate your assumptions.

*"We spent six months just talking to farmers before writing a single line of code. This helped us build a solution they actually needed, not what we thought they needed."* - Founder of an AgriTech startup

## 2. Build a Strong Founding Team

A diverse team with complementary skills is crucial. Look for co-founders who share your vision but bring different perspectives and expertise. Technical, business, and domain expertise should all be represented in your founding team.

## 3. Focus on Unit Economics Early

Many Indian startups fail because they prioritize growth over profitability. While scaling is important, understanding your unit economics from day one will help you build a sustainable business model.

## 4. Embrace Frugality

Capital efficiency is a virtue in the Indian startup ecosystem. Learn to do more with less, especially in the early stages. This not only extends your runway but also instills discipline in decision-making.

## 5. Localize Your Solution

India is not a homogeneous market. Regional differences in language, culture, and consumer behavior require thoughtful localization. A one-size-fits-all approach rarely works across the country.

## 6. Build for Mobile First

With over 750 million smartphone users, India is a mobile-first market. Ensure your product offers a seamless mobile experience, with considerations for varying internet speeds and device capabilities.

## 7. Navigate Regulatory Complexities

India's regulatory landscape can be challenging. Stay informed about relevant regulations in your industry and consider bringing in advisors who can help you navigate compliance requirements.

## 8. Develop Strong Investor Relationships

Even if you're not immediately seeking funding, start building relationships with potential investors early. Their feedback can be valuable, and when you do need capital, having established relationships will be beneficial.

## 9. Focus on Customer Acquisition Cost

In a price-sensitive market like India, efficient customer acquisition is critical. Experiment with different channels to find the most cost-effective ways to reach your target audience.

## 10. Build a Culture of Resilience

The startup journey is filled with ups and downs. Building a culture that embraces challenges and learns from failures will help your team weather the inevitable storms.

## Conclusion

Success in India's startup ecosystem requires a combination of global best practices and local adaptations. By focusing on these ten strategies, founders can increase their chances of building sustainable, impactful businesses.

Remember that every startup journey is unique, and while these strategies provide a framework, the most successful founders are those who can adapt to changing circumstances while staying true to their core mission.
    `,
    author: {
      id: 101,
      name: "Vikram Malhotra",
      title: "Serial Entrepreneur",
      avatarUrl: "/avatars/vikram.jpg"
    },
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    readTime: "8 min read",
    category: "Entrepreneurship",
    tags: ["startup", "business", "strategy", "india"],
    likes: 245,
    comments: 37,
    isBookmarked: false
  },
  {
    id: "2",
    title: "The Future of Fintech in India: Opportunities and Challenges",
    content: `
# The Future of Fintech in India: Opportunities and Challenges

India's fintech landscape has undergone a remarkable transformation in recent years. From digital payments to lending platforms, insurance tech to wealth management solutions, fintech innovations are reshaping how Indians access and interact with financial services.

## The Current Landscape

The Indian fintech market is projected to reach $150 billion by 2025, growing at a CAGR of 20%. This explosive growth has been fueled by several factors:

1. **Increasing smartphone penetration** - With over 750 million smartphone users, digital financial services are more accessible than ever.

2. **Government initiatives** - Programs like Digital India, Jan Dhan Yojana, and the Unified Payments Interface (UPI) have created a conducive environment for fintech innovation.

3. **Changing consumer preferences** - The COVID-19 pandemic accelerated the adoption of digital financial services across demographics.

4. **Supportive regulatory framework** - Initiatives like the regulatory sandbox by RBI have encouraged experimentation in the sector.

## Key Opportunities

### Financial Inclusion

Despite significant progress, a large portion of India's population remains underserved by traditional financial institutions. Fintech companies have the opportunity to bridge this gap by leveraging technology to offer affordable, accessible financial services.

*"We're seeing tremendous adoption in Tier 3 and 4 cities, where traditional banking infrastructure is limited. Our mobile-first approach has allowed us to reach customers who were previously excluded from the formal financial system."* - CEO of a leading digital banking platform

### SME Financing

Small and medium enterprises (SMEs) contribute significantly to India's GDP but often struggle to access formal credit. Alternative lending platforms using data-driven approaches to credit assessment are addressing this market gap.

### Wealth Management

As India's middle class grows, so does the demand for wealth management solutions. Robo-advisors and digital investment platforms are democratizing access to investment opportunities previously available only to the wealthy.

## Challenges Ahead

### Regulatory Compliance

The regulatory landscape for fintech in India is evolving rapidly. Companies must navigate complex and sometimes ambiguous regulations across different financial services.

### Data Security and Privacy

As fintech companies collect and process vast amounts of sensitive financial data, ensuring robust security measures and compliance with data protection laws is paramount.

### Digital Literacy

While smartphone adoption is high, digital literacy remains a challenge, particularly in rural areas. Fintech companies need to invest in user education to drive adoption.

### Customer Acquisition Costs

As competition intensifies, customer acquisition costs are rising. Sustainable growth requires efficient customer acquisition strategies and strong retention mechanisms.

## The Path Forward

For fintech entrepreneurs looking to succeed in this dynamic market, here are some key considerations:

1. **Focus on solving real problems** - The most successful fintech solutions address genuine pain points in the existing financial system.

2. **Prioritize user experience** - Simple, intuitive interfaces are essential, especially when serving customers new to digital financial services.

3. **Build for scale** - India's market size offers tremendous growth potential, but your technology infrastructure must be able to handle scale efficiently.

4. **Collaborate with incumbents** - Partnership with traditional financial institutions can provide access to their customer base and regulatory expertise.

5. **Invest in compliance** - Building robust compliance frameworks from the start will save significant headaches down the road.

## Conclusion

The future of fintech in India is bright, with abundant opportunities for innovation and impact. Companies that can navigate the regulatory landscape, address real customer needs, and build scalable, secure solutions are well-positioned to thrive in this exciting market.

As the ecosystem matures, we can expect to see more specialized solutions, increased consolidation, and greater integration between different financial services. The ultimate winners will be Indian consumers, who will benefit from more accessible, affordable, and user-friendly financial services.
    `,
    author: {
      id: 102,
      name: "Priya Sharma",
      title: "Fintech Analyst",
      avatarUrl: "/avatars/priya.jpg"
    },
    publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    readTime: "10 min read",
    category: "Fintech",
    tags: ["fintech", "digital payments", "banking", "financial inclusion"],
    likes: 189,
    comments: 23,
    isBookmarked: true
  }
];

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [article, setArticle] = useState(articles.find(a => a.id === id) || articles[0]);
  const [liked, setLiked] = useState(false);
  const { isItemSaved, saveItem, removeItem } = useSavedItems();
  const [bookmarked, setBookmarked] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  
  // Check if the article is already saved when the component mounts
  useEffect(() => {
    if (article && article.id) {
      setBookmarked(isItemSaved(article.id.toString()));
    }
  }, [article, isItemSaved]);
  
  const getTimeAgo = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  };
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  const handleLike = () => {
    setLiked(!liked);
    if (!liked) {
      toast({
        title: "Article liked",
        description: "This article has been added to your liked articles",
      });
    }
  };
  
  // Handle bookmarking functionality
  
  const handleBookmark = () => {
    const newBookmarkState = !bookmarked;
    setBookmarked(newBookmarkState);
    
    if (newBookmarkState) {
      // Save the article
      saveItem({
        id: article.id.toString(),
        type: 'article',
        title: article.title,
        description: article.excerpt,
        url: `/articles/${article.id}`,
        imageUrl: article.coverImage,
        date: new Date(article.publishedAt),
        tags: article.tags
      });
      
      toast({
        title: "Article bookmarked",
        description: "This article has been saved to your bookmarks",
      });
    } else {
      // Remove the article
      removeItem(article.id.toString());
      
      toast({
        title: "Bookmark removed",
        description: "This article has been removed from your bookmarks",
      });
    }
  };
  
  const renderMarkdown = (content: string) => {
    // This is a simple markdown renderer
    // In a real app, you would use a proper markdown library
    
    const lines = content.split('\n');
    return (
      <div className="prose prose-slate max-w-none">
        {lines.map((line, index) => {
          if (line.startsWith('# ')) {
            return <h1 key={index} className="text-3xl font-bold mt-6 mb-4">{line.substring(2)}</h1>;
          } else if (line.startsWith('## ')) {
            return <h2 key={index} className="text-2xl font-bold mt-5 mb-3">{line.substring(3)}</h2>;
          } else if (line.startsWith('### ')) {
            return <h3 key={index} className="text-xl font-bold mt-4 mb-2">{line.substring(4)}</h3>;
          } else if (line.startsWith('- ')) {
            return <li key={index} className="ml-6 mb-1">{line.substring(2)}</li>;
          } else if (line.match(/^\d+\. /)) {
            return <li key={index} className="ml-6 mb-1 list-decimal">{line.substring(line.indexOf(' ') + 1)}</li>;
          } else if (line.startsWith('*') && line.endsWith('*')) {
            return <p key={index} className="italic my-2">{line.substring(1, line.length - 1)}</p>;
          } else if (line.trim() === '') {
            return <div key={index} className="h-4"></div>;
          } else {
            return <p key={index} className="my-2">{line}</p>;
          }
        })}
      </div>
    );
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Card className="border-0 shadow-none">
          <CardHeader className="px-0">
            <div className="flex items-center space-x-2 mb-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                {article.category}
              </Badge>
              <span className="text-gray-500 text-sm">{article.readTime}</span>
              <span className="text-gray-500 text-sm">•</span>
              <span className="text-gray-500 text-sm">{getTimeAgo(article.publishedAt)}</span>
            </div>
            
            <CardTitle className="text-3xl font-bold mb-4">{article.title}</CardTitle>
            
            <div className="flex items-center">
              <Avatar className="h-10 w-10">
                <AvatarImage src={article.author.avatarUrl} />
                <AvatarFallback>{getInitials(article.author.name)}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="font-medium">{article.author.name}</p>
                <p className="text-gray-500 text-sm">{article.author.title}</p>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="px-0">
            <Separator className="my-6" />
            
            {/* Article content */}
            <div className="article-content">
              {renderMarkdown(article.content)}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-8">
              {article.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="bg-gray-100 hover:bg-gray-200 text-gray-700">
                  #{tag}
                </Badge>
              ))}
            </div>
          </CardContent>
          
          <CardFooter className="px-0 pt-4 flex justify-between border-t">
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex items-center ${liked ? 'text-primary' : 'text-gray-600'}`}
                onClick={handleLike}
              >
                <ThumbsUp className="mr-1 h-4 w-4" />
                <span>{liked ? article.likes + 1 : article.likes}</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center text-gray-600"
              >
                <MessageSquare className="mr-1 h-4 w-4" />
                <span>{article.comments}</span>
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center text-gray-600"
                onClick={() => setShareDialogOpen(true)}
              >
                <Share2 className="mr-1 h-4 w-4" />
                <span>Share</span>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className={`flex items-center ${bookmarked ? 'text-primary' : 'text-gray-600'}`}
                onClick={handleBookmark}
              >
                {bookmarked ? (
                  <BookmarkCheck className="mr-1 h-4 w-4" />
                ) : (
                  <Bookmark className="mr-1 h-4 w-4" />
                )}
                <span>Save</span>
              </Button>
            </div>
          </CardFooter>
        </Card>
        
        {/* More articles section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">More Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {articles.filter(a => a.id !== article.id).map(relatedArticle => (
              <Card key={relatedArticle.id} className="overflow-hidden">
                <CardHeader className="p-4">
                  <CardTitle className="text-lg line-clamp-2">
                    <a href={`/article/${relatedArticle.id}`} className="hover:text-primary transition-colors">
                      {relatedArticle.title}
                    </a>
                  </CardTitle>
                  <CardDescription>
                    {relatedArticle.readTime} • {getTimeAgo(relatedArticle.publishedAt)}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="p-4 pt-0 flex justify-between">
                  <div className="flex items-center">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={relatedArticle.author.avatarUrl} />
                      <AvatarFallback>{getInitials(relatedArticle.author.name)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm ml-2">{relatedArticle.author.name}</span>
                  </div>
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                    {relatedArticle.category}
                  </Badge>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>
      
      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Article</DialogTitle>
            <DialogDescription>
              Share this article with your network
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="border rounded-md p-3 bg-gray-50">
              <p className="font-medium">{article.title}</p>
              <p className="text-sm text-gray-500 mt-1">By {article.author.name}</p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Button 
                variant="outline" 
                className="flex items-center justify-center gap-2"
                onClick={() => {
                  const articleUrl = `${window.location.origin}/article/${article.id}`;
                  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(articleUrl)}`, '_blank');
                  setShareDialogOpen(false);
                }}
              >
                <Twitter className="h-4 w-4" />
                Twitter
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center justify-center gap-2"
                onClick={() => {
                  const articleUrl = `${window.location.origin}/article/${article.id}`;
                  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`, '_blank');
                  setShareDialogOpen(false);
                }}
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center justify-center gap-2"
                onClick={() => {
                  const articleUrl = `${window.location.origin}/article/${article.id}`;
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`, '_blank');
                  setShareDialogOpen(false);
                }}
              >
                <Facebook className="h-4 w-4" />
                Facebook
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center justify-center gap-2"
                onClick={() => {
                  const articleUrl = `${window.location.origin}/article/${article.id}`;
                  window.open(`mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent(`I thought you might be interested in this article:\n\n${article.title}\n\nRead more: ${articleUrl}`)}`, '_blank');
                  setShareDialogOpen(false);
                }}
              >
                <Mail className="h-4 w-4" />
                Email
              </Button>
              
              <Button 
                variant="outline" 
                className="flex items-center justify-center gap-2 col-span-2 sm:col-span-1"
                onClick={() => {
                  const articleUrl = `${window.location.origin}/article/${article.id}`;
                  navigator.clipboard.writeText(articleUrl);
                  toast({
                    title: "Link copied!",
                    description: "Article link has been copied to clipboard",
                  });
                  setShareDialogOpen(false);
                }}
              >
                <Copy className="h-4 w-4" />
                Copy Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

import { useRouter } from 'next/router';
import Head from 'next/head';
import { ReactNode } from 'react';

/**
 * SEO optimization utilities for improving search engine visibility
 * and social media sharing appearance
 */

export interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile' | 'book' | 'event';
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  noIndex?: boolean;
  structuredData?: object;
  keywords?: string[];
}

// Default SEO configuration
const defaultSEO: SEOProps = {
  title: 'Founder Network - Connect with Entrepreneurs and Investors',
  description: 'Join Founder Network to connect with entrepreneurs, investors, and mentors. Find co-founders, raise funding, and grow your startup.',
  ogType: 'website',
  twitterCard: 'summary_large_image',
  ogImage: '/images/founder-network-og.jpg',
  keywords: [
    'founder network', 
    'startup', 
    'entrepreneurs', 
    'investors', 
    'networking', 
    'funding', 
    'mentorship',
    'co-founders',
    'startup jobs',
    'startup events'
  ]
};

// SEO Component
export function SEO({ 
  title, 
  description, 
  canonical, 
  ogImage, 
  ogType = 'website',
  twitterCard = 'summary_large_image',
  noIndex = false,
  structuredData,
  keywords
}: SEOProps) {
  const router = useRouter();
  const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://foundernetwork.com';
  const canonicalUrl = canonical || `${url}${router.asPath}`;
  const mergedKeywords = [...(defaultSEO.keywords || []), ...(keywords || [])];
  
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {mergedKeywords.length > 0 && (
        <meta name="keywords" content={mergedKeywords.join(', ')} />
      )}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content="Founder Network" />
      <meta property="og:image" content={ogImage || defaultSEO.ogImage} />
      <meta property="og:image:alt" content={title} />
      
      {/* Twitter Tags */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content="@foundernetwork" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage || defaultSEO.ogImage} />
      
      {/* No Index if specified */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Structured Data for Rich Results */}
      {structuredData && (
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </Head>
  );
}

// Generate structured data for different content types
export function generateStructuredData(type: 'organization' | 'event' | 'job' | 'person' | 'article', data: any) {
  switch (type) {
    case 'organization':
      return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: data.name,
        url: data.url,
        logo: data.logo,
        sameAs: data.socialLinks,
        description: data.description
      };
    
    case 'event':
      return {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        location: {
          '@type': data.isVirtual ? 'VirtualLocation' : 'Place',
          name: data.locationName,
          address: data.isVirtual ? undefined : {
            '@type': 'PostalAddress',
            streetAddress: data.address,
            addressLocality: data.city,
            addressRegion: data.state,
            postalCode: data.zip,
            addressCountry: data.country
          },
          url: data.isVirtual ? data.virtualUrl : undefined
        },
        image: data.image,
        description: data.description,
        organizer: {
          '@type': 'Organization',
          name: data.organizerName,
          url: data.organizerUrl
        }
      };
    
    case 'job':
      return {
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: data.title,
        description: data.description,
        datePosted: data.datePosted,
        validThrough: data.validThrough,
        employmentType: data.employmentType,
        hiringOrganization: {
          '@type': 'Organization',
          name: data.companyName,
          sameAs: data.companyUrl,
          logo: data.companyLogo
        },
        jobLocation: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: data.city,
            addressRegion: data.state,
            addressCountry: data.country
          }
        },
        baseSalary: {
          '@type': 'MonetaryAmount',
          currency: data.salaryCurrency,
          value: {
            '@type': 'QuantitativeValue',
            minValue: data.salaryMin,
            maxValue: data.salaryMax,
            unitText: data.salaryUnit
          }
        }
      };
    
    case 'person':
      return {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: data.name,
        jobTitle: data.jobTitle,
        worksFor: {
          '@type': 'Organization',
          name: data.companyName
        },
        image: data.image,
        url: data.profileUrl,
        sameAs: data.socialLinks
      };
    
    case 'article':
      return {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: data.title,
        image: data.image,
        datePublished: data.datePublished,
        dateModified: data.dateModified,
        author: {
          '@type': 'Person',
          name: data.authorName,
          url: data.authorUrl
        },
        publisher: {
          '@type': 'Organization',
          name: 'Founder Network',
          logo: {
            '@type': 'ImageObject',
            url: '/images/founder-network-logo.png'
          }
        },
        description: data.description,
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': data.url
        }
      };
    
    default:
      return {};
  }
}

// Generate SEO-friendly URLs
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim(); // Trim leading/trailing spaces
}

// Generate breadcrumbs structured data
export function generateBreadcrumbsData(breadcrumbs: {name: string, url: string}[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url
    }))
  };
}

// Hook to generate SEO metadata for pages
export function useSEO(defaultProps?: Partial<SEOProps>) {
  const router = useRouter();
  
  const generateSEO = (props: Partial<SEOProps> = {}): SEOProps => {
    return {
      ...defaultSEO,
      ...defaultProps,
      ...props,
      // Ensure canonical URL is correct
      canonical: props.canonical || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://foundernetwork.com'}${router.asPath}`
    };
  };
  
  return { generateSEO, SEO };
}
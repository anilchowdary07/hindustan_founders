/**
 * Image optimization utilities for improving performance and user experience
 * This module provides functions for optimizing images across the application
 */

// Image quality settings
export const IMAGE_QUALITY = {
  HIGH: 90,
  MEDIUM: 75,
  LOW: 60,
  THUMBNAIL: 50
};

// Image sizes for different contexts
export const IMAGE_SIZES = {
  AVATAR: {
    SMALL: 40,
    MEDIUM: 80,
    LARGE: 160
  },
  COVER: {
    SMALL: 600,
    MEDIUM: 1200,
    LARGE: 1800
  },
  POST: {
    THUMBNAIL: 300,
    MEDIUM: 600,
    LARGE: 1200
  },
  EVENT: {
    THUMBNAIL: 400,
    BANNER: 1200
  },
  COMPANY: {
    LOGO: 200,
    BANNER: 1200
  }
};

// Image formats
export type ImageFormat = 'jpeg' | 'webp' | 'avif' | 'png';

/**
 * Generate optimized image URL with appropriate size and format
 * @param originalUrl Original image URL
 * @param width Desired width
 * @param height Optional height (maintains aspect ratio if not provided)
 * @param format Image format (defaults to webp if supported)
 * @param quality Image quality (1-100)
 * @returns Optimized image URL
 */
export function getOptimizedImageUrl(
  originalUrl: string,
  width: number,
  height?: number,
  format: ImageFormat = 'webp',
  quality: number = IMAGE_QUALITY.MEDIUM
): string {
  // If URL is already an optimized URL, return as is
  if (originalUrl.includes('/images/optimized/')) {
    return originalUrl;
  }

  // If URL is external (not from our CDN), return as is
  if (!originalUrl.startsWith('/') && !originalUrl.includes('foundernetwork.com')) {
    return originalUrl;
  }

  // Handle relative URLs
  const baseUrl = originalUrl.startsWith('/')
    ? process.env.NEXT_PUBLIC_CDN_URL || 'https://cdn.foundernetwork.com'
    : '';

  // Extract file name and extension
  const urlParts = originalUrl.split('/');
  const fileName = urlParts[urlParts.length - 1];
  const fileNameParts = fileName.split('.');
  const extension = fileNameParts.length > 1 ? fileNameParts.pop()?.toLowerCase() : 'jpg';
  const baseName = fileNameParts.join('.');

  // Determine output format
  // Default to original format if not a web-friendly format
  const outputFormat = ['jpg', 'jpeg', 'png', 'webp', 'avif'].includes(extension || '')
    ? format
    : extension;

  // Construct optimized URL
  const heightParam = height ? `_h${height}` : '';
  const optimizedUrl = `${baseUrl}/images/optimized/${width}${heightParam}_q${quality}/${baseName}.${outputFormat}`;

  return optimizedUrl;
}

/**
 * Generate responsive image srcset for different screen sizes
 * @param originalUrl Original image URL
 * @param sizes Array of widths to generate
 * @param format Image format
 * @param quality Image quality
 * @returns srcset string for use in <img> or <source> elements
 */
export function generateSrcSet(
  originalUrl: string,
  sizes: number[] = [320, 640, 960, 1280, 1920],
  format: ImageFormat = 'webp',
  quality: number = IMAGE_QUALITY.MEDIUM
): string {
  return sizes
    .map(size => `${getOptimizedImageUrl(originalUrl, size, undefined, format, quality)} ${size}w`)
    .join(', ');
}

/**
 * Generate multiple image formats for modern browsers
 * @param originalUrl Original image URL
 * @param width Desired width
 * @param height Optional height
 * @param quality Image quality
 * @returns Object with URLs for different formats
 */
export function generateImageFormats(
  originalUrl: string,
  width: number,
  height?: number,
  quality: number = IMAGE_QUALITY.MEDIUM
): { webp: string; avif: string; original: string } {
  // Get original format (jpg/png)
  const urlParts = originalUrl.split('.');
  const extension = urlParts[urlParts.length - 1].toLowerCase();
  const originalFormat = ['jpg', 'jpeg', 'png'].includes(extension) ? extension : 'jpg';

  return {
    webp: getOptimizedImageUrl(originalUrl, width, height, 'webp', quality),
    avif: getOptimizedImageUrl(originalUrl, width, height, 'avif', quality),
    original: getOptimizedImageUrl(originalUrl, width, height, originalFormat as ImageFormat, quality)
  };
}

/**
 * Generate a placeholder image URL for lazy loading
 * @param originalUrl Original image URL
 * @returns Low quality placeholder image URL
 */
export function getPlaceholderImage(originalUrl: string): string {
  return getOptimizedImageUrl(originalUrl, 20, undefined, 'webp', 20);
}

/**
 * Calculate aspect ratio from image dimensions
 * @param width Image width
 * @param height Image height
 * @returns Aspect ratio as a string (e.g., "16/9")
 */
export function calculateAspectRatio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}/${height / divisor}`;
}

/**
 * Generate a responsive image component props
 * @param originalUrl Original image URL
 * @param alt Alt text for the image
 * @param sizes Sizes attribute for responsive images
 * @param className Optional CSS class
 * @returns Props object for use with next/image or img element
 */
export function getResponsiveImageProps(
  originalUrl: string,
  alt: string,
  sizes: string = '100vw',
  className?: string
): {
  src: string;
  alt: string;
  sizes: string;
  srcSet: string;
  width: number;
  height: number;
  loading: 'lazy';
  className?: string;
  placeholder: 'blur';
  blurDataURL: string;
} {
  // Default to a 16:9 aspect ratio if dimensions can't be determined
  const width = 1200;
  const height = 675;

  return {
    src: getOptimizedImageUrl(originalUrl, width, height),
    alt,
    sizes,
    srcSet: generateSrcSet(originalUrl),
    width,
    height,
    loading: 'lazy',
    className,
    placeholder: 'blur',
    blurDataURL: getPlaceholderImage(originalUrl)
  };
}

/**
 * Generate avatar image URL with appropriate size
 * @param avatarUrl Original avatar URL
 * @param size Size variant (small, medium, large)
 * @returns Optimized avatar URL
 */
export function getAvatarUrl(
  avatarUrl: string | null | undefined,
  size: 'small' | 'medium' | 'large' = 'medium'
): string {
  // Return default avatar if no URL provided
  if (!avatarUrl) {
    return `/images/default-avatar-${size}.png`;
  }

  const avatarSize = IMAGE_SIZES.AVATAR[size.toUpperCase() as keyof typeof IMAGE_SIZES.AVATAR];
  return getOptimizedImageUrl(avatarUrl, avatarSize, avatarSize, 'webp', IMAGE_QUALITY.HIGH);
}

/**
 * Check if WebP format is supported by the browser
 * @returns Promise that resolves to true if WebP is supported
 */
export async function isWebPSupported(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false; // Default to false on server
  }

  // Check for browser support
  if ('createImageBitmap' in window && 'HTMLCanvasElement' in window) {
    const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
    try {
      const blob = await fetch(webpData).then(r => r.blob());
      return createImageBitmap(blob).then(() => true, () => false);
    } catch (e) {
      return false;
    }
  }
  return false;
}

/**
 * Check if AVIF format is supported by the browser
 * @returns Promise that resolves to true if AVIF is supported
 */
export async function isAvifSupported(): Promise<boolean> {
  if (typeof window === 'undefined') {
    return false; // Default to false on server
  }

  // Check for browser support
  if ('createImageBitmap' in window && 'HTMLCanvasElement' in window) {
    const avifData = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
    try {
      const blob = await fetch(avifData).then(r => r.blob());
      return createImageBitmap(blob).then(() => true, () => false);
    } catch (e) {
      return false;
    }
  }
  return false;
}

/**
 * Get the best supported image format for the current browser
 * @returns Promise that resolves to the best supported format
 */
export async function getBestSupportedFormat(): Promise<ImageFormat> {
  const avifSupported = await isAvifSupported();
  if (avifSupported) {
    return 'avif';
  }

  const webpSupported = await isWebPSupported();
  if (webpSupported) {
    return 'webp';
  }

  return 'jpeg';
}

/**
 * Responsive Image component props generator
 * Creates all necessary props for optimal image rendering
 * @param src Original image source
 * @param alt Alt text
 * @param options Additional options
 * @returns Complete props object for image component
 */
export function getImageProps(
  src: string,
  alt: string,
  options?: {
    width?: number;
    height?: number;
    sizes?: string;
    quality?: number;
    priority?: boolean;
    className?: string;
  }
) {
  const {
    width = 0,
    height = 0,
    sizes = '100vw',
    quality = IMAGE_QUALITY.MEDIUM,
    priority = false,
    className
  } = options || {};

  // Calculate dimensions if not provided
  const calculatedWidth = width || 1200;
  const calculatedHeight = height || Math.round(calculatedWidth * (9 / 16)); // Default to 16:9

  // Generate srcset for responsive images
  const srcSet = generateSrcSet(src, [320, 640, 960, 1280, 1920], 'webp', quality);

  // Generate placeholder for blur effect
  const placeholderUrl = getPlaceholderImage(src);

  return {
    src: getOptimizedImageUrl(src, calculatedWidth, calculatedHeight, 'webp', quality),
    alt,
    width: calculatedWidth,
    height: calculatedHeight,
    sizes,
    srcSet,
    loading: priority ? 'eager' : 'lazy',
    priority,
    placeholder: 'blur',
    blurDataURL: placeholderUrl,
    className
  };
}
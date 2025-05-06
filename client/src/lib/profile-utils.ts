// Utility functions for profile-related operations

/**
 * Calculate profile strength percentage based on user data completeness
 * @param user User object
 * @returns Profile strength as a percentage (0-100)
 */
export const calculateProfileStrength = (user: any): number => {
  if (!user) return 0;
  
  let strength = 0;
  
  // Basic profile - 25%
  if (user.name) strength += 5;
  if (user.email) strength += 5;
  if (user.role) strength += 5;
  if (user.title) strength += 5;
  if (user.company) strength += 5;
  
  // Additional info - 25%
  if (user.location) strength += 5;
  if (user.bio && user.bio.length > 10) strength += 10;
  if (user.avatarUrl) strength += 10;
  
  // Experience and education - 25%
  // This would ideally be calculated based on actual data
  // For now, we'll add a fixed percentage if the user has any experiences
  if (user.experiences && user.experiences.length > 0) {
    strength += Math.min(15, user.experiences.length * 5); // Up to 15% for experiences
  }
  
  // Activity and connections - 25%
  // This would ideally be calculated based on actual data
  // For now, we'll add a fixed percentage
  if (user.posts && user.posts.length > 0) {
    strength += Math.min(10, user.posts.length * 2); // Up to 10% for posts
  }
  
  if (user.connections && user.connections.length > 0) {
    strength += Math.min(10, user.connections.length); // Up to 10% for connections
  }
  
  // Ensure the strength is between 0 and 100
  return Math.min(100, Math.max(0, strength));
};

/**
 * Get profile completion suggestions based on missing user data
 * @param user User object
 * @returns Array of suggestion strings
 */
export const getProfileCompletionSuggestions = (user: any): string[] => {
  if (!user) return [];
  
  const suggestions: string[] = [];
  
  if (!user.bio || user.bio.length < 10) {
    suggestions.push("Add a professional bio");
  }
  
  if (!user.avatarUrl) {
    suggestions.push("Upload a profile picture");
  }
  
  if (!user.location) {
    suggestions.push("Add your location");
  }
  
  if (!user.company) {
    suggestions.push("Add your company");
  }
  
  if (!user.title) {
    suggestions.push("Add your professional title");
  }
  
  // Always suggest connecting with others
  suggestions.push("Connect with more professionals");
  
  return suggestions;
};

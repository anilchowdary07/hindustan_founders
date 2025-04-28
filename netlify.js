// This file helps with Netlify build process
// It ensures that server-side code is properly bundled for serverless functions

export default {
  // Add any Netlify-specific configuration here
  onBuild: () => {
    console.log('Building for Netlify deployment...');
  }
};
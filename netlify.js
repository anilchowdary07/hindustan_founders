// This file helps with Netlify build process
// It ensures that server-side code is properly bundled for serverless functions

module.exports = {
  // Add any Netlify-specific configuration here
  onBuild: function() {
    console.log('Building for Netlify deployment...');
  }
};
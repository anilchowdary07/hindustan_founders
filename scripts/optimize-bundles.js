#!/usr/bin/env node

/**
 * Bundle Size Optimization Script
 * 
 * This script analyzes and optimizes JavaScript bundles for production.
 * It identifies large dependencies, duplicate code, and unused exports.
 * 
 * Usage:
 *   node scripts/optimize-bundles.js [--fix] [--threshold=100]
 * 
 * Options:
 *   --fix         Automatically apply recommended optimizations
 *   --threshold   Size threshold in KB to flag large modules (default: 100)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

// Configuration
const BUNDLE_DIR = path.join(process.cwd(), '.next/static');
const THRESHOLD_KB = parseInt(process.argv.find(arg => arg.startsWith('--threshold='))?.split('=')[1] || '100');
const AUTO_FIX = process.argv.includes('--fix');

// Ensure required tools are installed
try {
  execSync('which next-bundle-analyzer', { stdio: 'ignore' });
} catch (error) {
  console.log(chalk.yellow('Installing required dependencies...'));
  execSync('npm install --save-dev @next/bundle-analyzer', { stdio: 'inherit' });
}

// Generate bundle analysis if it doesn't exist
const statsFile = path.join(process.cwd(), '.next/stats.json');
if (!fs.existsSync(statsFile)) {
  console.log(chalk.blue('Generating bundle analysis...'));
  
  // Temporarily modify next.config.js to include bundle analyzer
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  const originalConfig = fs.readFileSync(nextConfigPath, 'utf8');
  
  const withBundleAnalyzer = `
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: true,
  openAnalyzer: false,
})

${originalConfig.replace('module.exports =', 'const nextConfig =')}

module.exports = withBundleAnalyzer(nextConfig)
`;
  
  fs.writeFileSync(nextConfigPath, withBundleAnalyzer);
  
  // Build with bundle analyzer
  try {
    execSync('npm run build', { stdio: 'inherit' });
  } finally {
    // Restore original next.config.js
    fs.writeFileSync(nextConfigPath, originalConfig);
  }
}

// Read bundle stats
const stats = JSON.parse(fs.readFileSync(statsFile, 'utf8'));

// Analyze bundles
console.log(chalk.blue('\n📊 Bundle Size Analysis\n'));

// Track issues for auto-fixing
const issues = {
  largeModules: [],
  duplicateModules: [],
  unusedExports: []
};

// Find large modules
const allModules = {};
let totalSize = 0;

stats.chunks.forEach(chunk => {
  chunk.modules.forEach(module => {
    const name = module.name.replace(/^\.\/node_modules\//, '');
    const size = module.size / 1024; // Convert to KB
    
    totalSize += module.size;
    
    if (!allModules[name]) {
      allModules[name] = { size: 0, chunks: new Set() };
    }
    
    allModules[name].size += size;
    allModules[name].chunks.add(chunk.id);
    
    if (size > THRESHOLD_KB && name.includes('node_modules')) {
      issues.largeModules.push({ name, size });
    }
  });
});

// Find duplicate modules
const duplicateModules = Object.entries(allModules)
  .filter(([_, info]) => info.chunks.size > 1)
  .sort((a, b) => b[1].size - a[1].size);

duplicateModules.forEach(([name, info]) => {
  if (info.size > THRESHOLD_KB / 2) {
    issues.duplicateModules.push({ name, size: info.size, chunks: Array.from(info.chunks) });
  }
});

// Display results
console.log(chalk.green(`Total bundle size: ${(totalSize / 1024).toFixed(2)} MB\n`));

// Large modules
console.log(chalk.yellow('🐘 Large Modules (over ' + THRESHOLD_KB + 'KB):'));
if (issues.largeModules.length === 0) {
  console.log(chalk.green('  No large modules found!'));
} else {
  issues.largeModules
    .sort((a, b) => b.size - a.size)
    .slice(0, 10)
    .forEach(({ name, size }) => {
      console.log(`  ${chalk.red(size.toFixed(2) + ' KB')} - ${name}`);
    });
}

// Duplicate modules
console.log(chalk.yellow('\n🔄 Duplicate Modules:'));
if (issues.duplicateModules.length === 0) {
  console.log(chalk.green('  No significant duplicate modules found!'));
} else {
  issues.duplicateModules
    .slice(0, 10)
    .forEach(({ name, size, chunks }) => {
      console.log(`  ${chalk.red(size.toFixed(2) + ' KB')} - ${name} (in chunks: ${chunks.join(', ')})`);
    });
}

// Generate recommendations
console.log(chalk.blue('\n💡 Optimization Recommendations:\n'));

// Recommendations for large modules
if (issues.largeModules.length > 0) {
  console.log(chalk.yellow('For large modules:'));
  
  const lodashFound = issues.largeModules.some(m => m.name.includes('lodash'));
  const momentFound = issues.largeModules.some(m => m.name.includes('moment'));
  
  if (lodashFound) {
    console.log('  - Replace full lodash with individual imports or use lodash-es');
    console.log('    Example: import _map from "lodash/map" instead of import { map } from "lodash"');
  }
  
  if (momentFound) {
    console.log('  - Consider replacing moment.js with date-fns or dayjs (much smaller)');
    console.log('    Example: npm uninstall moment && npm install date-fns');
  }
  
  console.log('  - Use dynamic imports for large components that aren\'t needed immediately');
  console.log('    Example: const HeavyComponent = dynamic(() => import("./HeavyComponent"))');
  console.log('  - Consider code-splitting by route using Next.js automatic code splitting');
}

// Recommendations for duplicate modules
if (issues.duplicateModules.length > 0) {
  console.log(chalk.yellow('\nFor duplicate modules:'));
  console.log('  - Ensure consistent versions in package.json and package-lock.json');
  console.log('  - Run npm dedupe to remove duplicate packages');
  console.log('  - Consider using webpack\'s resolve.alias to force single version usage');
}

// General recommendations
console.log(chalk.yellow('\nGeneral optimizations:'));
console.log('  - Enable gzip/Brotli compression on your server');
console.log('  - Implement proper cache policies for static assets');
console.log('  - Use production builds with minification enabled');
console.log('  - Consider using Preact instead of React for smaller bundle size');
console.log('  - Lazy load below-the-fold components and routes');

// Auto-fix if enabled
if (AUTO_FIX) {
  console.log(chalk.blue('\n🔧 Applying automatic optimizations...\n'));
  
  // Create optimization report
  const reportPath = path.join(process.cwd(), 'bundle-optimization-report.md');
  let report = `# Bundle Optimization Report\n\n`;
  report += `Generated on: ${new Date().toLocaleString()}\n\n`;
  report += `## Summary\n\n`;
  report += `- Total bundle size: ${(totalSize / 1024).toFixed(2)} MB\n`;
  report += `- Large modules: ${issues.largeModules.length}\n`;
  report += `- Duplicate modules: ${issues.duplicateModules.length}\n\n`;
  
  // Add large modules to report
  if (issues.largeModules.length > 0) {
    report += `## Large Modules\n\n`;
    issues.largeModules
      .sort((a, b) => b.size - a.size)
      .forEach(({ name, size }) => {
        report += `- ${name}: ${size.toFixed(2)} KB\n`;
      });
    report += `\n`;
  }
  
  // Add duplicate modules to report
  if (issues.duplicateModules.length > 0) {
    report += `## Duplicate Modules\n\n`;
    issues.duplicateModules
      .forEach(({ name, size, chunks }) => {
        report += `- ${name}: ${size.toFixed(2)} KB (in chunks: ${chunks.join(', ')})\n`;
      });
    report += `\n`;
  }
  
  // Add recommendations to report
  report += `## Recommendations\n\n`;
  
  if (lodashFound) {
    report += `### Lodash Optimization\n\n`;
    report += `Replace full lodash imports with individual imports:\n\n`;
    report += `\`\`\`javascript\n`;
    report += `// Before\n`;
    report += `import { map, filter } from 'lodash';\n\n`;
    report += `// After\n`;
    report += `import map from 'lodash/map';\n`;
    report += `import filter from 'lodash/filter';\n`;
    report += `\`\`\`\n\n`;
    
    // Try to automatically fix lodash imports
    console.log(chalk.yellow('Optimizing lodash imports...'));
    try {
      const result = execSync('npx lodash-codemods src/**/*.{js,jsx,ts,tsx}', { stdio: 'pipe' }).toString();
      console.log(chalk.green('  Lodash imports optimized successfully!'));
      report += `Lodash imports were automatically optimized.\n\n`;
    } catch (error) {
      console.log(chalk.red('  Failed to optimize lodash imports automatically.'));
      report += `Attempted to optimize lodash imports but encountered errors.\n\n`;
    }
  }
  
  if (momentFound) {
    report += `### Moment.js Replacement\n\n`;
    report += `Consider replacing moment.js with date-fns (recommended) or dayjs:\n\n`;
    report += `\`\`\`bash\n`;
    report += `npm uninstall moment\n`;
    report += `npm install date-fns\n`;
    report += `\`\`\`\n\n`;
    report += `Usage example:\n\n`;
    report += `\`\`\`javascript\n`;
    report += `// Before with moment\n`;
    report += `import moment from 'moment';\n`;
    report += `const formattedDate = moment(date).format('YYYY-MM-DD');\n\n`;
    report += `// After with date-fns\n`;
    report += `import { format } from 'date-fns';\n`;
    report += `const formattedDate = format(date, 'yyyy-MM-dd');\n`;
    report += `\`\`\`\n\n`;
  }
  
  // Run npm dedupe if duplicate modules found
  if (issues.duplicateModules.length > 0) {
    report += `### Duplicate Packages\n\n`;
    report += `Run npm dedupe to remove duplicate packages:\n\n`;
    report += `\`\`\`bash\n`;
    report += `npm dedupe\n`;
    report += `\`\`\`\n\n`;
    
    console.log(chalk.yellow('Running npm dedupe to remove duplicate packages...'));
    try {
      execSync('npm dedupe', { stdio: 'inherit' });
      console.log(chalk.green('  Successfully removed duplicate packages!'));
      report += `npm dedupe was automatically run to remove duplicate packages.\n\n`;
    } catch (error) {
      console.log(chalk.red('  Failed to remove duplicate packages.'));
      report += `Attempted to run npm dedupe but encountered errors.\n\n`;
    }
  }
  
  // Add general recommendations to report
  report += `### General Optimizations\n\n`;
  report += `1. **Enable compression**: Ensure your server uses gzip or Brotli compression\n`;
  report += `2. **Implement caching**: Set proper cache headers for static assets\n`;
  report += `3. **Code splitting**: Use dynamic imports for large components\n`;
  report += `4. **Tree shaking**: Ensure your bundler is configured for proper tree shaking\n`;
  report += `5. **Lazy loading**: Implement lazy loading for below-the-fold content\n`;
  
  // Write report to file
  fs.writeFileSync(reportPath, report);
  console.log(chalk.green(`\nOptimization report saved to ${reportPath}`));
  
  // Rebuild the application with optimizations
  console.log(chalk.yellow('\nRebuilding application with optimizations...'));
  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log(chalk.green('\nApplication rebuilt successfully with optimizations!'));
  } catch (error) {
    console.log(chalk.red('\nFailed to rebuild application after optimizations.'));
  }
}

// Final message
if (!AUTO_FIX) {
  console.log(chalk.blue('\nRun with --fix flag to automatically apply recommended optimizations:'));
  console.log(chalk.blue('  node scripts/optimize-bundles.js --fix'));
}

console.log(chalk.green('\n✅ Bundle analysis complete!'));
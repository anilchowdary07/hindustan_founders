/**
 * Accessibility Checker Utility
 * 
 * This utility provides functions to check and improve accessibility
 * throughout the application, ensuring compliance with WCAG standards.
 */

// Types of accessibility issues
export enum AccessibilityIssueType {
  CRITICAL = 'critical',
  SERIOUS = 'serious',
  MODERATE = 'moderate',
  MINOR = 'minor'
}

// Interface for accessibility issues
export interface AccessibilityIssue {
  type: AccessibilityIssueType;
  message: string;
  element: HTMLElement;
  code: string;
  helpUrl: string;
  impact: 'high' | 'medium' | 'low';
}

// Interface for accessibility check results
export interface AccessibilityCheckResult {
  issues: AccessibilityIssue[];
  passed: boolean;
  timestamp: Date;
  elementsTested: number;
}

/**
 * Check for missing alt text on images
 * @param rootElement The root element to check (defaults to document.body)
 * @returns Array of issues found
 */
export function checkImagesForAltText(rootElement: HTMLElement = document.body): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  const images = rootElement.querySelectorAll('img');
  
  images.forEach(img => {
    if (!img.hasAttribute('alt')) {
      issues.push({
        type: AccessibilityIssueType.SERIOUS,
        message: 'Image is missing alt text',
        element: img as HTMLElement,
        code: 'image-alt',
        helpUrl: 'https://www.w3.org/WAI/tutorials/images/decision-tree/',
        impact: 'high'
      });
    } else if (img.alt === '') {
      // Empty alt is only valid for decorative images
      const role = img.getAttribute('role');
      const isDecorative = role === 'presentation' || role === 'none';
      
      if (!isDecorative) {
        issues.push({
          type: AccessibilityIssueType.MODERATE,
          message: 'Image has empty alt text but is not marked as decorative',
          element: img as HTMLElement,
          code: 'image-alt-decorative',
          helpUrl: 'https://www.w3.org/WAI/tutorials/images/decorative/',
          impact: 'medium'
        });
      }
    }
  });
  
  return issues;
}

/**
 * Check for proper heading hierarchy
 * @param rootElement The root element to check (defaults to document.body)
 * @returns Array of issues found
 */
export function checkHeadingHierarchy(rootElement: HTMLElement = document.body): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  const headings = rootElement.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let previousLevel = 0;
  
  headings.forEach(heading => {
    const level = parseInt(heading.tagName.charAt(1));
    
    // Check for skipped heading levels (e.g., h1 to h3)
    if (level > previousLevel + 1 && previousLevel !== 0) {
      issues.push({
        type: AccessibilityIssueType.MODERATE,
        message: `Heading level ${level} follows heading level ${previousLevel}, skipping one or more levels`,
        element: heading as HTMLElement,
        code: 'heading-order',
        helpUrl: 'https://www.w3.org/WAI/tutorials/page-structure/headings/',
        impact: 'medium'
      });
    }
    
    previousLevel = level;
  });
  
  // Check if there's an h1 heading
  if (!rootElement.querySelector('h1')) {
    issues.push({
      type: AccessibilityIssueType.SERIOUS,
      message: 'Page does not contain an h1 heading',
      element: rootElement,
      code: 'page-has-heading-one',
      helpUrl: 'https://www.w3.org/WAI/tutorials/page-structure/headings/',
      impact: 'high'
    });
  }
  
  return issues;
}

/**
 * Check for proper form labels
 * @param rootElement The root element to check (defaults to document.body)
 * @returns Array of issues found
 */
export function checkFormLabels(rootElement: HTMLElement = document.body): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  const formControls = rootElement.querySelectorAll('input, textarea, select');
  
  formControls.forEach(control => {
    // Skip hidden inputs
    if (control instanceof HTMLInputElement && control.type === 'hidden') {
      return;
    }
    
    const id = control.id;
    const hasAriaLabel = control.hasAttribute('aria-label');
    const hasAriaLabelledBy = control.hasAttribute('aria-labelledby');
    const hasLabel = id && rootElement.querySelector(`label[for="${id}"]`);
    
    if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
      issues.push({
        type: AccessibilityIssueType.SERIOUS,
        message: 'Form control does not have an associated label',
        element: control as HTMLElement,
        code: 'label',
        helpUrl: 'https://www.w3.org/WAI/tutorials/forms/labels/',
        impact: 'high'
      });
    }
  });
  
  return issues;
}

/**
 * Check for proper color contrast
 * @param rootElement The root element to check (defaults to document.body)
 * @returns Array of issues found
 */
export function checkColorContrast(rootElement: HTMLElement = document.body): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  
  // This is a simplified version. A complete implementation would:
  // 1. Get computed styles for all text elements
  // 2. Calculate contrast ratio between text and background
  // 3. Check against WCAG standards (4.5:1 for normal text, 3:1 for large text)
  
  // For demonstration, we'll just check elements with known problematic classes
  const lowContrastSelectors = [
    '.text-gray-300', 
    '.text-gray-400',
    '.bg-gray-100 .text-gray-300',
    '.bg-white .text-gray-200',
    '.text-white.bg-yellow-300',
    '.text-white.bg-green-300'
  ];
  
  const potentialLowContrastElements = rootElement.querySelectorAll(lowContrastSelectors.join(', '));
  
  potentialLowContrastElements.forEach(element => {
    issues.push({
      type: AccessibilityIssueType.MODERATE,
      message: 'Element may have insufficient color contrast',
      element: element as HTMLElement,
      code: 'color-contrast',
      helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html',
      impact: 'medium'
    });
  });
  
  return issues;
}

/**
 * Check for keyboard accessibility
 * @param rootElement The root element to check (defaults to document.body)
 * @returns Array of issues found
 */
export function checkKeyboardAccessibility(rootElement: HTMLElement = document.body): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  
  // Check for clickable elements without keyboard support
  const clickableElements = rootElement.querySelectorAll('[onClick]');
  
  clickableElements.forEach(element => {
    // If it's not a button, link, or input and doesn't have tabindex
    if (
      !['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName) &&
      !element.hasAttribute('tabindex')
    ) {
      issues.push({
        type: AccessibilityIssueType.SERIOUS,
        message: 'Clickable element is not keyboard accessible',
        element: element as HTMLElement,
        code: 'interactive-element-keyboard',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/keyboard.html',
        impact: 'high'
      });
    }
  });
  
  // Check for positive tabindex values (these can disrupt tab order)
  const elementsWithTabIndex = rootElement.querySelectorAll('[tabindex]');
  
  elementsWithTabIndex.forEach(element => {
    const tabIndex = parseInt(element.getAttribute('tabindex') || '0');
    if (tabIndex > 0) {
      issues.push({
        type: AccessibilityIssueType.MODERATE,
        message: 'Element has a positive tabindex which may disrupt keyboard navigation',
        element: element as HTMLElement,
        code: 'tabindex',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/focus-order.html',
        impact: 'medium'
      });
    }
  });
  
  return issues;
}

/**
 * Check for ARIA attributes
 * @param rootElement The root element to check (defaults to document.body)
 * @returns Array of issues found
 */
export function checkAriaAttributes(rootElement: HTMLElement = document.body): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  
  // Check for invalid ARIA roles
  const validRoles = [
    'alert', 'alertdialog', 'application', 'article', 'banner', 'button', 'cell', 'checkbox',
    'columnheader', 'combobox', 'complementary', 'contentinfo', 'definition', 'dialog',
    'directory', 'document', 'feed', 'figure', 'form', 'grid', 'gridcell', 'group', 'heading',
    'img', 'link', 'list', 'listbox', 'listitem', 'log', 'main', 'marquee', 'math', 'menu',
    'menubar', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'navigation', 'none',
    'note', 'option', 'presentation', 'progressbar', 'radio', 'radiogroup', 'region',
    'row', 'rowgroup', 'rowheader', 'scrollbar', 'search', 'searchbox', 'separator',
    'slider', 'spinbutton', 'status', 'switch', 'tab', 'table', 'tablist', 'tabpanel',
    'term', 'textbox', 'timer', 'toolbar', 'tooltip', 'tree', 'treegrid', 'treeitem'
  ];
  
  const elementsWithRole = rootElement.querySelectorAll('[role]');
  
  elementsWithRole.forEach(element => {
    const role = element.getAttribute('role');
    if (role && !validRoles.includes(role)) {
      issues.push({
        type: AccessibilityIssueType.MODERATE,
        message: `Invalid ARIA role: ${role}`,
        element: element as HTMLElement,
        code: 'aria-roles',
        helpUrl: 'https://www.w3.org/WAI/ARIA/apg/practices/roles/',
        impact: 'medium'
      });
    }
  });
  
  // Check for aria-hidden on focusable elements
  const hiddenElements = rootElement.querySelectorAll('[aria-hidden="true"]');
  
  hiddenElements.forEach(element => {
    const focusableElements = element.querySelectorAll(
      'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      issues.push({
        type: AccessibilityIssueType.SERIOUS,
        message: 'aria-hidden="true" element contains focusable elements',
        element: element as HTMLElement,
        code: 'aria-hidden-focus',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/name-role-value.html',
        impact: 'high'
      });
    }
  });
  
  return issues;
}

/**
 * Check for proper language attributes
 * @returns Array of issues found
 */
export function checkLanguageAttributes(): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  
  // Check if html element has lang attribute
  const htmlElement = document.documentElement;
  
  if (!htmlElement.hasAttribute('lang')) {
    issues.push({
      type: AccessibilityIssueType.SERIOUS,
      message: 'HTML element does not have a lang attribute',
      element: htmlElement as HTMLElement,
      code: 'html-has-lang',
      helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/language-of-page.html',
      impact: 'high'
    });
  } else {
    const lang = htmlElement.getAttribute('lang');
    if (!lang || lang.trim() === '') {
      issues.push({
        type: AccessibilityIssueType.SERIOUS,
        message: 'HTML element has an empty lang attribute',
        element: htmlElement as HTMLElement,
        code: 'html-lang-valid',
        helpUrl: 'https://www.w3.org/WAI/WCAG21/Understanding/language-of-page.html',
        impact: 'high'
      });
    }
  }
  
  return issues;
}

/**
 * Run all accessibility checks
 * @param rootElement The root element to check (defaults to document.body)
 * @returns Accessibility check results
 */
export function runAccessibilityChecks(rootElement: HTMLElement = document.body): AccessibilityCheckResult {
  const allIssues: AccessibilityIssue[] = [
    ...checkImagesForAltText(rootElement),
    ...checkHeadingHierarchy(rootElement),
    ...checkFormLabels(rootElement),
    ...checkColorContrast(rootElement),
    ...checkKeyboardAccessibility(rootElement),
    ...checkAriaAttributes(rootElement),
    ...checkLanguageAttributes()
  ];
  
  return {
    issues: allIssues,
    passed: allIssues.length === 0,
    timestamp: new Date(),
    elementsTested: rootElement.querySelectorAll('*').length
  };
}

/**
 * Generate an accessibility report
 * @param result Accessibility check results
 * @returns HTML string containing the report
 */
export function generateAccessibilityReport(result: AccessibilityCheckResult): string {
  const { issues, passed, timestamp, elementsTested } = result;
  
  // Count issues by type
  const criticalCount = issues.filter(issue => issue.type === AccessibilityIssueType.CRITICAL).length;
  const seriousCount = issues.filter(issue => issue.type === AccessibilityIssueType.SERIOUS).length;
  const moderateCount = issues.filter(issue => issue.type === AccessibilityIssueType.MODERATE).length;
  const minorCount = issues.filter(issue => issue.type === AccessibilityIssueType.MINOR).length;
  
  let report = `
    <div class="a11y-report">
      <h2>Accessibility Check Report</h2>
      <p>Timestamp: ${timestamp.toLocaleString()}</p>
      <p>Elements tested: ${elementsTested}</p>
      
      <div class="a11y-summary">
        <h3>Summary</h3>
        <p class="${passed ? 'a11y-pass' : 'a11y-fail'}">
          ${passed ? '✅ All checks passed!' : '❌ Issues found'}
        </p>
        <ul>
          <li>Critical issues: <span class="${criticalCount > 0 ? 'a11y-critical' : ''}">${criticalCount}</span></li>
          <li>Serious issues: <span class="${seriousCount > 0 ? 'a11y-serious' : ''}">${seriousCount}</span></li>
          <li>Moderate issues: <span class="${moderateCount > 0 ? 'a11y-moderate' : ''}">${moderateCount}</span></li>
          <li>Minor issues: <span class="${minorCount > 0 ? 'a11y-minor' : ''}">${minorCount}</span></li>
        </ul>
      </div>
  `;
  
  if (issues.length > 0) {
    report += `
      <div class="a11y-issues">
        <h3>Issues</h3>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Message</th>
              <th>Element</th>
              <th>Help</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    issues.forEach(issue => {
      report += `
        <tr class="a11y-issue-${issue.type}">
          <td>${issue.type.toUpperCase()}</td>
          <td>${issue.message}</td>
          <td><code>${issue.element.outerHTML.substring(0, 100)}${issue.element.outerHTML.length > 100 ? '...' : ''}</code></td>
          <td><a href="${issue.helpUrl}" target="_blank" rel="noopener noreferrer">Learn more</a></td>
        </tr>
      `;
    });
    
    report += `
          </tbody>
        </table>
      </div>
    `;
  }
  
  report += `
    </div>
    <style>
      .a11y-report {
        font-family: system-ui, -apple-system, sans-serif;
        max-width: 1000px;
        margin: 0 auto;
        padding: 20px;
        border: 1px solid #ddd;
        border-radius: 5px;
      }
      .a11y-pass { color: green; font-weight: bold; }
      .a11y-fail { color: red; font-weight: bold; }
      .a11y-critical { color: #d00; font-weight: bold; }
      .a11y-serious { color: #e70; font-weight: bold; }
      .a11y-moderate { color: #e90; font-weight: bold; }
      .a11y-minor { color: #66f; font-weight: bold; }
      .a11y-issues table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
      }
      .a11y-issues th, .a11y-issues td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
      }
      .a11y-issues th {
        background-color: #f2f2f2;
      }
      .a11y-issue-critical { background-color: #fee; }
      .a11y-issue-serious { background-color: #fff0e0; }
      .a11y-issue-moderate { background-color: #fff8e0; }
      .a11y-issue-minor { background-color: #f0f0ff; }
      code {
        display: block;
        white-space: pre-wrap;
        background-color: #f5f5f5;
        padding: 5px;
        font-size: 12px;
        overflow: auto;
      }
    </style>
  `;
  
  return report;
}

/**
 * Display an accessibility report in the DOM
 * @param result Accessibility check results
 * @param targetElement Element to append the report to (defaults to document.body)
 */
export function displayAccessibilityReport(
  result: AccessibilityCheckResult,
  targetElement: HTMLElement = document.body
): void {
  const reportContainer = document.createElement('div');
  reportContainer.className = 'a11y-report-container';
  reportContainer.style.position = 'fixed';
  reportContainer.style.top = '20px';
  reportContainer.style.right = '20px';
  reportContainer.style.zIndex = '9999';
  reportContainer.style.backgroundColor = 'white';
  reportContainer.style.boxShadow = '0 0 10px rgba(0,0,0,0.2)';
  reportContainer.style.maxHeight = '80vh';
  reportContainer.style.overflowY = 'auto';
  reportContainer.style.maxWidth = '90vw';
  
  reportContainer.innerHTML = generateAccessibilityReport(result);
  
  // Add close button
  const closeButton = document.createElement('button');
  closeButton.textContent = 'Close';
  closeButton.style.position = 'absolute';
  closeButton.style.top = '10px';
  closeButton.style.right = '10px';
  closeButton.addEventListener('click', () => {
    reportContainer.remove();
  });
  
  reportContainer.appendChild(closeButton);
  targetElement.appendChild(reportContainer);
}

/**
 * Fix common accessibility issues automatically
 * @param rootElement The root element to fix (defaults to document.body)
 * @returns Number of issues fixed
 */
export function autoFixAccessibilityIssues(rootElement: HTMLElement = document.body): number {
  let fixedCount = 0;
  
  // Fix images without alt text
  const images = rootElement.querySelectorAll('img:not([alt])');
  images.forEach(img => {
    // Set empty alt for decorative images, or filename as fallback for content images
    const src = img.getAttribute('src') || '';
    const fileName = src.split('/').pop() || '';
    const isLikelyDecorative = 
      img.width < 16 || 
      img.height < 16 || 
      src.includes('decoration') || 
      src.includes('background') ||
      img.closest('[role="presentation"]') !== null;
    
    if (isLikelyDecorative) {
      img.setAttribute('alt', '');
      img.setAttribute('role', 'presentation');
    } else {
      // Use filename as fallback alt text, but mark it for review
      img.setAttribute('alt', `[NEEDS REVIEW] ${fileName.split('.')[0].replace(/[-_]/g, ' ')}`);
      img.setAttribute('data-a11y-needs-review', 'true');
    }
    
    fixedCount++;
  });
  
  // Fix form controls without labels
  const formControls = rootElement.querySelectorAll('input:not([type="hidden"]), textarea, select');
  formControls.forEach(control => {
    if (
      !control.hasAttribute('aria-label') && 
      !control.hasAttribute('aria-labelledby') &&
      (!control.id || !rootElement.querySelector(`label[for="${control.id}"]`))
    ) {
      // If control has a name, use it as fallback label
      const name = control.getAttribute('name');
      if (name) {
        control.setAttribute('aria-label', `[NEEDS REVIEW] ${name.replace(/[-_]/g, ' ')}`);
        control.setAttribute('data-a11y-needs-review', 'true');
        fixedCount++;
      }
    }
  });
  
  // Fix clickable divs without keyboard access
  const clickableDivs = rootElement.querySelectorAll('div[onClick]:not([tabindex])');
  clickableDivs.forEach(div => {
    div.setAttribute('tabindex', '0');
    div.setAttribute('role', 'button');
    
    // Add keyboard event handler if there's a click handler
    if (!div.hasAttribute('onkeydown')) {
      div.setAttribute('onkeydown', 'if(event.key === "Enter" || event.key === " ") { this.click(); event.preventDefault(); }');
    }
    
    fixedCount++;
  });
  
  // Fix missing language attribute
  if (!document.documentElement.hasAttribute('lang')) {
    document.documentElement.setAttribute('lang', 'en');
    fixedCount++;
  }
  
  return fixedCount;
}

/**
 * Hook to run accessibility checks in development mode
 * This should be used in a React component
 */
export function useAccessibilityCheck(): void {
  if (process.env.NODE_ENV === 'development') {
    // Only run in development mode
    setTimeout(() => {
      const results = runAccessibilityChecks();
      if (results.issues.length > 0) {
        console.group('Accessibility Issues Detected');
        console.warn(`Found ${results.issues.length} accessibility issues`);
        
        // Group by type
        const byType = results.issues.reduce((acc, issue) => {
          if (!acc[issue.type]) {
            acc[issue.type] = [];
          }
          acc[issue.type].push(issue);
          return acc;
        }, {} as Record<AccessibilityIssueType, AccessibilityIssue[]>);
        
        // Log issues by type
        Object.entries(byType).forEach(([type, issues]) => {
          console.group(`${type} (${issues.length})`);
          issues.forEach(issue => {
            console.warn(`${issue.message}`, issue.element);
            console.log(`Help: ${issue.helpUrl}`);
          });
          console.groupEnd();
        });
        
        console.groupEnd();
        
        // Display report in DOM if in development
        if (process.env.NODE_ENV === 'development') {
          displayAccessibilityReport(results);
        }
      }
    }, 2000); // Delay to allow components to render
  }
}
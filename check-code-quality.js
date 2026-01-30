#!/usr/bin/env node

/**
 * Simple code quality check script for Sage Dashboard
 * Checks for common issues before deployment
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');

// Files to check
const filesToCheck = [
  'src/App.tsx',
  'src/main.tsx',
  'src/components/ErrorBoundary.tsx',
  'src/hooks/useRealtimeProjects.ts',
  'src/hooks/useRealtimeTasks.ts',
  'src/hooks/useRealtimeActivityLog.ts',
  'src/hooks/useRealtimeSubagentRuns.ts',
  'src/pages/Dashboard.tsx',
  'src/pages/Login.tsx',
  'src/pages/ReviewQueue.tsx',
  'src/lib/supabase.ts',
  'src/lib/retry.ts'
];

// Issues found
const issues = {
  consoleLogs: [],
  unusedImports: [],
  typeIssues: [],
  performanceIssues: [],
  errorHandlingIssues: []
};

console.log('🔍 Running code quality checks for Sage Dashboard...\n');

// Check for console.log statements
console.log('1. Checking for console.log statements in production code...');
filesToCheck.forEach(file => {
  if (!fs.existsSync(file)) return;
  
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    if (line.includes('console.log(') && !line.includes('console.error')) {
      issues.consoleLogs.push({
        file,
        line: index + 1,
        content: line.trim()
      });
    }
  });
});

// Check for basic React performance patterns
console.log('2. Checking for React performance patterns...');
const reactFiles = [
  'src/components/ProjectList.tsx',
  'src/components/AgentActivity.tsx',
  'src/components/RecentActivity.tsx'
];

reactFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  
  const content = fs.readFileSync(file, 'utf8');
  
  // Check for React.memo usage in list components
  if (file.includes('List') || file.includes('Activity')) {
    if (!content.includes('React.memo') && !content.includes('memo(')) {
      issues.performanceIssues.push({
        file,
        issue: 'Consider using React.memo for list components'
      });
    }
  }
});

// Check error handling in hooks
console.log('3. Checking error handling in hooks...');
const hookFiles = [
  'src/hooks/useRealtimeProjects.ts',
  'src/hooks/useRealtimeTasks.ts',
  'src/hooks/useRealtimeActivityLog.ts',
  'src/hooks/useRealtimeSubagentRuns.ts'
];

hookFiles.forEach(file => {
  if (!fs.existsSync(file)) return;
  
  const content = fs.readFileSync(file, 'utf8');
  
  // Check for error state management
  if (!content.includes('useState<Error | null>') && !content.includes('Error | null')) {
    issues.errorHandlingIssues.push({
      file,
      issue: 'Missing proper error type annotation'
    });
  }
  
  // Check for error messages
  if (!content.includes('setError(')) {
    issues.errorHandlingIssues.push({
      file,
      issue: 'Missing error state setter usage'
    });
  }
});

// Report findings
console.log('\n📊 Code Quality Report:');
console.log('=' .repeat(50));

if (issues.consoleLogs.length > 0) {
  console.log('\n❌ Console.log statements found:');
  issues.consoleLogs.forEach(issue => {
    console.log(`  ${issue.file}:${issue.line} - ${issue.content}`);
  });
} else {
  console.log('\n✅ No console.log statements found in production code');
}

if (issues.performanceIssues.length > 0) {
  console.log('\n⚠️  Performance considerations:');
  issues.performanceIssues.forEach(issue => {
    console.log(`  ${issue.file}: ${issue.issue}`);
  });
} else {
  console.log('\n✅ Good performance patterns found');
}

if (issues.errorHandlingIssues.length > 0) {
  console.log('\n⚠️  Error handling considerations:');
  issues.errorHandlingIssues.forEach(issue => {
    console.log(`  ${issue.file}: ${issue.issue}`);
  });
} else {
  console.log('\n✅ Good error handling patterns found');
}

// Check for required files
console.log('\n📁 Required files check:');
const requiredFiles = [
  'PERFORMANCE_REPORT.md',
  'TESTING.md',
  'README.md',
  '.env.example',
  'src/components/ErrorBoundary.tsx',
  'src/lib/retry.ts'
];

requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} (MISSING)`);
  }
});

// Summary
console.log('\n' + '=' .repeat(50));
console.log('Summary:');
console.log(`- Console.log issues: ${issues.consoleLogs.length}`);
console.log(`- Performance considerations: ${issues.performanceIssues.length}`);
console.log(`- Error handling considerations: ${issues.errorHandlingIssues.length}`);

const totalIssues = issues.consoleLogs.length + issues.performanceIssues.length + issues.errorHandlingIssues.length;

if (totalIssues === 0) {
  console.log('\n🎉 All checks passed! Code is ready for production.');
  process.exit(0);
} else {
  console.log(`\n⚠️  Found ${totalIssues} issues to address before deployment.`);
  process.exit(1);
}
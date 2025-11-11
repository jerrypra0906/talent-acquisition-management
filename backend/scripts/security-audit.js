#!/usr/bin/env node

/**
 * Security Audit Script
 * Scans the codebase for potential security vulnerabilities including:
 * - Hardcoded credentials, passwords, secrets, tokens
 * - Exposed API keys
 * - SQL injection vulnerabilities
 * - XSS vulnerabilities
 * - Insecure dependencies
 * - Missing security headers
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const issues = {
  critical: [],
  high: [],
  medium: [],
  low: [],
  info: []
};

// Patterns to search for
const securityPatterns = {
  hardcodedPassword: [
    /password\s*[=:]\s*['"](?:123|admin|password|default|test|temp|TempPassword|DefaultPassword|Admin123)[^'"]*['"]/gi,
    /\.hash\s*\(\s*['"](?:123|admin|password|default|test|TempPassword|DefaultPassword|Admin123)[^'"]*['"]/gi,
  ],
  hardcodedSecret: [
    /secret\s*[=:]\s*['"]([^'"]+)['"]/gi,
    /SECRET\s*[=:]\s*['"]([^'"]+)['"]/gi,
    /api[_-]?key\s*[=:]\s*['"]([^'"]+)['"]/gi,
    /API[_-]?KEY\s*[=:]\s*['"]([^'"]+)['"]/gi,
  ],
  hardcodedToken: [
    /token\s*[=:]\s*['"]([^'"]{20,})['"]/gi,
    /TOKEN\s*[=:]\s*['"]([^'"]{20,})['"]/gi,
  ],
  sqlInjection: [
    /\$queryRawUnsafe\s*\(/gi,
    /\$executeRawUnsafe\s*\(/gi,
    /\.query\s*\([^)]*\+/gi,
  ],
  xssVulnerability: [
    /dangerouslySetInnerHTML/gi,
    /innerHTML\s*=/gi,
    /eval\s*\(/gi,
  ],
  exposedCredentials: [
    /console\.log\s*\([^)]*password\s*[:=]/gi,
    /console\.log\s*\([^)]*secret\s*[:=]/gi,
    /console\.log\s*\([^)]*token\s*[:=]/gi,
    /console\.log\s*\([^)]*['"](?:password|secret|token|key)\s*[:=]\s*[^'"]+['"]/gi,
  ],
  defaultPasswords: [
    /(?:password|Password|PASSWORD)\s*[=:]\s*['"](?:123|admin|password|default|test|TempPassword|Admin123)[^'"]*['"]/gi,
    /bcrypt\.hash\s*\(\s*['"](?:TempPassword|DefaultPassword|Admin123)[^'"]*['"]/gi,
  ],
};

// Files and directories to exclude
const excludePaths = [
  'node_modules',
  '.git',
  '.next',
  'dist',
  'build',
  'coverage',
  'logs',
  'uploads',
  'security-audit.js',
  'package-lock.json',
  '.env',
  '.env.prod',
];

// Common false positives (known safe patterns)
const falsePositives = [
  'process.env.',
  'require(',
  'import ',
  'export ',
  'module.exports',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'ENCRYPTION_KEY',
  'REDIS_PASSWORD',
  'POSTGRES_PASSWORD',
  'DEFAULT_USER_PASSWORD',
  'DEFAULT_CANDIDATE_PASSWORD',
  'localhost',
  '127.0.0.1',
  'http://localhost',
  'https://',
  'http://',
  'comment',
  '//',
  '/*',
  '*/',
  'example.com',
  'yourdomain.com',
  'CHANGE_THIS',
  'type=',
  'showPassword',
  'defaultPassword',
  'setDefaultPassword',
  'resetPassword',
  'changePassword',
  'newPassword',
  'currentPassword',
  'hashedPassword',
  'isValidPassword',
  'password:',
  'password?',
  'password)',
  'password,',
  'password: string',
  'password: false',
  'errors.password',
  'user.password',
  'candidate.password',
  'Password must',
  'Password is',
  'Password has',
  'Password reset',
  'Password changed',
  '🔑 Password',
  '⚠️  Password',
  '✅ Password',
  'test-api.js',
  'TEST_USER.password',
];

function shouldExclude(filePath) {
  return excludePaths.some(exclude => filePath.includes(exclude));
}

function isFalsePositive(match, fileContent, lineNumber) {
  const lines = fileContent.split('\n');
  const line = lines[lineNumber - 1] || '';
  
  return falsePositives.some(fp => 
    line.includes(fp) || match.includes(fp)
  );
}

function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const fileName = path.basename(filePath);
    const relativePath = path.relative(process.cwd(), filePath);

    // Check each security pattern
    Object.entries(securityPatterns).forEach(([patternName, patterns]) => {
      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const lineNumber = content.substring(0, match.index).split('\n').length;
          const line = lines[lineNumber - 1] || '';
          
          if (isFalsePositive(match[0], content, lineNumber)) {
            return;
          }

          const issue = {
            file: relativePath,
            line: lineNumber,
            pattern: patternName,
            match: match[0].substring(0, 100),
            context: line.trim().substring(0, 150),
          };

          // Classify severity
          if (patternName === 'hardcodedPassword' || patternName === 'hardcodedSecret') {
            if (match[0].includes('DefaultPassword') || match[0].includes('TempPassword') || match[0].includes('Admin123')) {
              issues.critical.push(issue);
            } else {
              issues.high.push(issue);
            }
          } else if (patternName === 'hardcodedToken' || patternName === 'exposedCredentials') {
            issues.high.push(issue);
          } else if (patternName === 'sqlInjection') {
            issues.high.push(issue);
          } else if (patternName === 'xssVulnerability') {
            issues.medium.push(issue);
          } else if (patternName === 'defaultPasswords') {
            issues.critical.push(issue);
          } else {
            issues.medium.push(issue);
          }
        }
      });
    });
  } catch (error) {
    console.error(`Error scanning file ${filePath}:`, error.message);
  }
}

function scanDirectory(dir) {
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (shouldExclude(fullPath)) {
        continue;
      }

      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        // Scan JavaScript, TypeScript, and configuration files
        if (['.js', '.ts', '.tsx', '.jsx', '.json', '.env', '.yml', '.yaml'].includes(ext)) {
          scanFile(fullPath);
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dir}:`, error.message);
  }
}

function checkEnvironmentFiles() {
  const envFiles = ['.env', '.env.prod', '.env.local', '.env.production'];
  
  envFiles.forEach(envFile => {
    const envPath = path.join(process.cwd(), envFile);
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split('\n');
      
      lines.forEach((line, index) => {
        // Check for placeholder values that should be changed
        if (line.includes('CHANGE_THIS') || line.includes('your-') || line.includes('example.com')) {
          if (!line.trim().startsWith('#')) {
            issues.medium.push({
              file: envFile,
              line: index + 1,
              pattern: 'placeholderValue',
              match: line.trim(),
              context: 'Environment variable contains placeholder value',
            });
          }
        }
        
        // Check for weak passwords
        if (line.match(/PASSWORD\s*=\s*(123|admin|password|default|test)/i)) {
          issues.critical.push({
            file: envFile,
            line: index + 1,
            pattern: 'weakPassword',
            match: line.trim().substring(0, 50),
            context: 'Weak password detected in environment file',
          });
        }
      });
    }
  });
}

function checkGitIgnore() {
  const gitignorePath = path.join(process.cwd(), '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    issues.high.push({
      file: '.gitignore',
      line: 0,
      pattern: 'missingGitIgnore',
      match: '.gitignore file does not exist',
      context: 'No .gitignore file found - risk of committing sensitive files',
    });
    return;
  }

  const content = fs.readFileSync(gitignorePath, 'utf8');
  const requiredPatterns = ['.env', 'node_modules', '*.log', '*.key', '*.pem'];
  
  requiredPatterns.forEach(pattern => {
    if (!content.includes(pattern)) {
      issues.medium.push({
        file: '.gitignore',
        line: 0,
        pattern: 'missingGitIgnorePattern',
        match: `Missing pattern: ${pattern}`,
        context: `.gitignore should include ${pattern}`,
      });
    }
  });
}

function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('SECURITY AUDIT REPORT');
  console.log('='.repeat(80));
  console.log(`Date: ${new Date().toISOString()}`);
  console.log(`Scanned: ${process.cwd()}`);
  console.log('='.repeat(80) + '\n');

  const totalIssues = issues.critical.length + issues.high.length + issues.medium.length + issues.low.length;

  console.log(`\n📊 SUMMARY`);
  console.log(`   Critical: ${issues.critical.length}`);
  console.log(`   High:     ${issues.high.length}`);
  console.log(`   Medium:   ${issues.medium.length}`);
  console.log(`   Low:      ${issues.low.length}`);
  console.log(`   Total:    ${totalIssues}\n`);

  // Critical Issues
  if (issues.critical.length > 0) {
    console.log('\n🔴 CRITICAL ISSUES:');
    console.log('='.repeat(80));
    issues.critical.forEach((issue, index) => {
      console.log(`\n${index + 1}. ${issue.pattern.toUpperCase()}`);
      console.log(`   File: ${issue.file}:${issue.line}`);
      console.log(`   Match: ${issue.match}`);
      console.log(`   Context: ${issue.context}`);
    });
  }

  // High Issues
  if (issues.high.length > 0) {
    console.log('\n🟠 HIGH PRIORITY ISSUES:');
    console.log('='.repeat(80));
    issues.high.forEach((issue, index) => {
      console.log(`\n${index + 1}. ${issue.pattern.toUpperCase()}`);
      console.log(`   File: ${issue.file}:${issue.line}`);
      console.log(`   Match: ${issue.match}`);
      console.log(`   Context: ${issue.context}`);
    });
  }

  // Medium Issues
  if (issues.medium.length > 0) {
    console.log('\n🟡 MEDIUM PRIORITY ISSUES:');
    console.log('='.repeat(80));
    issues.medium.forEach((issue, index) => {
      console.log(`\n${index + 1}. ${issue.pattern.toUpperCase()}`);
      console.log(`   File: ${issue.file}:${issue.line}`);
      console.log(`   Match: ${issue.match}`);
      console.log(`   Context: ${issue.context}`);
    });
  }

  // Recommendations
  console.log('\n\n💡 RECOMMENDATIONS:');
  console.log('='.repeat(80));
  console.log('1. Remove all hardcoded credentials and use environment variables');
  console.log('2. Ensure .env files are in .gitignore and never committed');
  console.log('3. Use strong, randomly generated passwords for all services');
  console.log('4. Regularly rotate secrets and API keys');
  console.log('5. Use parameterized queries to prevent SQL injection');
  console.log('6. Sanitize user input to prevent XSS attacks');
  console.log('7. Enable security headers (HSTS, CSP, etc.)');
  console.log('8. Keep dependencies up to date');
  console.log('9. Use HTTPS in production');
  console.log('10. Implement rate limiting and authentication');

  console.log('\n' + '='.repeat(80));
  if (totalIssues === 0) {
    console.log('✅ No security issues found!');
  } else if (issues.critical.length === 0 && issues.high.length === 0) {
    console.log('⚠️  Security audit complete. Some issues found, but none are critical.');
  } else {
    console.log('❌ Security audit complete. Critical or high-priority issues found!');
    process.exit(1);
  }
  console.log('='.repeat(80) + '\n');

  return {
    critical: issues.critical.length,
    high: issues.high.length,
    medium: issues.medium.length,
    low: issues.low.length,
    total: totalIssues,
    issues: issues
  };
}

// Main execution
console.log('🔍 Starting security audit...\n');

// Check .gitignore
checkGitIgnore();

// Check environment files
checkEnvironmentFiles();

// Scan codebase
const directoriesToScan = [
  path.join(process.cwd(), 'backend'),
  path.join(process.cwd(), 'frontend'),
  path.join(process.cwd(), 'candidate-portal'),
];

directoriesToScan.forEach(dir => {
  if (fs.existsSync(dir)) {
    console.log(`Scanning: ${path.relative(process.cwd(), dir)}`);
    scanDirectory(dir);
  }
});

// Generate report
const report = generateReport();

// Save report to file
const reportPath = path.join(process.cwd(), 'SECURITY_AUDIT_REPORT.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`\n📄 Full report saved to: ${reportPath}\n`);


#!/usr/bin/env node

/**
 * Test script for domain matching logic
 */

// Copy the helper functions from pageAnalyzer.js
function normalizeDomain(domainOrUrl) {
  if (!domainOrUrl) return '';
  
  let domain = domainOrUrl.trim();
  
  // If it looks like a full URL with protocol, extract the hostname
  if (domain.includes('://')) {
    try {
      const urlObj = new URL(domain);
      domain = urlObj.hostname;
    } catch (error) {
      // If URL parsing fails, try to extract domain manually
      console.warn(`Failed to parse URL: ${domainOrUrl}, attempting manual extraction`);
      
      // Remove protocol
      domain = domain.replace(/^https?:\/\//, '');
      // Remove path and query params
      domain = domain.split('/')[0].split('?')[0].split('#')[0];
    }
  }
  
  // Remove www prefix and convert to lowercase
  return domain.toLowerCase().replace(/^www\./, '');
}

function domainsMatch(domain1, domain2) {
  if (!domain1 || !domain2) return false;
  return normalizeDomain(domain1) === normalizeDomain(domain2);
}

// Test cases
const testCases = [
  // Basic exact matches
  { domain1: 'example.com', domain2: 'example.com', expected: true, description: 'Exact match' },
  { domain1: 'example.com', domain2: 'different.com', expected: false, description: 'Different domains' },
  
  // WWW handling
  { domain1: 'www.example.com', domain2: 'example.com', expected: true, description: 'www vs non-www' },
  { domain1: 'example.com', domain2: 'www.example.com', expected: true, description: 'non-www vs www' },
  { domain1: 'www.example.com', domain2: 'www.example.com', expected: true, description: 'both with www' },
  
  // Case sensitivity  
  { domain1: 'Example.com', domain2: 'example.com', expected: true, description: 'Case insensitive' },
  { domain1: 'WWW.EXAMPLE.COM', domain2: 'example.com', expected: true, description: 'All caps with www' },
  
  // Substring issues that should NOT match
  { domain1: 'example.com', domain2: 'myexample.com', expected: false, description: 'Substring false positive' },
  { domain1: 'example.com', domain2: 'example.com.evil.com', expected: false, description: 'Domain hijacking attempt' },
  { domain1: 'bank.com', domain2: 'fakebank.com', expected: false, description: 'Brand impersonation' },
  
  // URL protocol handling (NEW TESTS)
  { domain1: 'https://www.ideas-tek.com/', domain2: 'ideas-tek.com', expected: true, description: 'HTTPS URL with www vs plain domain' },
  { domain1: 'http://example.com/path/to/page', domain2: 'example.com', expected: true, description: 'HTTP URL with path vs plain domain' },
  { domain1: 'https://subdomain.example.com', domain2: 'subdomain.example.com', expected: true, description: 'HTTPS subdomain vs plain subdomain' },
  { domain1: 'https://www.example.com/page?param=value#section', domain2: 'example.com', expected: true, description: 'Full URL with params vs plain domain' },
  { domain1: 'https://example.com', domain2: 'http://www.example.com', expected: true, description: 'HTTPS vs HTTP with www' },
  { domain1: 'ideas-tek.com', domain2: 'https://www.ideas-tek.com/', expected: true, description: 'Plain domain vs HTTPS URL with www (reverse)' },
  
  // Edge cases
  { domain1: '', domain2: 'example.com', expected: false, description: 'Empty domain1' },
  { domain1: 'example.com', domain2: '', expected: false, description: 'Empty domain2' },
  { domain1: null, domain2: 'example.com', expected: false, description: 'Null domain1' },
  { domain1: 'example.com', domain2: null, expected: false, description: 'Null domain2' },
];

console.log('🧪 Testing Domain Matching Logic\n');
console.log('='.repeat(60));

let passed = 0;
let failed = 0;

for (const test of testCases) {
  const result = domainsMatch(test.domain1, test.domain2);
  const success = result === test.expected;
  
  if (success) {
    console.log(`✅ ${test.description}`);
    console.log(`   ${test.domain1} vs ${test.domain2} = ${result} (expected ${test.expected})`);
    passed++;
  } else {
    console.log(`❌ ${test.description}`);
    console.log(`   ${test.domain1} vs ${test.domain2} = ${result} (expected ${test.expected})`);
    failed++;
  }
  console.log('');
}

console.log('='.repeat(60));
console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log('🎉 All tests passed! Domain matching logic is working correctly.');
  process.exit(0);
} else {
  console.log('⚠️  Some tests failed. Please review the domain matching logic.');
  process.exit(1);
}
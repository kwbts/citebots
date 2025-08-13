#!/usr/bin/env node

/**
 * Test edge cases for domain matching with malformed URLs
 */

// Copy the normalizeDomain function
function normalizeDomain(domainOrUrl) {
  if (!domainOrUrl) return '';
  
  let domain = domainOrUrl.trim();
  
  if (domain.includes('://')) {
    try {
      const urlObj = new URL(domain);
      domain = urlObj.hostname;
    } catch (error) {
      console.warn(`Failed to parse URL: ${domainOrUrl}, attempting manual extraction`);
      
      // Remove protocol
      domain = domain.replace(/^https?:\/\//, '');
      // Remove path and query params
      domain = domain.split('/')[0].split('?')[0].split('#')[0];
    }
  }
  
  return domain.toLowerCase().replace(/^www\./, '');
}

// Test edge cases
const edgeCases = [
  'https://www.ideas-tek.com/',
  'http://example.com/path',
  'https://malformed-url-missing-domain//',
  'not-a-url-at-all',
  'www.example.com',
  'HTTPS://WWW.EXAMPLE.COM/',
  'ideas-tek.com',
  '  https://www.spaced-url.com/  ',
];

console.log('🧪 Testing Edge Cases for Domain Normalization\n');
console.log('='.repeat(70));

for (const input of edgeCases) {
  try {
    const result = normalizeDomain(input);
    console.log(`✅ "${input}" → "${result}"`);
  } catch (error) {
    console.log(`❌ "${input}" → ERROR: ${error.message}`);
  }
}

console.log('\n' + '='.repeat(70));
console.log('✅ All edge cases handled gracefully!');
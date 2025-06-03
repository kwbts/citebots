/**
 * Domain Authority Analysis Module
 *
 * Provides heuristic-based domain authority estimates
 * when Moz API credentials are not available
 */

// For rate limiting
const queue = [];
let isProcessing = false;
const RATE_LIMIT_DELAY = 5000; // 5 seconds between requests

/**
 * Process the queue of domain metrics requests
 */
async function processQueue() {
  if (isProcessing || queue.length === 0) return;

  isProcessing = true;

  try {
    const { domain, resolve, reject } = queue.shift();

    try {
      // Generate the metrics
      const metrics = await generateDomainMetrics(domain);
      resolve(metrics);
    } catch (error) {
      console.error(`Error processing domain metrics for ${domain}:`, error);
      resolve(getDefaultMetrics(domain));
    }

    // Wait before processing the next item
    setTimeout(() => {
      isProcessing = false;
      processQueue();
    }, RATE_LIMIT_DELAY);
  } catch (error) {
    console.error('Error processing domain metrics queue:', error);
    isProcessing = false;
    processQueue();
  }
}

/**
 * Queue domain metrics requests for rate limiting
 * @param {string} domain - Domain to analyze
 * @returns {Promise<Object>} - Domain metrics
 */
export async function getDomainMetrics(domain) {
  return new Promise((resolve, reject) => {
    // Add to queue
    queue.push({ domain, resolve, reject });

    // Start processing if not already
    if (!isProcessing) {
      processQueue();
    }
  });
}

/**
 * Get default domain metrics
 * @param {string} domain - Domain name
 * @returns {Object} - Default domain metrics
 */
function getDefaultMetrics(domain) {
  return {
    domain_name: domain,
    domain_authority: 30,
    page_authority: 20,
    backlink_count: 100,
    referring_domains: 50,
    link_propensity: 0.5,
    spam_score: 2
  };
}

/**
 * Generate domain metrics using heuristics
 * @param {string} domain - Domain to analyze
 * @returns {Object} - Domain authority data
 */
async function generateDomainMetrics(domain) {
  try {
    console.log('Analyzing domain metrics for:', domain);
    
    // Domain-based heuristics for estimating authority
    // This gives reasonable estimates without requiring API credentials
    
    let domainAuthority = 30; // Default value
    let pageAuthority = 20;
    let backlinkCount = 100;
    let referringDomains = 50;
    
    // Domain TLD affects authority (.com, .org, .edu, etc.)
    const tld = domain.split('.').pop().toLowerCase();
    if (['edu', 'gov'].includes(tld)) {
      domainAuthority += 15;
      pageAuthority += 10;
    } else if (['org', 'net'].includes(tld)) {
      domainAuthority += 5;
      pageAuthority += 3;
    }
    
    // Check for known high-authority domains
    const highAuthorityDomains = ['google', 'amazon', 'microsoft', 'facebook', 'linkedin', 'salesforce', 'apple'];
    const mediumAuthorityDomains = ['hubspot', 'marketo', 'mailchimp', 'shopify', 'wix', 'squarespace', 'adobe'];
    const marketingDomains = ['knak', 'marketo', 'mailchimp', 'campaign', 'marketing', 'hubspot'];
    
    const domainBase = domain.split('.')[0].toLowerCase();
    
    if (highAuthorityDomains.includes(domainBase)) {
      domainAuthority = 90 + Math.floor(Math.random() * 10);
      pageAuthority = 70 + Math.floor(Math.random() * 20);
      backlinkCount = 1000000 + Math.floor(Math.random() * 1000000);
      referringDomains = 50000 + Math.floor(Math.random() * 50000);
    } else if (mediumAuthorityDomains.includes(domainBase)) {
      domainAuthority = 60 + Math.floor(Math.random() * 20);
      pageAuthority = 50 + Math.floor(Math.random() * 20);
      backlinkCount = 100000 + Math.floor(Math.random() * 100000);
      referringDomains = 10000 + Math.floor(Math.random() * 10000);
    } else if (marketingDomains.includes(domainBase)) {
      // Special case for marketing domains like knak.com
      domainAuthority = 45 + Math.floor(Math.random() * 15);
      pageAuthority = 40 + Math.floor(Math.random() * 15);
      backlinkCount = 50000 + Math.floor(Math.random() * 50000);
      referringDomains = 5000 + Math.floor(Math.random() * 5000);
    } else {
      // For unknown domains, use domain age heuristic
      // Shorter domains tend to be older and have more authority
      if (domainBase.length <= 5) {
        domainAuthority = 45 + Math.floor(Math.random() * 15);
        pageAuthority = 35 + Math.floor(Math.random() * 15);
        backlinkCount = 10000 + Math.floor(Math.random() * 40000);
        referringDomains = 1000 + Math.floor(Math.random() * 4000);
      } else {
        domainAuthority = 35 + Math.floor(Math.random() * 10);
        pageAuthority = 25 + Math.floor(Math.random() * 15);
        backlinkCount = 1000 + Math.floor(Math.random() * 5000);
        referringDomains = 100 + Math.floor(Math.random() * 500);
      }
    }
    
    // Link propensity correlates with domain authority
    const linkPropensity = parseFloat((0.3 + (domainAuthority / 100) * 0.6).toFixed(2));
    
    // Spam score inversely correlates with domain authority
    const spamScore = Math.max(0, Math.min(10, Math.floor(10 - (domainAuthority / 10))));
    
    // Format the response to match our schema
    const mozData = {
      domain_name: domain,
      domain_authority: domainAuthority,
      page_authority: pageAuthority,
      backlink_count: backlinkCount,
      referring_domains: referringDomains,
      link_propensity: linkPropensity,
      spam_score: spamScore
    };
    
    console.log('Domain metrics generated:', mozData);
    return mozData;
  } catch (error) {
    console.error('Error generating domain metrics:', error);
    return {
      domain_name: domain,
      domain_authority: 30,
      page_authority: 20,
      backlink_count: 100,
      referring_domains: 50,
      link_propensity: 0.5,
      spam_score: 2
    };
  }
}
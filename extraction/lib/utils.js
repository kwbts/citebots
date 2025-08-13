/**
 * Utility Functions for Web Scraping & AI Analysis
 * 
 * Common utility functions used across the extraction library
 */

/**
 * Sleep/delay function for rate limiting
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} - Promise that resolves after delay
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} - Promise that resolves with function result
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`⏱️ Retry ${attempt + 1}/${maxRetries} after ${delay}ms: ${error.message}`);
      await sleep(delay);
    }
  }
}

/**
 * Truncate text to a maximum length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
function truncateText(text, maxLength = 100) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Normalize whitespace in text
 * @param {string} text - Text to normalize
 * @returns {string} - Normalized text
 */
function normalizeWhitespace(text) {
  if (!text) return '';
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * Extract numbers from text
 * @param {string} text - Text to extract numbers from
 * @returns {number[]} - Array of numbers found
 */
function extractNumbers(text) {
  if (!text) return [];
  const matches = text.match(/\d+/g);
  return matches ? matches.map(Number) : [];
}

/**
 * Count occurrences of a pattern in text
 * @param {string} text - Text to search
 * @param {string|RegExp} pattern - Pattern to count
 * @param {boolean} caseSensitive - Whether search is case sensitive
 * @returns {number} - Number of occurrences
 */
function countOccurrences(text, pattern, caseSensitive = false) {
  if (!text) return 0;
  
  let searchText = caseSensitive ? text : text.toLowerCase();
  let searchPattern = pattern;
  
  if (typeof pattern === 'string') {
    searchPattern = caseSensitive ? pattern : pattern.toLowerCase();
    return (searchText.match(new RegExp(escapeRegExp(searchPattern), 'g')) || []).length;
  } else if (pattern instanceof RegExp) {
    return (text.match(pattern) || []).length;
  }
  
  return 0;
}

/**
 * Escape special regex characters in a string
 * @param {string} string - String to escape
 * @returns {string} - Escaped string
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Parse JSON safely with fallback
 * @param {string} jsonString - JSON string to parse
 * @param {*} fallback - Fallback value if parsing fails
 * @returns {*} - Parsed object or fallback
 */
function safeJsonParse(jsonString, fallback = null) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('JSON parse error:', error.message);
    return fallback;
  }
}

/**
 * Deep clone an object
 * @param {*} obj - Object to clone
 * @returns {*} - Cloned object
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
}

/**
 * Merge objects deeply
 * @param {Object} target - Target object
 * @param {Object} source - Source object
 * @returns {Object} - Merged object
 */
function deepMerge(target, source) {
  const result = deepClone(target);
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }
  
  return result;
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 * @param {*} value - Value to check
 * @returns {boolean} - Whether value is empty
 */
function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Generate a unique ID
 * @param {number} length - Length of ID
 * @returns {string} - Unique ID
 */
function generateId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Format bytes to human readable format
 * @param {number} bytes - Number of bytes
 * @param {number} decimals - Number of decimal places
 * @returns {string} - Formatted string
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Format duration in milliseconds to human readable format
 * @param {number} ms - Duration in milliseconds
 * @returns {string} - Formatted duration
 */
function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
  return `${(ms / 3600000).toFixed(1)}h`;
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} - Whether URL is valid
 */
function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Extract hostname from URL
 * @param {string} url - URL to extract hostname from
 * @returns {string|null} - Hostname or null if invalid
 */
function extractHostname(url) {
  try {
    return new URL(url).hostname;
  } catch (error) {
    return null;
  }
}

/**
 * Check if string contains any of the patterns
 * @param {string} text - Text to search
 * @param {string[]} patterns - Patterns to look for
 * @param {boolean} caseSensitive - Whether search is case sensitive
 * @returns {boolean} - Whether any pattern is found
 */
function containsAny(text, patterns, caseSensitive = false) {
  if (!text || !patterns || patterns.length === 0) return false;
  
  const searchText = caseSensitive ? text : text.toLowerCase();
  const searchPatterns = caseSensitive ? patterns : patterns.map(p => p.toLowerCase());
  
  return searchPatterns.some(pattern => searchText.includes(pattern));
}

/**
 * Remove HTML tags from text
 * @param {string} html - HTML content
 * @returns {string} - Plain text
 */
function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Convert text to title case
 * @param {string} text - Text to convert
 * @returns {string} - Title case text
 */
function toTitleCase(text) {
  if (!text) return '';
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @param {number} decimals - Number of decimal places
 * @returns {number} - Percentage
 */
function calculatePercentage(value, total, decimals = 1) {
  if (total === 0) return 0;
  return Number(((value / total) * 100).toFixed(decimals));
}

/**
 * Rate limiter class for API calls
 */
class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }
  
  async waitIfNeeded() {
    const now = Date.now();
    
    // Remove old requests outside the window
    this.requests = this.requests.filter(time => now - time < this.windowMs);
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = Math.min(...this.requests);
      const waitTime = this.windowMs - (now - oldestRequest);
      
      if (waitTime > 0) {
        console.log(`⏱️ Rate limit reached, waiting ${waitTime}ms`);
        await sleep(waitTime);
      }
    }
    
    this.requests.push(now);
  }
}

/**
 * Progress tracker for batch operations
 */
class ProgressTracker {
  constructor(total, name = 'Operation') {
    this.total = total;
    this.current = 0;
    this.name = name;
    this.startTime = Date.now();
    this.errors = 0;
  }
  
  increment(isError = false) {
    this.current++;
    if (isError) this.errors++;
    
    const progress = calculatePercentage(this.current, this.total);
    const elapsed = Date.now() - this.startTime;
    const eta = this.current > 0 ? (elapsed / this.current) * (this.total - this.current) : 0;
    
    console.log(`📊 ${this.name}: ${this.current}/${this.total} (${progress}%) - ETA: ${formatDuration(eta)}`);
    
    if (this.errors > 0) {
      console.log(`⚠️ Errors: ${this.errors}/${this.current} (${calculatePercentage(this.errors, this.current)}%)`);
    }
  }
  
  complete() {
    const elapsed = Date.now() - this.startTime;
    const successRate = calculatePercentage(this.current - this.errors, this.current);
    
    console.log(`✅ ${this.name} completed in ${formatDuration(elapsed)}`);
    console.log(`📈 Success rate: ${successRate}% (${this.current - this.errors}/${this.current})`);
  }
}

export {
  sleep,
  retryWithBackoff,
  truncateText,
  normalizeWhitespace,
  extractNumbers,
  countOccurrences,
  escapeRegExp,
  safeJsonParse,
  deepClone,
  deepMerge,
  isEmpty,
  generateId,
  formatBytes,
  formatDuration,
  isValidUrl,
  extractHostname,
  containsAny,
  stripHtml,
  toTitleCase,
  calculatePercentage,
  RateLimiter,
  ProgressTracker
};
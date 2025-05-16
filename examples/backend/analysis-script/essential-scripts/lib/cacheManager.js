// src/lib/cacheManager.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Cache configuration
const CACHE_DIR = path.join(process.cwd(), 'data/cache');
const DEFAULT_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Create MD5 hash of a string
 * @param {string} str - String to hash
 * @returns {string} - MD5 hash
 */
function md5Hash(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

/**
 * Ensure cache directory exists
 * @param {string} dirPath - Directory path to check/create
 */
function ensureCacheDirectory(dirPath = CACHE_DIR) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Get cache file path for a URL
 * @param {string} url - URL to get cache path for
 * @returns {string} - Cache file path
 */
function getCacheFilePath(url) {
  const urlHash = md5Hash(url);
  return path.join(CACHE_DIR, `${urlHash}.json`);
}

/**
 * Check if cache for URL exists and is valid
 * @param {string} url - URL to check
 * @param {number} ttl - Time to live in milliseconds
 * @returns {boolean} - Whether cache is valid
 */
function isCacheValid(url, ttl = DEFAULT_CACHE_TTL) {
  const cacheFile = getCacheFilePath(url);
  
  if (!fs.existsSync(cacheFile)) {
    return false;
  }
  
  try {
    const stats = fs.statSync(cacheFile);
    const fileAge = Date.now() - stats.mtimeMs;
    return fileAge < ttl;
  } catch (error) {
    console.error(`Error checking cache validity for ${url}:`, error.message);
    return false;
  }
}

/**
 * Get data from cache
 * @param {string} url - URL to get cache for
 * @returns {Object|null} - Cached data or null if not found
 */
function getCache(url) {
  const cacheFile = getCacheFilePath(url);
  
  if (!fs.existsSync(cacheFile)) {
    return null;
  }
  
  try {
    const cacheData = fs.readFileSync(cacheFile, 'utf8');
    return JSON.parse(cacheData);
  } catch (error) {
    console.error(`Error reading cache for ${url}:`, error.message);
    return null;
  }
}

/**
 * Save data to cache
 * @param {string} url - URL to save cache for
 * @param {Object} data - Data to cache
 * @returns {boolean} - Whether cache was successful
 */
function setCache(url, data) {
  ensureCacheDirectory();
  const cacheFile = getCacheFilePath(url);
  
  try {
    fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing cache for ${url}:`, error.message);
    return false;
  }
}

/**
 * Clear cache for a specific URL
 * @param {string} url - URL to clear cache for
 * @returns {boolean} - Whether clearing was successful
 */
function clearCache(url) {
  const cacheFile = getCacheFilePath(url);
  
  if (!fs.existsSync(cacheFile)) {
    return true;
  }
  
  try {
    fs.unlinkSync(cacheFile);
    return true;
  } catch (error) {
    console.error(`Error clearing cache for ${url}:`, error.message);
    return false;
  }
}

/**
 * Clear all cache or cache older than a certain age
 * @param {number} maxAge - Maximum age of cache files to keep (in milliseconds)
 * @returns {number} - Number of cache files cleared
 */
function clearAllCache(maxAge = null) {
  ensureCacheDirectory();
  
  try {
    const files = fs.readdirSync(CACHE_DIR);
    let cleared = 0;
    
    files.forEach(file => {
      if (file.endsWith('.json')) {
        const filePath = path.join(CACHE_DIR, file);
        
        // If maxAge is specified, only delete files older than maxAge
        if (maxAge !== null) {
          const stats = fs.statSync(filePath);
          const fileAge = Date.now() - stats.mtimeMs;
          
          if (fileAge < maxAge) {
            return; // Skip this file
          }
        }
        
        fs.unlinkSync(filePath);
        cleared++;
      }
    });
    
    return cleared;
  } catch (error) {
    console.error('Error clearing cache:', error.message);
    return 0;
  }
}

/**
 * Get or retrieve data with caching
 * @param {string} url - URL to get data for
 * @param {Function} fetchFn - Function to fetch data if not cached
 * @param {Object} options - Cache options
 * @returns {Promise<Object>} - Data from cache or fetch function
 */
async function getCachedOrFetch(url, fetchFn, options = {}) {
  const ttl = options.ttl || DEFAULT_CACHE_TTL;
  const bypassCache = options.bypassCache || false;
  
  // If bypassing cache, fetch directly
  if (bypassCache) {
    console.log(`Bypassing cache for ${url}`);
    const data = await fetchFn();
    setCache(url, data); // Still update cache for future
    return data;
  }
  
  // Check if valid cache exists
  if (isCacheValid(url, ttl)) {
    console.log(`Using cached data for ${url}`);
    const cachedData = getCache(url);
    
    if (cachedData) {
      return cachedData;
    }
  }
  
  // If no valid cache, fetch and cache
  console.log(`Fetching fresh data for ${url}`);
  try {
    const data = await fetchFn();
    setCache(url, data);
    return data;
  } catch (error) {
    console.error(`Error fetching data for ${url}:`, error.message);
    
    // If fetch fails but we have outdated cache, use it as fallback
    const cachedData = getCache(url);
    if (cachedData) {
      console.log(`Using outdated cache as fallback for ${url}`);
      return cachedData;
    }
    
    throw error; // Re-throw if no fallback
  }
}

/**
 * Get cache statistics
 * @returns {Object} - Statistics about the cache
 */
function getCacheStats() {
  ensureCacheDirectory();
  
  try {
    const files = fs.readdirSync(CACHE_DIR).filter(file => file.endsWith('.json'));
    let totalSize = 0;
    let oldestFile = null;
    let newestFile = null;
    
    files.forEach(file => {
      const filePath = path.join(CACHE_DIR, file);
      const stats = fs.statSync(filePath);
      
      totalSize += stats.size;
      
      if (!oldestFile || stats.mtimeMs < oldestFile.time) {
        oldestFile = { 
          file, 
          time: stats.mtimeMs,
          date: new Date(stats.mtimeMs)
        };
      }
      
      if (!newestFile || stats.mtimeMs > newestFile.time) {
        newestFile = { 
          file, 
          time: stats.mtimeMs,
          date: new Date(stats.mtimeMs)
        };
      }
    });
    
    return {
      totalFiles: files.length,
      totalSizeBytes: totalSize,
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      oldestFile,
      newestFile
    };
  } catch (error) {
    console.error('Error getting cache stats:', error.message);
    return {
      totalFiles: 0,
      totalSizeBytes: 0,
      totalSizeMB: 0,
      oldestFile: null,
      newestFile: null,
      error: error.message
    };
  }
}

module.exports = {
  isCacheValid,
  getCache,
  setCache,
  clearCache,
  clearAllCache,
  getCachedOrFetch,
  getCacheStats,
  DEFAULT_CACHE_TTL
};
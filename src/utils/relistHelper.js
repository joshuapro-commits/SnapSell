/**
 * Relist Helper Utility
 * Calculates if listings need relisting based on age
 */

const RELIST_THRESHOLD_DAYS = 7; // Listings older than 7 days need relisting

/**
 * Calculate days since a timestamp
 * @param {string} timestamp - ISO timestamp
 * @returns {number} Days elapsed
 */
export const calculateDaysOld = (timestamp) => {
  if (!timestamp) return 0;
  
  const now = new Date();
  const publishDate = new Date(timestamp);
  const diffMs = now - publishDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Check if a listing needs relisting
 * @param {object} listing - Listing object with platform data
 * @returns {object} { needsRelist: boolean, daysOld: number, platforms: [] }
 */
export const calculateRelistStatus = (listing) => {
  if (!listing || listing.status !== 'active') {
    return { needsRelist: false, daysOld: 0, platforms: [] };
  }
  
  const platformsNeedingRelist = [];
  let oldestDays = 0;
  
  // Check Facebook
  if (listing.platforms?.facebook?.published) {
    const lastUpdate = listing.platforms.facebook.lastRelistedAt || 
                      listing.platforms.facebook.publishedAt;
    const daysOld = calculateDaysOld(lastUpdate);
    
    if (daysOld >= RELIST_THRESHOLD_DAYS) {
      platformsNeedingRelist.push('facebook');
      oldestDays = Math.max(oldestDays, daysOld);
    }
  }
  
  // Check Carousell
  if (listing.platforms?.carousell?.published) {
    const lastUpdate = listing.platforms.carousell.lastRelistedAt || 
                      listing.platforms.carousell.publishedAt;
    const daysOld = calculateDaysOld(lastUpdate);
    
    if (daysOld >= RELIST_THRESHOLD_DAYS) {
      platformsNeedingRelist.push('carousell');
      oldestDays = Math.max(oldestDays, daysOld);
    }
  }
  
  // Check Shopee
  if (listing.platforms?.shopee?.published) {
    const lastUpdate = listing.platforms.shopee.lastRelistedAt || 
                      listing.platforms.shopee.publishedAt;
    const daysOld = calculateDaysOld(lastUpdate);
    
    if (daysOld >= RELIST_THRESHOLD_DAYS) {
      platformsNeedingRelist.push('shopee');
      oldestDays = Math.max(oldestDays, daysOld);
    }
  }
  
  return {
    needsRelist: platformsNeedingRelist.length > 0,
    daysOld: oldestDays,
    platforms: platformsNeedingRelist,
  };
};

/**
 * Get count of listings needing relist
 * @param {array} listings - Array of listing objects
 * @returns {number} Count of listings needing relist
 */
export const getRelistCount = (listings) => {
  if (!listings || !Array.isArray(listings)) return 0;
  
  return listings.filter(listing => {
    const status = calculateRelistStatus(listing);
    return status.needsRelist;
  }).length;
};

/**
 * Get all listings needing relist
 * @param {array} listings - Array of listing objects
 * @returns {array} Listings that need relisting
 */
export const getListingsNeedingRelist = (listings) => {
  if (!listings || !Array.isArray(listings)) return [];
  
  return listings
    .map(listing => ({
      ...listing,
      relistStatus: calculateRelistStatus(listing),
    }))
    .filter(listing => listing.relistStatus.needsRelist)
    .sort((a, b) => b.relistStatus.daysOld - a.relistStatus.daysOld); // Oldest first
};

/**
 * Format days old as human-readable string
 * @param {number} days - Number of days
 * @returns {string} Formatted string
 */
export const formatDaysOld = (days) => {
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return '1 week ago';
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 60) return '1 month ago';
  return `${Math.floor(days / 30)} months ago`;
};

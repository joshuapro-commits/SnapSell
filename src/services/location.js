/**
 * Location Service
 * Detects user's country based on IP address
 * Maps to Carousell regions
 */

const CAROUSELL_REGIONS = {
  PH: { id: 'ph', name: 'Philippines', domain: 'carousell.ph' },
  SG: { id: 'sg', name: 'Singapore', domain: 'carousell.sg' },
  ID: { id: 'id', name: 'Indonesia', domain: 'carousell.id' },
};

export const locationService = {
  /**
   * Detect user's country from IP address
   * Uses ip-api.com free API (no key required, unlimited for non-commercial)
   */
  async detectCountry() {
    try {
      console.log('[LOCATION] Detecting country from IP...');
      
      // Try ip-api.com (free, no key, unlimited for non-commercial)
      const response = await fetch('http://ip-api.com/json/', {
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[LOCATION] IP API response:', data);
      
      const countryCode = data.countryCode; // e.g., "PH", "SG", "ID"
      console.log('[LOCATION] Detected country:', countryCode);
      
      return countryCode;
    } catch (error) {
      console.error('[LOCATION] Error detecting country:', error);
      
      // Fallback: Try ipapi.co as backup
      try {
        console.log('[LOCATION] Trying backup API...');
        const backupResponse = await fetch('https://ipapi.co/json/', {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        });
        
        if (backupResponse.ok) {
          const backupData = await backupResponse.json();
          console.log('[LOCATION] Backup API response:', backupData);
          return backupData.country_code;
        }
      } catch (backupError) {
        console.error('[LOCATION] Backup API also failed:', backupError);
      }
      
      return null;
    }
  },

  /**
   * Get Carousell region for a country code
   * Falls back to Philippines if country not supported
   */
  getCarousellRegion(countryCode) {
    if (!countryCode) {
      console.log('[LOCATION] No country code, defaulting to Philippines');
      return CAROUSELL_REGIONS.PH;
    }

    const region = CAROUSELL_REGIONS[countryCode.toUpperCase()];
    
    if (region) {
      console.log('[LOCATION] Mapped to Carousell region:', region.name);
      return region;
    }

    // Default to Philippines for unsupported countries
    console.log('[LOCATION] Country not supported, defaulting to Philippines');
    return CAROUSELL_REGIONS.PH;
  },

  /**
   * Auto-detect Carousell region based on IP
   * Falls back to Philippines if detection fails
   */
  async autoDetectRegion() {
    console.log('[LOCATION] 🌍 Auto-detecting Carousell region...');
    
    try {
      const countryCode = await this.detectCountry();
      const region = this.getCarousellRegion(countryCode);
      
      console.log('[LOCATION] ✅ Selected region:', region.name, `(${region.domain})`);
      return region;
    } catch (error) {
      console.error('[LOCATION] Auto-detection failed, using default:', error);
      console.log('[LOCATION] ✅ Defaulting to Philippines (carousell.ph)');
      return CAROUSELL_REGIONS.PH;
    }
  },
};

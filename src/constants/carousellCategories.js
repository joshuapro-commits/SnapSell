import carousellTaxonomy from '../../Data/carousell_ph_taxonomy.json';

/**
 * Carousell Category Mapping Service
 * Maps SnapSell categories and product names to official Carousell taxonomy
 */

// Build a flat lookup map for fast searching
const buildCategoryMap = () => {
  const map = [];
  
  carousellTaxonomy.categories.forEach(category => {
    // Level 1 only
    if (category.subcategories.length === 0) {
      map.push({
        path: [category.name],
        keywords: category.name.toLowerCase().split(/[\s&]+/)
      });
    }
    
    // Level 2
    category.subcategories.forEach(sub => {
      if (sub.subcategories.length === 0) {
        map.push({
          path: [category.name, sub.name],
          keywords: [...category.name.toLowerCase().split(/[\s&]+/), ...sub.name.toLowerCase().split(/[\s&]+/)]
        });
      }
      
      // Level 3
      sub.subcategories.forEach(subsub => {
        map.push({
          path: [category.name, sub.name, subsub.name],
          keywords: [
            ...category.name.toLowerCase().split(/[\s&]+/), 
            ...sub.name.toLowerCase().split(/[\s&]+/),
            ...subsub.name.toLowerCase().split(/[\s&]+/)
          ]
        });
      });
    });
  });
  
  return map;
};

const CATEGORY_MAP = buildCategoryMap();

/**
 * Get Carousell category path from product name and SnapSell category
 * @param {string} productName - Product name (e.g., "Samsung Microwave Oven")
 * @param {string} snapSellCategory - SnapSell category (e.g., "electronics")
 * @returns {string[]} - Carousell category path (e.g., ["TV & Home Appliances", "Small Appliances"])
 */
export const getCarousellCategoryPath = (productName, snapSellCategory) => {
  const name = productName.toLowerCase();
  const category = snapSellCategory.toLowerCase();
  
  console.log('[CAROUSELL_MAPPING] Input - Product name:', productName, 'Category:', snapSellCategory);
  console.log('[CAROUSELL_MAPPING] Normalized - name:', name, 'category:', category);
  
  // PRIORITY 1: Product name-based mapping (most specific)
  const productMappings = [
    // Home Appliances
    { keywords: ['microwave', 'oven'], path: ['TV & Home Appliances', 'Kitchen Appliances', 'Ovens & Toasters'] },
    { keywords: ['refrigerator', 'fridge'], path: ['TV & Home Appliances', 'Kitchen Appliances', 'Refrigerators and Freezers'] },
    { keywords: ['washing machine', 'washer', 'dryer'], path: ['TV & Home Appliances', 'Washing Machines and Dryers'] },
    { keywords: ['air conditioner', 'aircon', 'ac unit'], path: ['TV & Home Appliances', 'Air Conditioning and Heating'] },
    { keywords: ['fan', 'electric fan'], path: ['Furniture & Home Living', 'Lighting & Fans', 'Fans'] },
    { keywords: ['vacuum', 'vacuum cleaner'], path: ['TV & Home Appliances', 'Vacuum Cleaner & Housekeeping'] },
    { keywords: ['blender', 'mixer', 'juicer'], path: ['TV & Home Appliances', 'Kitchen Appliances', 'Juicers, Blenders & Grinders'] },
    { keywords: ['coffee maker'], path: ['TV & Home Appliances', 'Kitchen Appliances', 'Coffee Machines & Makers'] },
    { keywords: ['toaster'], path: ['TV & Home Appliances', 'Kitchen Appliances', 'Ovens & Toasters'] },
    { keywords: ['rice cooker'], path: ['TV & Home Appliances', 'Kitchen Appliances', 'Cookers'] },
    { keywords: ['tv', 'television'], path: ['TV & Home Appliances', 'TV & Entertainment', 'TV'] },
    { keywords: ['projector'], path: ['TV & Home Appliances', 'TV & Entertainment', 'Projectors'] },
    
    // Fashion
    { keywords: ['backpack', 'school bag', 'rucksack'], path: ["Women's Fashion", 'Bags & Wallets', 'Backpacks'] },
    { keywords: ['bag', 'handbag', 'purse', 'tote', 'sling bag'], path: ["Women's Fashion", 'Bags & Wallets', 'Shoulder Bags'] },
    { keywords: ['mens bag', 'man bag', 'messenger bag'], path: ["Men's Fashion", 'Bags', 'Sling Bags'] },
    { keywords: ['watch', 'wristwatch'], path: ["Men's Fashion", 'Watches & Accessories', 'Watches'] },
    { keywords: ['dress', 'gown'], path: ["Women's Fashion", 'Dresses & Sets', 'Dresses'] },
    { keywords: ['skirt'], path: ["Women's Fashion", 'Bottoms', 'Skirts'] },
    { keywords: ['shirt', 'tshirt', 't-shirt'], path: ["Men's Fashion", 'Tops & Sets', 'Tshirts & Polo Shirts'] },
    { keywords: ['polo'], path: ["Men's Fashion", 'Tops & Sets', 'Formal Shirts'] },
    { keywords: ['pants', 'trousers'], path: ["Men's Fashion", 'Bottoms', 'Trousers'] },
    { keywords: ['jeans'], path: ["Men's Fashion", 'Bottoms', 'Jeans'] },
    { keywords: ['shorts'], path: ["Men's Fashion", 'Bottoms', 'Shorts'] },
    { keywords: ['shoes', 'sneakers'], path: ["Men's Fashion", 'Footwear', 'Sneakers'] },
    { keywords: ['sandals'], path: ["Men's Fashion", 'Footwear', 'Slippers & Slides'] },
    { keywords: ['boots'], path: ["Men's Fashion", 'Footwear', 'Boots'] },
    { keywords: ['heels'], path: ["Women's Fashion", 'Footwear', 'Heels'] },
    
    // Electronics
    { keywords: ['iphone', 'samsung phone', 'android phone', 'smartphone', 'mobile phone'], path: ['Mobile Phones & Gadgets', 'Mobile Phones', 'Android Phones', 'Samsung'] },
    { keywords: ['ipad', 'tablet', 'android tablet'], path: ['Mobile Phones & Gadgets', 'Tablets', 'Android'] },
    { keywords: ['apple watch', 'smartwatch', 'fitness tracker'], path: ['Mobile Phones & Gadgets', 'Wearables & Smart Watches'] },
    { keywords: ['headphone', 'headset'], path: ['Audio', 'Headphones & Headsets'] },
    { keywords: ['earphone', 'earbud', 'airpods'], path: ['Audio', 'Earphones'] },
    { keywords: ['speaker', 'bluetooth speaker', 'soundbar'], path: ['Audio', 'Soundbars, Speakers & Amplifiers'] },
    { keywords: ['microphone', 'mic'], path: ['Audio', 'Microphones'] },
    { keywords: ['laptop', 'notebook', 'macbook'], path: ['Computers & Tech', 'Laptops & Notebooks'] },
    { keywords: ['desktop', 'pc', 'computer'], path: ['Computers & Tech', 'Desktops'] },
    { keywords: ['keyboard'], path: ['Computers & Tech', 'Parts & Accessories', 'Computer Keyboard'] },
    { keywords: ['mouse'], path: ['Computers & Tech', 'Parts & Accessories', 'Mouse & Mousepads'] },
    { keywords: ['monitor'], path: ['Computers & Tech', 'Parts & Accessories', 'Monitor Screens'] },
    { keywords: ['camera', 'dslr', 'mirrorless'], path: ['Photography', 'Cameras'] },
    { keywords: ['lens', 'camera lens'], path: ['Photography', 'Lens & Kits'] },
    { keywords: ['drone'], path: ['Photography', 'Drones'] },
    { keywords: ['playstation', 'ps5', 'ps4'], path: ['Video Gaming', 'Video Game Consoles', 'PlayStation'] },
    { keywords: ['xbox'], path: ['Video Gaming', 'Video Game Consoles', 'Xbox'] },
    { keywords: ['nintendo switch'], path: ['Video Gaming', 'Video Game Consoles', 'Nintendo'] },
    { keywords: ['video game', 'game disc', 'game cartridge'], path: ['Video Gaming', 'Video Games', 'PlayStation'] },
    
    // Furniture & Home
    { keywords: ['sofa', 'couch', 'sectional'], path: ['Furniture & Home Living', 'Furniture', 'Sofas'] },
    { keywords: ['bed', 'mattress', 'bed frame'], path: ['Furniture & Home Living', 'Furniture', 'Bed Frames & Mattresses'] },
    { keywords: ['table', 'desk', 'dining table', 'coffee table'], path: ['Furniture & Home Living', 'Furniture', 'Tables & Sets'] },
    { keywords: ['chair', 'office chair', 'stool'], path: ['Furniture & Home Living', 'Furniture', 'Chairs'] },
    { keywords: ['shelf', 'cabinet', 'drawer', 'storage'], path: ['Furniture & Home Living', 'Furniture', 'Shelves, Cabinets & Racks'] },
    { keywords: ['lamp', 'light', 'chandelier'], path: ['Furniture & Home Living', 'Lighting & Fans', 'Lighting'] },
    { keywords: ['curtain', 'blind'], path: ['Furniture & Home Living', 'Home Decor', 'Curtains & Blinds'] },
    { keywords: ['rug', 'carpet'], path: ['Furniture & Home Living', 'Home Decor', 'Carpets, Mats & Flooring'] },
    
    // Sports & Hobbies
    { keywords: ['bicycle', 'bike', 'mountain bike', 'road bike'], path: ['Sports Equipment', 'Bicycles & Parts', 'Bicycles'] },
    { keywords: ['water bottle', 'tumbler', 'flask', 'hydro flask'], path: ['Furniture & Home Living', 'Kitchenware & Tableware', 'Water Bottles & Tumblers'] },
    { keywords: ['dumbbell', 'barbell', 'weight'], path: ['Sports Equipment', 'Exercise & Fitness', 'Weights & Dumbbells'] },
    { keywords: ['gym equipment'], path: ['Sports Equipment', 'Exercise & Fitness', 'Cardio & Fitness Machines'] },
    { keywords: ['basketball', 'football', 'soccer ball', 'volleyball'], path: ['Sports Equipment', 'Sports & Games', 'Racket and Ball Sports'] },
    { keywords: ['tennis racket', 'badminton racket'], path: ['Sports Equipment', 'Sports & Games', 'Racket and Ball Sports'] },
    
    // Books & Media
    { keywords: ['book', 'novel', 'paperback', 'hardcover'], path: ['Hobbies & Toys', 'Books & Magazines', 'Fiction & Non-Fiction'] },
    { keywords: ['textbook', 'study guide'], path: ['Hobbies & Toys', 'Books & Magazines', 'Textbooks'] },
    { keywords: ['comic', 'manga', 'graphic novel'], path: ['Hobbies & Toys', 'Books & Magazines', 'Comics & Manga'] },
    { keywords: ['magazine'], path: ['Hobbies & Toys', 'Books & Magazines', 'Magazines'] },
    
    // Beauty & Health
    { keywords: ['skincare', 'moisturizer', 'serum', 'cleanser'], path: ['Beauty & Personal Care', 'Face', 'Face Care'] },
    { keywords: ['makeup', 'lipstick', 'foundation', 'eyeshadow'], path: ['Beauty & Personal Care', 'Face', 'Makeup'] },
    { keywords: ['perfume', 'cologne', 'fragrance'], path: ['Beauty & Personal Care', 'Fragrance & Deodorants'] },
    { keywords: ['shampoo', 'conditioner', 'hair product'], path: ['Beauty & Personal Care', 'Hair'] },
    
    // Babies & Kids
    { keywords: ['stroller', 'pram', 'baby stroller'], path: ['Babies & Kids', 'Going Out', 'Strollers'] },
    { keywords: ['car seat', 'baby car seat'], path: ['Babies & Kids', 'Going Out', 'Car Seats'] },
    { keywords: ['baby clothes', 'kids clothes', 'children clothes'], path: ['Babies & Kids', 'Babies & Kids Fashion'] },
    { keywords: ['toy', 'kids toy', 'baby toy'], path: ['Hobbies & Toys', 'Toys & Games'] },
    
    // Toys & Hobbies
    { keywords: ['action figure', 'collectible figure'], path: ['Hobbies & Toys', 'Memorabilia & Collectibles', 'Fan Merchandise'] },
    { keywords: ['board game', 'card game'], path: ['Hobbies & Toys', 'Toys & Games'] },
    { keywords: ['doll', 'barbie'], path: ['Hobbies & Toys', 'Toys & Games'] },
    { keywords: ['lego', 'building blocks'], path: ['Hobbies & Toys', 'Toys & Games'] },
    
    // Pet Supplies
    { keywords: ['dog', 'puppy', 'dog food', 'dog toy'], path: ['Pet Supplies', 'Pet Food'] },
    { keywords: ['cat', 'kitten', 'cat food', 'cat toy'], path: ['Pet Supplies', 'Pet Food'] },
    { keywords: ['fish tank', 'aquarium'], path: ['Pet Supplies', 'Homes & Other Pet Accessories'] },
  ];
  
  // Check product name against mappings
  for (const mapping of productMappings) {
    if (mapping.keywords.some(keyword => name.includes(keyword))) {
      console.log('[CAROUSELL_MAPPING] ✅ Found product name match:', mapping.path, 'for keywords:', mapping.keywords.filter(k => name.includes(k)));
      return mapping.path;
    }
  }
  
  console.log('[CAROUSELL_MAPPING] No product name match found, trying category mapping...');
  
  // PRIORITY 2: SnapSell category-based mapping (fallback)
  const categoryMappings = {
    'electronics': ['Mobile Phones & Gadgets', 'Mobile Phones', 'Android Phones', 'Samsung'],
    'audio': ['Audio', 'Earphones'],
    'appliances': ['TV & Home Appliances', 'Kitchen Appliances', 'Other Kitchen Appliances'],
    'home appliances': ['TV & Home Appliances', 'Kitchen Appliances', 'Other Kitchen Appliances'],
    'clothing': ["Men's Fashion", 'Tops & Sets', 'Tshirts & Polo Shirts'],
    'fashion': ["Women's Fashion", 'Tops', 'Blouses'],
    'shoes': ["Women's Fashion", 'Footwear', 'Sneakers'],
    'bags': ["Women's Fashion", 'Bags & Wallets', 'Shoulder Bags'],
    'furniture': ['Furniture & Home Living', 'Furniture', 'Sofas'],
    'sporting': ['Sports Equipment', 'Other Sports Equipment and Supplies'],
    'sports': ['Sports Equipment', 'Other Sports Equipment and Supplies'],
    'sporting goods': ['Sports Equipment', 'Other Sports Equipment and Supplies'],
    'home & garden': ['Furniture & Home Living', 'Kitchenware & Tableware', 'Water Bottles & Tumblers'],
    'books': ['Hobbies & Toys', 'Books & Magazines', 'Fiction & Non-Fiction'],
    'toys': ['Hobbies & Toys', 'Toys & Games'],
    'beauty': ['Beauty & Personal Care', 'Face', 'Face Care'],
    'health': ['Health & Nutrition', 'Health Supplements', 'Health Food, Drinks & Tonics'],
    'automotive': ['Car Parts & Accessories', 'Other Automotive Parts and Accessories'],
    'pets': ['Pet Supplies', 'Homes & Other Pet Accessories'],
    'jewelry': ["Women's Fashion", 'Jewelry & Organizers', 'Necklaces'],
    'accessories': ["Women's Fashion", 'Watches & Accessories', 'Other Accessories'],
  };
  
  if (categoryMappings[category]) {
    console.log('[CAROUSELL_MAPPING] ✅ Found category match:', categoryMappings[category], 'for category:', category);
    return categoryMappings[category];
  }
  
  console.log('[CAROUSELL_MAPPING] ❌ No mapping found, using Everything Else fallback');
  console.log('[CAROUSELL_MAPPING] Available category keys:', Object.keys(categoryMappings));
  
  // PRIORITY 3: Default fallback
  return ['Everything Else'];
};

/**
 * Validate if a category path exists in Carousell taxonomy
 * @param {string[]} path - Category path to validate
 * @returns {boolean} - True if path exists
 */
export const validateCategoryPath = (path) => {
  console.log('[CAROUSELL_VALIDATION] Validating path:', path);
  
  const isValid = CATEGORY_MAP.some(entry => 
    entry.path.length === path.length &&
    entry.path.every((level, i) => level === path[i])
  );
  
  console.log('[CAROUSELL_VALIDATION] Path is valid:', isValid);
  
  if (!isValid) {
    console.log('[CAROUSELL_VALIDATION] Available paths with same length:');
    const sameLengthPaths = CATEGORY_MAP
      .filter(entry => entry.path.length === path.length)
      .slice(0, 10) // Show first 10 for debugging
      .map(entry => entry.path);
    console.log('[CAROUSELL_VALIDATION] Sample paths:', sameLengthPaths);
  }
  
  return isValid;
};

/**
 * Search for categories by keyword
 * @param {string} keyword - Search keyword
 * @returns {Array} - Matching category paths
 */
export const searchCategories = (keyword) => {
  const search = keyword.toLowerCase();
  return CATEGORY_MAP
    .filter(entry => entry.keywords.some(k => k.includes(search)))
    .map(entry => entry.path);
};

/**
 * Get all top-level categories
 * @returns {string[]} - Array of top-level category names
 */
export const getTopLevelCategories = () => {
  return carousellTaxonomy.categories.map(cat => cat.name);
};

/**
 * Get subcategories for a given category
 * @param {string} categoryName - Top-level category name
 * @returns {string[]} - Array of subcategory names
 */
export const getSubcategories = (categoryName) => {
  const category = carousellTaxonomy.categories.find(cat => cat.name === categoryName);
  return category ? category.subcategories.map(sub => sub.name) : [];
};

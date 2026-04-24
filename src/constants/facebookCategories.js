// Facebook Product Category (FPC) ID Mapping
// Keys use the EXACT text Facebook shows in its UI dropdowns (case-sensitive)
// Source: Meta Developer Resources - taxonomy-with-ids.en-US.csv

export const FPC_CATEGORIES = {
  // Top-level categories — these are section headers in FB's UI, not directly selectable
  'Clothing & accessories': '166',
  'Electronics': '222',
  'Home & garden': '536',
  'Entertainment': '8',
  'Health & beauty': '469',
  'Family': '537',
  'Hobbies': '5710',
  'Sport and outdoors': '988',
  'Vehicles': '916',
  'Pet supplies': '1',
  
  // Top-level categories that are DIRECTLY selectable (no children in our mapping)
  'Furniture': '436',
  'Toys and games': '1253',
  'Antiques and collectibles': '2277',
  'Classifieds': '1503',
  'Garage sale': '1504',
  'Miscellaneous': '1505',
};

// Detailed 2-3 level deep category mappings
export const FPC_DETAILED_CATEGORIES = {
  // Apparel & Accessories (166)
  'Apparel & Accessories > Clothing': '1604',
  'Apparel & Accessories > Clothing > Activewear': '5322',
  'Apparel & Accessories > Clothing > Dresses': '2271',
  'Apparel & Accessories > Clothing > Outerwear': '203',
  'Apparel & Accessories > Clothing > Pants': '204',
  'Apparel & Accessories > Clothing > Shirts & Tops': '212',
  'Apparel & Accessories > Clothing > Shorts': '207',
  'Apparel & Accessories > Clothing > Skirts': '1581',
  'Apparel & Accessories > Clothing > Sleepwear & Loungewear': '208',
  'Apparel & Accessories > Clothing > Suits': '1594',
  'Apparel & Accessories > Clothing > Swimwear': '211',
  'Apparel & Accessories > Clothing > Underwear & Socks': '213',
  'Apparel & Accessories > Clothing > Uniforms': '2306',
  'Apparel & Accessories > Shoes': '187',
  'Apparel & Accessories > Jewelry': '188',
  'Apparel & Accessories > Handbags, Wallets & Cases': '6551',
  'Apparel & Accessories > Clothing Accessories': '167',
  
  // Electronics (222)
  'Electronics > Audio': '223',
  'Electronics > Cameras': '142',
  'Electronics > Computers': '278',
  'Electronics > Computers > Desktop Computers': '325',
  'Electronics > Computers > Laptops': '328',
  'Electronics > Computers > Tablet Computers': '4745',
  'Electronics > Video': '386',
  'Electronics > Video > Televisions': '404',
  'Electronics > Communications': '262',
  'Electronics > Communications > Mobile Phones': '267',
  'Electronics > Video Game Consoles': '1294',
  'Electronics > GPS Navigation Systems': '339',
  
  // Home & Garden (536)
  'Home & Garden > Kitchen & Dining': '668',
  'Home & Garden > Decor': '696',
  'Home & Garden > Linens & Bedding': '569',
  'Home & Garden > Lighting': '594',
  'Home & Garden > Home Appliances': '2901',
  'Home & Garden > Household Supplies': '623',
  'Home & Garden > Lawn & Garden': '985',
  'Home & Garden > Pool & Spa': '1013',
  
  // Sporting Goods (988)
  'Sporting Goods > Athletics': '499713',
  'Sporting Goods > Exercise & Fitness': '499792',
  'Sporting Goods > Outdoor Recreation': '1011',
  'Sporting Goods > Team Sports': '1095',
  'Sporting Goods > Water Sports': '499811',
  
  // Toys & Games (1253)
  'Toys & Games > Toys': '1262',
  'Toys & Games > Games': '1255',
  'Toys & Games > Puzzles': '3793',
  
  // Vehicles (916)
  'Vehicles > Motor Vehicles': '899',
  'Vehicles > Vehicle Parts & Accessories': '8526',
  
  // Health & Beauty (469)
  'Health & Beauty > Personal Care': '526',
  'Health & Beauty > Health Care': '491',
  
  // Baby & Toddler (537)
  'Baby & Toddler > Baby Toys & Activity Equipment': '2847',
  'Baby & Toddler > Baby Transport': '2764',
  'Baby & Toddler > Diapering': '548',
  'Baby & Toddler > Nursing & Feeding': '561',
  
  // Furniture (436)
  'Furniture > Beds & Accessories': '6433',
  'Furniture > Chairs': '443',
  'Furniture > Tables': '6392',
  'Furniture > Cabinets & Storage': '6356',
  'Furniture > Office Furniture': '6362',
  
  // Arts & Entertainment (8)
  'Arts & Entertainment > Hobbies & Creative Arts': '5710',
  'Arts & Entertainment > Party & Celebration': '5709',
  'Arts & Entertainment > Musical Instruments': '54',
  
  // Animals & Pet Supplies (1)
  'Animals & Pet Supplies > Pet Supplies': '2',
  'Animals & Pet Supplies > Pet Supplies > Dog Supplies': '5',
  'Animals & Pet Supplies > Pet Supplies > Cat Supplies': '4',
  'Animals & Pet Supplies > Pet Supplies > Bird Supplies': '3',
  'Animals & Pet Supplies > Pet Supplies > Fish Supplies': '6',
};

// Category-specific required fields mapping
export const FPC_REQUIRED_FIELDS = {
  '166': ['size', 'gender', 'color'], // Apparel & Accessories
  '222': ['brand', 'model'], // Electronics
  '536': ['condition'], // Home & Garden
  '469': ['condition'], // Health & Beauty (Must be 'New')
  '537': ['age_range'], // Baby Products
  '988': ['sport_type'], // Sporting Goods
};

// Map app categories to FPC IDs
export const APP_TO_FPC_MAPPING = {
  'audio': '278',        // Audio devices → Electronics & computers
  'headphones': '278',
  'earbuds': '278',
  'speakers': '278',
  'electronics': '278',  // Generic electronics → Electronics & computers
  'phone': '267',        // Mobile phones
  'mobile': '267',
  'clothing': '1604',    // Women's clothing & shoes (default)
  'apparel': '1604',
  'shoes': '5441',       // Men's clothing & shoes (default for shoes)
  'sneakers': '5441',
  'footwear': '5441',
  'jewelry': '188',      // Jewellery and accessories
  'jewellery': '188',
  'accessories': '188',
  'bags': '6551',        // Bags & luggage
  'luggage': '6551',
  'furniture': '436',
  'home': '623',         // Household
  'household': '623',
  'kitchen': '623',
  'kitchenware': '623',
  'dining': '623',
  'tools': '632',
  'garden': '985',
  'appliances': '2901',
  'books': '783',        // Books, films & music
  'music': '783',
  'films': '783',
  'entertainment': '783',
  'games': '1294',       // Video Games
  'video games': '1294',
  'toys': '1253',        // Toys and games (top-level)
  'toys & games': '1253',
  'sporting': '988',     // Sport and outdoors
  'sporting goods': '988',
  'sport': '988',
  'vehicles': '916',
  'car': '8526',         // Car parts
  'auto': '8526',
  'beauty': '469',       // Health & beauty
  'health': '469',
  'health & beauty': '469',
  'baby': '537',         // Baby & children
  'children': '537',
  'kids': '537',
  'pet': '2',            // Pet supplies
  'pet supplies': '2',
  'art': '5710',         // Arts & crafts
  'arts': '5710',
  'crafts': '5710',
  'hobbies': '5710',
  'bicycle': '1025',     // Bicycles
  'bike': '1025',
  'musical': '54',       // Musical Instruments
  'instruments': '54',
  'antiques': '2277',
  'collectibles': '2277',
  'other': '1505',       // Miscellaneous
  'misc': '1505',
  'miscellaneous': '1505',
};

// Hierarchy map: leaf FPC ID → { parentName, leafName } using exact FB UI text
// parentName = text shown in the first dropdown
// leafName   = text shown after clicking the parent (second dropdown)
// CRITICAL: These names MUST match what Facebook's mobile UI actually renders
export const FPC_HIERARCHY = {
  // Clothing & accessories — actual FB mobile UI sub-options (from logs)
  '6551': { parentName: 'Clothing & accessories', leafName: 'Bags & luggage' },
  '1604': { parentName: 'Clothing & accessories', leafName: "Women's clothing & shoes" },
  '5441': { parentName: 'Clothing & accessories', leafName: "Men's clothing & shoes" },
  '188':  { parentName: 'Clothing & accessories', leafName: 'Jewellery and accessories' },
  
  // Electronics — actual FB mobile UI sub-options
  '278':  { parentName: 'Electronics', leafName: 'Electronics & computers' },
  '267':  { parentName: 'Electronics', leafName: 'Mobile phones' },
  
  // Home & garden — actual FB mobile UI sub-options (confirmed from logs)
  '632':  { parentName: 'Home & garden', leafName: 'Tools' },
  '623':  { parentName: 'Home & garden', leafName: 'Household' },
  '985':  { parentName: 'Home & garden', leafName: 'Garden' },
  '2901': { parentName: 'Home & garden', leafName: 'Appliances' },
  '668':  { parentName: 'Home & garden', leafName: 'Kitchen & dining', uiLabel: 'Household' },
  '696':  { parentName: 'Home & garden', leafName: 'Decor', uiLabel: 'Household' },
  
  // Arts & entertainment — actual FB mobile UI ("Entertainment" in logs)
  '54':   { parentName: 'Entertainment', leafName: 'Musical Instruments' },
  '1294': { parentName: 'Entertainment', leafName: 'Video Games' },
  '783':  { parentName: 'Entertainment', leafName: 'Books, films & music' },
  
  // Health & beauty — actual FB mobile UI
  '469':  { parentName: 'Health & beauty', leafName: 'Health & beauty' },
  
  // Family — actual FB mobile UI ("Baby & children" in logs)
  '537':  { parentName: 'Family', leafName: 'Baby & children' },
  
  // Hobbies — actual FB mobile UI
  '5710': { parentName: 'Hobbies', leafName: 'Arts & crafts' },
  '1025': { parentName: 'Hobbies', leafName: 'Bicycles' },
  
  // Sport and outdoors — actual FB mobile UI
  '988':  { parentName: 'Sport and outdoors', leafName: 'Sport and outdoors' },
  
  // Vehicles — actual FB mobile UI
  '8526': { parentName: 'Vehicles', leafName: 'Car parts' },
  
  // Animals & pet supplies — actual FB mobile UI ("Pet supplies" in logs)
  '2':    { parentName: 'Pet supplies', leafName: 'Pet supplies' },
};

// IDs of top-level categories that have children in FPC_HIERARCHY (section headers in FB UI)
const PARENT_IDS = new Set(Object.values(FPC_HIERARCHY).map(h => {
  const entry = Object.entries(FPC_CATEGORIES).find(([name]) => name === h.parentName);
  return entry ? entry[1] : null;
}).filter(Boolean));

// Flat list for the ListingEditor dropdown — only what FB actually renders as clickable options:
// - Top-level categories that have NO children (directly selectable)
// - Leaf sub-categories from FPC_HIERARCHY, using uiLabel when the deep name doesn't render
export const FB_CATEGORY_LIST = [
  ...Object.entries(FPC_CATEGORIES)
    .filter(([, id]) => !PARENT_IDS.has(id))  // exclude section headers that have children
    .map(([name, id]) => ({ id, name, parentName: null, isLeaf: false })),
  ...Object.entries(FPC_HIERARCHY)
    .filter(([, { uiLabel }]) => !uiLabel)     // exclude deep IDs that don't render directly
    .map(([id, { parentName, leafName }]) => ({ id, name: leafName, parentName, isLeaf: true })),
].sort((a, b) => a.name.localeCompare(b.name));

// Returns true if the FPC ID is a leaf (needs parent drill-down)
export const isLeafCategory = (fpcId) => fpcId in FPC_HIERARCHY;

// Returns the parent display name for a leaf FPC ID, or null if top-level
export const getParentName = (fpcId) => FPC_HIERARCHY[fpcId]?.parentName || null;

// Returns the leaf display name for a FPC ID
export const getLeafName = (fpcId) => {
  if (FPC_HIERARCHY[fpcId]) return FPC_HIERARCHY[fpcId].leafName;
  // Top-level: return the FPC_CATEGORIES name
  const entry = Object.entries(FPC_CATEGORIES).find(([_, id]) => id === fpcId);
  return entry ? entry[0] : null;
};

// Helper function to get FPC ID from app category
export const getFPCId = (appCategory) => {
  const normalized = appCategory?.toLowerCase().trim();
  return APP_TO_FPC_MAPPING[normalized] || '536';
};

// Helper function to get category name from FPC ID (for display in the editor)
export const getCategoryNameFromId = (fpcId) => {
  // First check if it's a leaf category in FPC_HIERARCHY
  if (FPC_HIERARCHY[fpcId]) return FPC_HIERARCHY[fpcId].leafName;
  
  // If it's a top-level category, check if it should be excluded (has children)
  const entry = Object.entries(FPC_CATEGORIES).find(([_, id]) => id === fpcId);
  if (entry) {
    const [name, id] = entry;
    // Check if this category has children - if so, return first child instead
    const firstChild = Object.entries(FPC_HIERARCHY).find(([, h]) => h.parentName === name);
    if (firstChild) {
      return FPC_HIERARCHY[firstChild[0]].leafName;
    }
    return name;
  }
  
  // Fallback to detailed categories
  const detailed = Object.entries(FPC_DETAILED_CATEGORIES).find(([_, id]) => id === fpcId);
  if (detailed) return detailed[0].split(' > ').pop();
  
  return 'Household'; // Safe default
};

// Helper function to get required fields for a category
export const getRequiredFields = (fpcId) => {
  return FPC_REQUIRED_FIELDS[fpcId] || [];
};

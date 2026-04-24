# Facebook Product Category (FPC) ID Integration

## Overview
Implemented stable Facebook Product Category (FPC) ID mapping system to prevent "undefined" errors during listing creation. The system uses numerical IDs instead of text labels, which are subject to change.

## Files Created/Modified

### 1. `/src/constants/facebookCategories.js` (NEW)
- **FPC_CATEGORIES**: Top-level category mappings (e.g., "Apparel & Accessories" → "166")
- **FPC_DETAILED_CATEGORIES**: 2-3 level deep category paths with IDs
- **FPC_REQUIRED_FIELDS**: Category-specific required fields (e.g., Apparel needs size, gender, color)
- **APP_TO_FPC_MAPPING**: Maps app categories to FPC IDs
- **Helper functions**:
  - `getFPCId(appCategory)`: Returns FPC ID for app category
  - `getCategoryNameFromId(fpcId)`: Returns human-readable name
  - `getRequiredFields(fpcId)`: Returns required fields array

### 2. `/src/services/ai.js` (MODIFIED)
- Imports FPC mapping functions
- AI now returns `categoryId`, `categoryName`, and `req uiredFields` in `platformData.facebook`
- Logs FPC ID mapping for debugging
- Example output:
  ```javascript
  platformData: {
    facebook: {
      categoryId: "222",
      categoryName: "Electronics",
      requiredFields: ["brand", "model"],
      shippingAvailable: true
    }
  }
  ```

### 3. `/src/screens/ListingEditorScreen.js` (MODIFIED)
- Uses `facebookCategoryId` and `facebookCategoryName` state instead of text-only
- Maps selected category to FPC ID when user edits
- Displays both category name and ID in UI: "Electronics (ID: 222)"
- Saves FPC ID to listing data

### 4. `/src/screens/FacebookUnifiedWebView.js` (MODIFIED)
- **NEW FUNCTION**: `selectDropdownByValue(labelText, targetFpcId)`
  - Selects dropdown options by `value` attribute (FPC ID) instead of text matching
  - Searches for `value`, `data-id`, or `data-category-id` attributes
  - Falls back to text matching if value attributes not found
- Uses FPC ID from `listingData.platformData.facebook.categoryId`
- Logs FPC ID mapping and selection attempts for debugging

## How It Works

### 1. AI Analysis Phase
```javascript
// AI analyzes image → returns category
const productData = {
  category: "electronics",
  // ...
};

// System maps to FPC ID
const fpcId = getFPCId("electronics"); // Returns "222"
const fpcName = getCategoryNameFromId("222"); // Returns "Electronics"

// Stored in platformData
platformData.facebook = {
  categoryId: "222",
  categoryName: "Electronics",
  requiredFields: ["brand", "model"]
};
```

### 2. Listing Editor Phase
```javascript
// User can edit category
// When selected, maps to FPC ID
const fpcId = getFPCId(selectedCategory);
setFacebookCategoryId(fpcId);
setFacebookCategoryName(getCategoryNameFromId(fpcId));
```

### 3. WebView Injection Phase
```javascript
// WebView receives FPC ID
const fpcId = listingData.platformData.facebook.categoryId; // "222"

// Selects by value attribute instead of text
const option = menuRoot.querySelector(`[value="${fpcId}"]`);
option.click();
```

## Benefits

1. **Stability**: FPC IDs don't change, text labels can
2. **Accuracy**: Direct ID matching eliminates ambiguity
3. **Debugging**: Logs show exact ID being used
4. **Validation**: System knows required fields per category
5. **Future-proof**: Works with Facebook's official taxonomy

## Category-Specific Required Fields

The system tracks required fields per category:

| FPC ID | Category | Required Fields |
|--------|----------|----------------|
| 166 | Apparel & Accessories | size, gender, color |
| 222 | Electronics | brand, model |
| 536 | Home & Garden | condition |
| 469 | Health & Beauty | condition (must be "New") |
| 537 | Baby Products | age_range |
| 988 | Sporting Goods | sport_type |

## Debugging

Console logs show FPC ID mapping:
```
[AI] Mapped "electronics" → FPC ID: 222 (Electronics)
[AI] Required fields for FPC 222: ["brand", "model"]
[Editor] Selected "Electronics" → FPC ID: 222 (Electronics)
[FB_SELL] Category mapping: fpcId=222, fpcName=Electronics
[FB_SELL] Dropdown clicking by ID: fpcId=222
[FB_SELL] Dropdown success: Category = 222
```

## Fallback Strategy

If FPC ID selection fails:
1. Logs available options with their IDs
2. Falls back to text-based matching (old method)
3. Alerts user if category cannot be selected

## Source Data

- **Official taxonomy**: `/Data/taxonomy-with-ids.en-US.csv`
- **Source**: Meta Developer Resources
- **Version**: 2026 taxonomy
- **Total categories**: 1000+ with hierarchical structure

## Next Steps (Optional)

1. **Expand detailed mappings**: Add more 3-level deep categories
2. **Auto-fill required fields**: Use AI to extract brand, model, size, etc.
3. **Category suggestions**: Show user which categories have required fields
4. **Validation**: Warn user if required fields are missing before publish

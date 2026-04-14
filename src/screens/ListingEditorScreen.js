import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useListings } from '../contexts/ListingsContext';
import { useAuth } from '../contexts/AuthContext';
import { platformService } from '../services/platforms';

export const ListingEditorScreen = ({ navigation, route }) => {
  const { productData, listing } = route.params;
  const data = productData || listing;
  const { addListing } = useListings();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState(data.category || 'Electronics');
  const [selectedCondition, setSelectedCondition] = useState(data.condition || 'Like New');
  const [carousellCategory, setCarousellCategory] = useState(data.category || 'Electronics');
  const [carousellCondition, setCarousellCondition] = useState(data.condition || 'Like New');
  const [facebookCategory, setFacebookCategory] = useState(data.platformData?.facebook?.category || 'Other');
  const [facebookCondition, setFacebookCondition] = useState(data.condition || 'Used - Like New');
  const [location, setLocation] = useState(data.location || 'Manila, Philippines');
  const [selectedThumbnail, setSelectedThumbnail] = useState(0);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showConditionDropdown, setShowConditionDropdown] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [productName, setProductName] = useState(data.name || 'Floral Wrap Mini Dress');
  const [description, setDescription] = useState(data.description || data.descriptions?.generic || 'Stay effortlessly stylish with this floral wrap mini dress.');
  const [carousellDescription, setCarousellDescription] = useState(data.descriptions?.carousell || data.description || '');
  const [facebookDescription, setFacebookDescription] = useState(data.descriptions?.facebook || data.description || '');
  const [shopeeDescription, setShopeeDescription] = useState(data.descriptions?.shopee || data.description || '');
  const [carousellHashtags, setCarousellHashtags] = useState(data.platformData?.carousell?.hashtags || []);
  const [carousellMeetupLocations, setCarousellMeetupLocations] = useState(data.platformData?.carousell?.meetupLocations || []);
  const [carousellPrice, setCarousellPrice] = useState((data.suggestedPrice || data.price)?.toString() || '490.50');
  const [facebookPrice, setFacebookPrice] = useState((data.suggestedPrice || data.price)?.toString() || '490.50');
  const [facebookShipping, setFacebookShipping] = useState(data.platformData?.facebook?.shippingAvailable || true);
  const [shopeeCategory, setShopeeCategory] = useState(data.platformData?.shopee?.category || 'Electronics');
  const [shopeeCondition, setShopeeCondition] = useState(data.condition || 'Like New');
  const [shopeePrice, setShopeePrice] = useState((data.suggestedPrice || data.price)?.toString() || '490.50');
  const [shopeeFreeShipping, setShopeeFreeShipping] = useState(data.platformData?.shopee?.freeShipping || false);
  const [price, setPrice] = useState((data.suggestedPrice || data.price)?.toString() || '490.50');
  const [tempValue, setTempValue] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    carousell: true,
    facebook: true,
    shopee: true,
  });

  const categories = [
    { name: 'Electronics', icon: 'phone-portrait-outline' },
    { name: 'Clothing', icon: 'shirt-outline' },
    { name: 'Furniture', icon: 'bed-outline' },
    { name: 'Books', icon: 'book-outline' },
    { name: 'Sporting Goods', icon: 'basketball-outline' },
    { name: 'Toys', icon: 'game-controller-outline' },
    { name: 'Home', icon: 'home-outline' },
    { name: 'Automotive', icon: 'car-outline' },
    { name: 'Beauty', icon: 'sparkles-outline' },
    { name: 'Jewelry', icon: 'diamond-outline' },
    { name: 'Other', icon: 'apps-outline' },
  ];
  const conditions = [
    { name: 'New', icon: 'star' },
    { name: 'Used - Like New', icon: 'star-half' },
    { name: 'Used - Good', icon: 'thumbs-up-outline' },
    { name: 'Used - Fair', icon: 'checkmark-circle-outline' },
  ];
  const thumbnails = [
    { image: data.imageUri },
    { image: data.imageUri },
    { image: data.imageUri },
  ];

  const handleEditPress = (field) => {
    setEditingField(field);
    if (field === 'title') setTempValue(productName);
    if (field === 'description') setTempValue(description);
    if (field === 'carousell') setTempValue(carousellDescription);
    if (field === 'facebook') setTempValue(facebookDescription);
    if (field === 'shopee') setTempValue(shopeeDescription);
    if (field === 'carousellHashtags') setTempValue(carousellHashtags.join(', '));
    if (field === 'carousellMeetup') setTempValue(carousellMeetupLocations.join(', '));
    if (field === 'carousellPrice') setTempValue(carousellPrice);
    if (field === 'facebookPrice') setTempValue(facebookPrice);
    if (field === 'shopeePrice') setTempValue(shopeePrice);
    if (field === 'facebookLocation') setTempValue(location);
    if (field === 'price') setTempValue(price);
    if (field === 'carousellCategory' || field === 'carousellCondition' || field === 'facebookCategory' || field === 'facebookCondition' || field === 'shopeeCategory' || field === 'shopeeCondition') {
      setEditModalVisible(true);
      return;
    }
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (editingField === 'title') setProductName(tempValue);
    if (editingField === 'description') setDescription(tempValue);
    if (editingField === 'carousell') setCarousellDescription(tempValue);
    if (editingField === 'facebook') setFacebookDescription(tempValue);
    if (editingField === 'shopee') setShopeeDescription(tempValue);
    if (editingField === 'carousellHashtags') {
      const tags = tempValue.split(',').map(tag => tag.trim()).filter(tag => tag);
      setCarousellHashtags(tags);
    }
    if (editingField === 'carousellMeetup') {
      const locations = tempValue.split(',').map(loc => loc.trim()).filter(loc => loc);
      setCarousellMeetupLocations(locations);
    }
    if (editingField === 'carousellPrice') setCarousellPrice(tempValue);
    if (editingField === 'facebookPrice') setFacebookPrice(tempValue);
    if (editingField === 'shopeePrice') setShopeePrice(tempValue);
    if (editingField === 'facebookLocation') setLocation(tempValue);
    if (editingField === 'price') setPrice(tempValue);
    setEditModalVisible(false);
    setEditingField(null);
  };

  const handleCategorySelect = (category) => {
    if (editingField === 'carousellCategory') setCarousellCategory(category);
    if (editingField === 'facebookCategory') setFacebookCategory(category);
    if (editingField === 'shopeeCategory') setShopeeCategory(category);
    setEditModalVisible(false);
    setEditingField(null);
  };

  const handleConditionSelect = (condition) => {
    if (editingField === 'carousellCondition') setCarousellCondition(condition);
    if (editingField === 'facebookCondition') setFacebookCondition(condition);
    if (editingField === 'shopeeCondition') setShopeeCondition(condition);
    setEditModalVisible(false);
    setEditingField(null);
  };

  const handleCancelEdit = () => {
    setEditModalVisible(false);
    setEditingField(null);
    setTempValue('');
  };



  const handleAddToCart = async () => {
    if (!selectedPlatforms.carousell && !selectedPlatforms.facebook && !selectedPlatforms.shopee) {
      Alert.alert('Select Platform', 'Please select at least one platform to publish to.');
      return;
    }

    // Check if platforms are connected
    const connectedPlatforms = await platformService.getConnectedPlatforms(user.id);
    
    // Check Facebook connection if selected
    if (selectedPlatforms.facebook && !connectedPlatforms.facebook) {
      Alert.alert(
        'Facebook Not Connected',
        'Please connect your Facebook account first in Settings > Connect Platforms.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Connect Now',
            onPress: () => navigation.navigate('ConnectPlatforms'),
          },
        ]
      );
      return;
    }

    // If only Facebook is selected, go directly to WebView
    if (selectedPlatforms.facebook && !selectedPlatforms.carousell && !selectedPlatforms.shopee) {
      const listingData = {
        name: productName,
        brand: data.brand,
        price: parseFloat(price),
        description: description,
        descriptions: {
          carousell: carousellDescription,
          facebook: facebookDescription,
          shopee: shopeeDescription,
          generic: description,
        },
        category: selectedCategory,
        condition: selectedCondition,
        imageUri: data.imageUri,
        location: location,
        selectedPlatforms: selectedPlatforms,
        platformData: {
          carousell: {
            hashtags: carousellHashtags,
            meetupLocations: carousellMeetupLocations,
            price: parseFloat(carousellPrice),
            category: carousellCategory,
            condition: carousellCondition,
          },
          facebook: {
            category: facebookCategory,
            shippingAvailable: facebookShipping,
            price: parseFloat(facebookPrice),
            condition: facebookCondition,
            location: location,
          },
          shopee: {
            category: shopeeCategory,
            freeShipping: shopeeFreeShipping,
            price: parseFloat(shopeePrice),
            condition: shopeeCondition,
          },
        },
      };

      navigation.navigate('FacebookWebView', { listingData, userId: user.id });
      return;
    }

    // Show publishing progress for other platforms
    Alert.alert(
      'Publishing',
      'Publishing your listing to selected platforms...',
      [],
      { cancelable: false }
    );

    const listingData = {
      name: productName,
      brand: data.brand,
      price: parseFloat(price),
      description: description,
      descriptions: {
        carousell: carousellDescription,
        facebook: facebookDescription,
        shopee: shopeeDescription,
        generic: description,
      },
      category: selectedCategory,
      condition: selectedCondition,
      imageUri: data.imageUri,
      location: location,
      selectedPlatforms: selectedPlatforms,
      platformData: {
        carousell: {
          hashtags: carousellHashtags,
          meetupLocations: carousellMeetupLocations,
          price: parseFloat(carousellPrice),
          category: carousellCategory,
          condition: carousellCondition,
        },
        facebook: {
          category: facebookCategory,
          shippingAvailable: facebookShipping,
          price: parseFloat(facebookPrice),
          condition: facebookCondition,
          location: location,
        },
        shopee: {
          category: shopeeCategory,
          freeShipping: shopeeFreeShipping,
          price: parseFloat(shopeePrice),
          condition: shopeeCondition,
        },
      },
    };

    try {
      // Publish to selected platforms
      const publishResults = await platformService.publishListing(
        listingData,
        selectedPlatforms,
        user.id
      );

      // Add listing to local storage
      const newListing = await addListing({
        ...listingData,
        publishResults: publishResults,
        publishedPlatforms: {
          carousell: publishResults.carousell?.success || false,
          facebook: publishResults.facebook?.success || false,
          shopee: publishResults.shopee?.success || false,
        },
      });

      // Navigate to success screen
      navigation.replace('ListingSuccess', { 
        productName: productName,
        selectedPlatforms: selectedPlatforms,
        publishResults: publishResults,
      });
    } catch (error) {
      console.error('Publishing error:', error);
      Alert.alert(
        'Publishing Error',
        'There was an error publishing your listing. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Image Section - Top Half */}
      <View style={styles.imageSection}>
        <Image source={{ uri: thumbnails[selectedThumbnail].image }} style={styles.mainImage} />
        
        {/* Floating Header */}
        <SafeAreaView edges={['top']} style={styles.floatingHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="bag-outline" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* Bottom Sheet Modal */}
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>
          
          <ScrollView 
            contentContainerStyle={styles.sheetContent}
            showsVerticalScrollIndicator={false}
          >
          {/* Gallery Section */}
          <View style={styles.gallerySection}>
            <Text style={styles.galleryTitle}>Gallery</Text>
            <View style={styles.thumbnailRow}>
              {thumbnails.map((thumb, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.thumbnailItem,
                    selectedThumbnail === index && styles.thumbnailItemSelected
                  ]}
                  onPress={() => setSelectedThumbnail(index)}
                >
                  <Image source={{ uri: thumb.image }} style={styles.thumbnailItemImage} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.titleRow}>
            <Text style={styles.productTitle}>{productName}</Text>
            <TouchableOpacity style={styles.editIcon} onPress={() => handleEditPress('title')}>
              <Ionicons name="pencil" size={18} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Price */}
          <View style={styles.priceSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.priceLabel}>Price</Text>
              <TouchableOpacity style={styles.editIcon} onPress={() => handleEditPress('price')}>
                <Ionicons name="pencil" size={16} color="#999" />
              </TouchableOpacity>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.price}>₱{price}</Text>
              <Text style={styles.originalPrice}>₱690.50</Text>
            </View>
          </View>

          {/* Platform Selection */}
          <View style={styles.platformSelectionSection}>
            <Text style={styles.sectionTitle}>Publish To</Text>
            <Text style={styles.sectionSubtitle}>Select which platforms to publish your listing</Text>
            
            <TouchableOpacity 
              style={styles.platformCheckbox}
              onPress={() => setSelectedPlatforms({...selectedPlatforms, carousell: !selectedPlatforms.carousell})}
            >
              <View style={styles.platformCheckboxLeft}>
                <View style={[styles.checkbox, selectedPlatforms.carousell && styles.checkboxChecked]}>
                  {selectedPlatforms.carousell && (
                    <Ionicons name="checkmark" size={16} color="#FFF" />
                  )}
                </View>
                <View style={[styles.platformIconSmall, { backgroundColor: '#D32F2F' }]}>
                  <Ionicons name="cart-outline" size={20} color="#FFF" />
                </View>
                <Text style={styles.platformCheckboxText}>Carousell</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.platformCheckbox}
              onPress={() => setSelectedPlatforms({...selectedPlatforms, facebook: !selectedPlatforms.facebook})}
            >
              <View style={styles.platformCheckboxLeft}>
                <View style={[styles.checkbox, selectedPlatforms.facebook && styles.checkboxChecked]}>
                  {selectedPlatforms.facebook && (
                    <Ionicons name="checkmark" size={16} color="#FFF" />
                  )}
                </View>
                <View style={[styles.platformIconSmall, { backgroundColor: '#1877F2' }]}>
                  <Ionicons name="logo-facebook" size={20} color="#FFF" />
                </View>
                <Text style={styles.platformCheckboxText}>Facebook Marketplace</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.platformCheckbox}
              onPress={() => setSelectedPlatforms({...selectedPlatforms, shopee: !selectedPlatforms.shopee})}
            >
              <View style={styles.platformCheckboxLeft}>
                <View style={[styles.checkbox, selectedPlatforms.shopee && styles.checkboxChecked]}>
                  {selectedPlatforms.shopee && (
                    <Ionicons name="checkmark" size={16} color="#FFF" />
                  )}
                </View>
                <View style={[styles.platformIconSmall, { backgroundColor: '#EE4D2D' }]}>
                  <Ionicons name="bag-handle" size={20} color="#FFF" />
                </View>
                <Text style={styles.platformCheckboxText}>Shopee</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.descriptionTitle}>Listing Details</Text>
            </View>
            
            {/* Carousell Description */}
            {selectedPlatforms.carousell && (
            <View style={styles.platformDescriptionCard}>
              <View style={styles.platformDescriptionHeader}>
                <View style={styles.platformBadge}>
                  <Ionicons name="cart-outline" size={16} color="#D32F2F" />
                  <Text style={styles.platformBadgeText}>Carousell</Text>
                </View>
              </View>
              
              {/* Description */}
              <View style={styles.platformFieldSection}>
                <View style={styles.platformFieldHeader}>
                  <Text style={styles.platformFieldLabel}>Description</Text>
                  <TouchableOpacity 
                    style={styles.editIconSmall} 
                    onPress={() => handleEditPress('carousell')}
                  >
                    <Ionicons name="pencil" size={14} color="#999" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.descriptionText}>{carousellDescription}</Text>
              </View>
              
              {/* Price */}
              <View style={styles.platformFieldSection}>
                <View style={styles.platformFieldHeader}>
                  <Text style={styles.platformFieldLabel}>Price</Text>
                  <TouchableOpacity 
                    style={styles.editIconSmall} 
                    onPress={() => handleEditPress('carousellPrice')}
                  >
                    <Ionicons name="pencil" size={14} color="#999" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.platformPrice}>₱{carousellPrice}</Text>
              </View>

              {/* Category */}
              <View style={styles.platformFieldSection}>
                <View style={styles.platformFieldHeader}>
                  <Text style={styles.platformFieldLabel}>Category</Text>
                  <TouchableOpacity 
                    style={styles.editIconSmall} 
                    onPress={() => handleEditPress('carousellCategory')}
                  >
                    <Ionicons name="pencil" size={14} color="#999" />
                  </TouchableOpacity>
                </View>
                <View style={styles.platformFieldValue}>
                  <Ionicons name="grid-outline" size={16} color="#666" />
                  <Text style={styles.platformFieldText}>{carousellCategory}</Text>
                </View>
              </View>

              {/* Condition */}
              <View style={styles.platformFieldSection}>
                <View style={styles.platformFieldHeader}>
                  <Text style={styles.platformFieldLabel}>Condition</Text>
                  <TouchableOpacity 
                    style={styles.editIconSmall} 
                    onPress={() => handleEditPress('carousellCondition')}
                  >
                    <Ionicons name="pencil" size={14} color="#999" />
                  </TouchableOpacity>
                </View>
                <View style={styles.platformFieldValue}>
                  <Ionicons name="star-outline" size={16} color="#666" />
                  <Text style={styles.platformFieldText}>{carousellCondition}</Text>
                </View>
              </View>

              {/* Hashtags */}
              <View style={styles.platformFieldSection}>
                <View style={styles.platformFieldHeader}>
                  <Text style={styles.platformFieldLabel}>Hashtags</Text>
                  <TouchableOpacity 
                    style={styles.editIconSmall} 
                    onPress={() => handleEditPress('carousellHashtags')}
                  >
                    <Ionicons name="pencil" size={14} color="#999" />
                  </TouchableOpacity>
                </View>
                <View style={styles.hashtagsContainer}>
                  {carousellHashtags.map((tag, index) => (
                    <View key={index} style={styles.hashtagChip}>
                      <Text style={styles.hashtagText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Meetup Locations */}
              <View style={styles.platformFieldSection}>
                <View style={styles.platformFieldHeader}>
                  <Text style={styles.platformFieldLabel}>Meetup Locations</Text>
                  <TouchableOpacity 
                    style={styles.editIconSmall} 
                    onPress={() => handleEditPress('carousellMeetup')}
                  >
                    <Ionicons name="pencil" size={14} color="#999" />
                  </TouchableOpacity>
                </View>
                <View style={styles.platformFieldValue}>
                  <Ionicons name="location-outline" size={16} color="#666" />
                  <Text style={styles.platformFieldText}>
                    {carousellMeetupLocations.join(', ')}
                  </Text>
                </View>
              </View>
            </View>
            )}

            {/* Facebook Description */}
            {selectedPlatforms.facebook && (
            <View style={styles.platformDescriptionCard}>
              <View style={styles.platformDescriptionHeader}>
                <View style={styles.platformBadge}>
                  <Ionicons name="logo-facebook" size={16} color="#1877F2" />
                  <Text style={styles.platformBadgeText}>Facebook Marketplace</Text>
                </View>
              </View>
              
              {/* Description */}
              <View style={styles.platformFieldSection}>
                <View style={styles.platformFieldHeader}>
                  <Text style={styles.platformFieldLabel}>Description</Text>
                  <TouchableOpacity 
                    style={styles.editIconSmall} 
                    onPress={() => handleEditPress('facebook')}
                  >
                    <Ionicons name="pencil" size={14} color="#999" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.descriptionText}>{facebookDescription}</Text>
              </View>
              
              {/* Price */}
              <View style={styles.platformFieldSection}>
                <View style={styles.platformFieldHeader}>
                  <Text style={styles.platformFieldLabel}>Price</Text>
                  <TouchableOpacity 
                    style={styles.editIconSmall} 
                    onPress={() => handleEditPress('facebookPrice')}
                  >
                    <Ionicons name="pencil" size={14} color="#999" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.platformPrice}>₱{facebookPrice}</Text>
              </View>

              {/* Category */}
              <View style={styles.platformFieldSection}>
                <View style={styles.platformFieldHeader}>
                  <Text style={styles.platformFieldLabel}>Category</Text>
                  <TouchableOpacity 
                    style={styles.editIconSmall} 
                    onPress={() => handleEditPress('facebookCategory')}
                  >
                    <Ionicons name="pencil" size={14} color="#999" />
                  </TouchableOpacity>
                </View>
                <View style={styles.platformFieldValue}>
                  <Ionicons name="pricetag-outline" size={16} color="#666" />
                  <Text style={styles.platformFieldText}>{facebookCategory}</Text>
                </View>
              </View>

              {/* Condition */}
              <View style={styles.platformFieldSection}>
                <View style={styles.platformFieldHeader}>
                  <Text style={styles.platformFieldLabel}>Condition</Text>
                  <TouchableOpacity 
                    style={styles.editIconSmall} 
                    onPress={() => handleEditPress('facebookCondition')}
                  >
                    <Ionicons name="pencil" size={14} color="#999" />
                  </TouchableOpacity>
                </View>
                <View style={styles.platformFieldValue}>
                  <Ionicons name="star-outline" size={16} color="#666" />
                  <Text style={styles.platformFieldText}>{facebookCondition}</Text>
                </View>
              </View>

              {/* Location */}
              <View style={styles.platformFieldSection}>
                <View style={styles.platformFieldHeader}>
                  <Text style={styles.platformFieldLabel}>Location</Text>
                  <TouchableOpacity 
                    style={styles.editIconSmall} 
                    onPress={() => handleEditPress('facebookLocation')}
                  >
                    <Ionicons name="pencil" size={14} color="#999" />
                  </TouchableOpacity>
                </View>
                <View style={styles.platformFieldValue}>
                  <Ionicons name="location-outline" size={16} color="#666" />
                  <Text style={styles.platformFieldText}>{location}</Text>
                </View>
              </View>

              {/* Shipping */}
              <View style={styles.platformFieldSection}>
                <View style={styles.platformFieldHeader}>
                  <Text style={styles.platformFieldLabel}>Shipping</Text>
                  <TouchableOpacity 
                    style={styles.toggleButton}
                    onPress={() => setFacebookShipping(!facebookShipping)}
                  >
                    <View style={[styles.toggleTrack, facebookShipping && styles.toggleTrackActive]}>
                      <View style={[styles.toggleThumb, facebookShipping && styles.toggleThumbActive]} />
                    </View>
                  </TouchableOpacity>
                </View>
                <Text style={styles.platformFieldText}>
                  {facebookShipping ? 'Available' : 'Meetup only'}
                </Text>
              </View>
            </View>
            )}

            {/* Shopee Description */}
            {selectedPlatforms.shopee && (
            <View style={styles.platformDescriptionCard}>
              <View style={styles.platformDescriptionHeader}>
                <View style={styles.platformBadge}>
                  <Ionicons name="bag-handle" size={16} color="#EE4D2D" />
                  <Text style={styles.platformBadgeText}>Shopee</Text>
                </View>
              </View>
              
              {/* Description */}
              <View style={styles.platformFieldSection}>
                <View style={styles.platformFieldHeader}>
                  <Text style={styles.platformFieldLabel}>Description</Text>
                  <TouchableOpacity 
                    style={styles.editIconSmall} 
                    onPress={() => handleEditPress('shopee')}
                  >
                    <Ionicons name="pencil" size={14} color="#999" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.descriptionText}>{shopeeDescription}</Text>
              </View>
              
              {/* Price */}
              <View style={styles.platformFieldSection}>
                <View style={styles.platformFieldHeader}>
                  <Text style={styles.platformFieldLabel}>Price</Text>
                  <TouchableOpacity 
                    style={styles.editIconSmall} 
                    onPress={() => handleEditPress('shopeePrice')}
                  >
                    <Ionicons name="pencil" size={14} color="#999" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.platformPrice}>₱{shopeePrice}</Text>
              </View>

              {/* Category */}
              <View style={styles.platformFieldSection}>
                <View style={styles.platformFieldHeader}>
                  <Text style={styles.platformFieldLabel}>Category</Text>
                  <TouchableOpacity 
                    style={styles.editIconSmall} 
                    onPress={() => handleEditPress('shopeeCategory')}
                  >
                    <Ionicons name="pencil" size={14} color="#999" />
                  </TouchableOpacity>
                </View>
                <View style={styles.platformFieldValue}>
                  <Ionicons name="pricetag-outline" size={16} color="#666" />
                  <Text style={styles.platformFieldText}>{shopeeCategory}</Text>
                </View>
              </View>

              {/* Condition */}
              <View style={styles.platformFieldSection}>
                <View style={styles.platformFieldHeader}>
                  <Text style={styles.platformFieldLabel}>Condition</Text>
                  <TouchableOpacity 
                    style={styles.editIconSmall} 
                    onPress={() => handleEditPress('shopeeCondition')}
                  >
                    <Ionicons name="pencil" size={14} color="#999" />
                  </TouchableOpacity>
                </View>
                <View style={styles.platformFieldValue}>
                  <Ionicons name="star-outline" size={16} color="#666" />
                  <Text style={styles.platformFieldText}>{shopeeCondition}</Text>
                </View>
              </View>

              {/* Free Shipping */}
              <View style={styles.platformFieldSection}>
                <View style={styles.platformFieldHeader}>
                  <Text style={styles.platformFieldLabel}>Free Shipping</Text>
                  <TouchableOpacity 
                    style={styles.toggleButton}
                    onPress={() => setShopeeFreeShipping(!shopeeFreeShipping)}
                  >
                    <View style={[styles.toggleTrack, shopeeFreeShipping && styles.toggleTrackActive]}>
                      <View style={[styles.toggleThumb, shopeeFreeShipping && styles.toggleThumbActive]} />
                    </View>
                  </TouchableOpacity>
                </View>
                <Text style={styles.platformFieldText}>
                  {shopeeFreeShipping ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
            </View>
            )}
          </View>
          </ScrollView>

          {/* Publish Now Button - Fixed at bottom */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.publishButton} onPress={handleAddToCart}>
              <View style={styles.solidButton}>
                <Text style={styles.publishButtonText}>Publish Now</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleCancelEdit}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.editModalContainer}>
            <View style={styles.editModalHeader}>
              <Text style={styles.editModalTitle}>
                {editingField === 'title' && 'Edit Product Name'}
                {editingField === 'description' && 'Edit Description'}
                {editingField === 'carousell' && 'Edit Carousell Description'}
                {editingField === 'facebook' && 'Edit Facebook Description'}
                {editingField === 'shopee' && 'Edit Shopee Description'}
                {editingField === 'carousellHashtags' && 'Edit Hashtags'}
                {editingField === 'carousellMeetup' && 'Edit Meetup Locations'}
                {editingField === 'carousellCategory' && 'Edit Carousell Category'}
                {editingField === 'carousellCondition' && 'Edit Carousell Condition'}
                {editingField === 'carousellPrice' && 'Edit Carousell Price'}
                {editingField === 'facebookCategory' && 'Edit Facebook Category'}
                {editingField === 'facebookCondition' && 'Edit Facebook Condition'}
                {editingField === 'facebookPrice' && 'Edit Facebook Price'}
                {editingField === 'facebookLocation' && 'Edit Location'}
                {editingField === 'shopeeCategory' && 'Edit Shopee Category'}
                {editingField === 'shopeeCondition' && 'Edit Shopee Condition'}
                {editingField === 'shopeePrice' && 'Edit Shopee Price'}
                {editingField === 'price' && 'Edit Price'}
              </Text>
              <TouchableOpacity onPress={handleCancelEdit}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.editModalBody}>
              {(editingField === 'carousellCategory' || editingField === 'facebookCategory' || editingField === 'shopeeCategory') && (
                <ScrollView style={styles.dropdownScrollView}>
                  {categories.map((category) => (
                    <TouchableOpacity
                      key={category.name}
                      style={styles.dropdownItem}
                      onPress={() => handleCategorySelect(category.name)}
                    >
                      <View style={styles.dropdownItemLeft}>
                        <Ionicons name={category.icon} size={20} color="#666" style={styles.dropdownItemIcon} />
                        <Text style={[
                          styles.dropdownItemText,
                          (editingField === 'carousellCategory' && carousellCategory === category.name) && styles.dropdownItemTextSelected,
                          (editingField === 'facebookCategory' && facebookCategory === category.name) && styles.dropdownItemTextSelected,
                          (editingField === 'shopeeCategory' && shopeeCategory === category.name) && styles.dropdownItemTextSelected,
                        ]}>{category.name}</Text>
                      </View>
                      {((editingField === 'carousellCategory' && carousellCategory === category.name) || 
                        (editingField === 'facebookCategory' && facebookCategory === category.name) ||
                        (editingField === 'shopeeCategory' && shopeeCategory === category.name)) && (
                        <Ionicons name="checkmark" size={20} color="#FF6B35" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
              {(editingField === 'carousellCondition' || editingField === 'facebookCondition' || editingField === 'shopeeCondition') && (
                <ScrollView style={styles.dropdownScrollView}>
                  {conditions.map((condition) => (
                    <TouchableOpacity
                      key={condition.name}
                      style={styles.dropdownItem}
                      onPress={() => handleConditionSelect(condition.name)}
                    >
                      <View style={styles.dropdownItemLeft}>
                        <Ionicons name={condition.icon} size={20} color="#666" style={styles.dropdownItemIcon} />
                        <Text style={[
                          styles.dropdownItemText,
                          (editingField === 'carousellCondition' && carousellCondition === condition.name) && styles.dropdownItemTextSelected,
                          (editingField === 'facebookCondition' && facebookCondition === condition.name) && styles.dropdownItemTextSelected,
                          (editingField === 'shopeeCondition' && shopeeCondition === condition.name) && styles.dropdownItemTextSelected,
                        ]}>{condition.name}</Text>
                      </View>
                      {((editingField === 'carousellCondition' && carousellCondition === condition.name) || 
                        (editingField === 'facebookCondition' && facebookCondition === condition.name) ||
                        (editingField === 'shopeeCondition' && shopeeCondition === condition.name)) && (
                        <Ionicons name="checkmark" size={20} color="#FF6B35" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
              {editingField === 'carousellHashtags' && (
                <View>
                  <Text style={styles.editHintText}>Separate hashtags with commas (e.g., Nike, Sneakers, Authentic)</Text>
                  <TextInput
                    style={styles.editInput}
                    value={tempValue}
                    onChangeText={setTempValue}
                    placeholder="Nike, Sneakers, Authentic"
                    placeholderTextColor="#999"
                    autoFocus
                  />
                </View>
              )}
              {editingField === 'carousellMeetup' && (
                <View>
                  <Text style={styles.editHintText}>Separate locations with commas (e.g., Makati, BGC, Ortigas)</Text>
                  <TextInput
                    style={styles.editInput}
                    value={tempValue}
                    onChangeText={setTempValue}
                    placeholder="Makati, BGC, Ortigas"
                    placeholderTextColor="#999"
                    autoFocus
                  />
                </View>
              )}
              {(editingField === 'description' || editingField === 'carousell' || editingField === 'facebook' || editingField === 'shopee') && (
                <TextInput
                  style={styles.editTextArea}
                  value={tempValue}
                  onChangeText={setTempValue}
                  placeholder="Enter description"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  autoFocus
                />
              )}
              {(editingField === 'title' || editingField === 'price' || editingField === 'carousellPrice' || editingField === 'facebookPrice' || editingField === 'shopeePrice' || editingField === 'facebookLocation') && (
                <TextInput
                  style={styles.editInput}
                  value={tempValue}
                  onChangeText={setTempValue}
                  placeholder={editingField.includes('price') || editingField.includes('Price') ? '0.00' : 'Enter text'}
                  placeholderTextColor="#999"
                  keyboardType={editingField.includes('price') || editingField.includes('Price') ? 'decimal-pad' : 'default'}
                  autoFocus
                />
              )}
            </View>

            {!(editingField === 'carousellCategory' || editingField === 'facebookCategory' || editingField === 'shopeeCategory' || editingField === 'carousellCondition' || editingField === 'facebookCondition' || editingField === 'shopeeCondition') && (
              <View style={styles.editModalFooter}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
                  <View style={styles.solidSaveButton}>
                    <Text style={styles.saveButtonText}>Save</Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },
  imageSection: {
    height: '40%',
    position: 'relative',
    backgroundColor: '#000',
  },
  mainImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    gap: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailSelected: {
    borderColor: '#000',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  modalOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '65%',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
  },

  sheetContent: {
    padding: 20,
    paddingBottom: 100,
  },
  gallerySection: {
    marginBottom: 24,
  },
  galleryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
    fontFamily: 'Montserrat_700Bold',
  },
  thumbnailRow: {
    flexDirection: 'row',
    gap: 12,
  },
  thumbnailItem: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  thumbnailItemSelected: {
    borderColor: '#FF6B35',
    borderWidth: 3,
  },
  thumbnailItemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingTop: 24,
  },
  editIcon: {
    padding: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  productTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'Montserrat_700Bold',
    flex: 1,
  },
  productSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontFamily: 'Montserrat_400Regular',
  },
  priceSection: {
    marginBottom: 24,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Montserrat_600SemiBold',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'Montserrat_700Bold',
  },
  originalPrice: {
    fontSize: 18,
    color: '#999',
    textDecorationLine: 'line-through',
    fontFamily: 'Montserrat_400Regular',
  },
  fieldSection: {
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'Montserrat_600SemiBold',
  },
  cardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FC',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  cardIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F0E6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
    fontFamily: 'Montserrat_600SemiBold',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#999',
    fontFamily: 'Montserrat_400Regular',
  },
  dropdownList: {
    marginTop: 8,
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  dropdownScrollView: {
    maxHeight: 400,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F8F9FC',
    marginBottom: 1,
  },
  dropdownItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dropdownItemIcon: {
    marginRight: 12,
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#333',
    fontFamily: 'Montserrat_500Medium',
  },
  dropdownItemTextSelected: {
    color: '#FF6B35',
    fontFamily: 'Montserrat_600SemiBold',
  },
  descriptionSection: {
    marginBottom: 24,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 16,
  },
  platformDescriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  platformDescriptionHeader: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8F9FC',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  platformBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'Montserrat_600SemiBold',
  },
  platformFieldSection: {
    marginBottom: 16,
  },
  platformFieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  platformFieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'Montserrat_600SemiBold',
  },
  platformFieldValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  platformFieldText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Montserrat_400Regular',
    flex: 1,
  },
  editIconSmall: {
    padding: 4,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  hashtagChip: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  hashtagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#2E7D32',
    fontFamily: 'Montserrat_600SemiBold',
  },
  meetupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  meetupText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
    flex: 1,
  },
  fbMetaContainer: {
    marginTop: 12,
    gap: 6,
  },
  fbMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fbMetaText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  platformPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'Montserrat_700Bold',
  },
  toggleButton: {
    padding: 4,
  },
  toggleTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleTrackActive: {
    backgroundColor: '#10B981',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontFamily: 'Montserrat_400Regular',
  },
  buttonContainer: {
    padding: 20,
    paddingBottom: 30,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  publishButton: {
    borderRadius: 30,
    overflow: 'hidden',
  },
  solidButton: {
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: '#FF6B35',
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  publishButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    fontFamily: 'Montserrat_700Bold',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  editModalContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#FFF',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'Montserrat_700Bold',
  },
  editModalBody: {
    padding: 20,
  },
  editHintText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    fontFamily: 'Montserrat_400Regular',
  },
  editInput: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'Montserrat_400Regular',
    backgroundColor: '#F8F9FC',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  editTextArea: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'Montserrat_400Regular',
    backgroundColor: '#F8F9FC',
    borderRadius: 12,
    padding: 16,
    minHeight: 150,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  editModalFooter: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'Montserrat_600SemiBold',
  },
  saveButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  solidSaveButton: {
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FF6B35',
  },
  saveButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    fontFamily: 'Montserrat_700Bold',
  },
  platformSelectionSection: {
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    fontFamily: 'Montserrat_700Bold',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
    marginBottom: 16,
  },
  platformCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FC',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  platformCheckboxLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  checkboxChecked: {
    backgroundColor: '#FF6B35',
    borderColor: '#FF6B35',
  },
  platformIconSmall: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  platformCheckboxText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Montserrat_600SemiBold',
  },
});

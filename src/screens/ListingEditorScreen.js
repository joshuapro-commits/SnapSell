import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useListings } from '../contexts/ListingsContext';

export const ListingEditorScreen = ({ navigation, route }) => {
  const { productData, listing } = route.params;
  const data = productData || listing;
  const { addListing } = useListings();
  const [selectedCategory, setSelectedCategory] = useState(data.category || 'Electronics');
  const [selectedCondition, setSelectedCondition] = useState(data.condition || 'Like New');
  const [location, setLocation] = useState(data.location || 'Manila, Philippines');
  const [selectedThumbnail, setSelectedThumbnail] = useState(0);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showConditionDropdown, setShowConditionDropdown] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [productName, setProductName] = useState(data.name || 'Floral Wrap Mini Dress');
  const [description, setDescription] = useState(data.description || 'Stay effortlessly stylish with this floral wrap mini dress.');
  const [price, setPrice] = useState((data.suggestedPrice || data.price)?.toString() || '490.50');
  const [tempValue, setTempValue] = useState('');

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
    { name: 'Brand New', icon: 'star' },
    { name: 'Like New', icon: 'star-half' },
    { name: 'Excellent', icon: 'thumbs-up-outline' },
    { name: 'Good', icon: 'checkmark-circle-outline' },
    { name: 'Fair', icon: 'remove-circle-outline' },
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
    if (field === 'price') setTempValue(price);
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (editingField === 'title') setProductName(tempValue);
    if (editingField === 'description') setDescription(tempValue);
    if (editingField === 'price') setPrice(tempValue);
    setEditModalVisible(false);
    setEditingField(null);
  };

  const handleCancelEdit = () => {
    setEditModalVisible(false);
    setEditingField(null);
    setTempValue('');
  };



  const handleAddToCart = async () => {
    await addListing({
      name: productName,
      brand: data.brand,
      price: parseFloat(price),
      description: description,
      category: selectedCategory,
      condition: selectedCondition,
      imageUri: data.imageUri,
      location: location,
    });
    navigation.replace('ListingSuccess', { productName: productName });
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

          {/* Description */}
          <View style={styles.descriptionSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.descriptionTitle}>Description</Text>
              <TouchableOpacity style={styles.editIcon} onPress={() => handleEditPress('description')}>
                <Ionicons name="pencil" size={16} color="#999" />
              </TouchableOpacity>
            </View>
            <Text style={styles.descriptionText}>{description}</Text>
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

          {/* Category Selector */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Category</Text>
            <TouchableOpacity 
              style={styles.cardButton}
              onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <View style={styles.cardIconContainer}>
                <Ionicons name="grid-outline" size={22} color="#FF6B35" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{selectedCategory}</Text>
                <Text style={styles.cardSubtitle}>Product category</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
            {showCategoryDropdown && (
              <View style={styles.dropdownList}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.name}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedCategory(category.name);
                      setShowCategoryDropdown(false);
                    }}
                  >
                    <View style={styles.dropdownItemLeft}>
                      <Ionicons name={category.icon} size={20} color="#666" style={styles.dropdownItemIcon} />
                      <Text style={[
                        styles.dropdownItemText,
                        selectedCategory === category.name && styles.dropdownItemTextSelected
                      ]}>
                        {category.name}
                      </Text>
                    </View>
                    {selectedCategory === category.name && (
                      <Ionicons name="checkmark" size={20} color="#FF6B35" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Condition Selector */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Condition</Text>
            <TouchableOpacity 
              style={styles.cardButton}
              onPress={() => setShowConditionDropdown(!showConditionDropdown)}
            >
              <View style={styles.cardIconContainer}>
                <Ionicons name="star-outline" size={22} color="#FF6B35" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{selectedCondition}</Text>
                <Text style={styles.cardSubtitle}>Item condition</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
            {showConditionDropdown && (
              <View style={styles.dropdownList}>
                {conditions.map((condition) => (
                  <TouchableOpacity
                    key={condition.name}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedCondition(condition.name);
                      setShowConditionDropdown(false);
                    }}
                  >
                    <View style={styles.dropdownItemLeft}>
                      <Ionicons name={condition.icon} size={20} color="#666" style={styles.dropdownItemIcon} />
                      <Text style={[
                        styles.dropdownItemText,
                        selectedCondition === condition.name && styles.dropdownItemTextSelected
                      ]}>
                        {condition.name}
                      </Text>
                    </View>
                    {selectedCondition === condition.name && (
                      <Ionicons name="checkmark" size={20} color="#FF6B35" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Location Input */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>Location</Text>
            <TouchableOpacity style={styles.cardButton}>
              <View style={styles.cardIconContainer}>
                <Ionicons name="location-outline" size={22} color="#FF6B35" />
              </View>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{location}</Text>
                <Text style={styles.cardSubtitle}>Pickup location</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
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
                {editingField === 'price' && 'Edit Price'}
              </Text>
              <TouchableOpacity onPress={handleCancelEdit}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.editModalBody}>
              {editingField === 'description' ? (
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
              ) : (
                <TextInput
                  style={styles.editInput}
                  value={tempValue}
                  onChangeText={setTempValue}
                  placeholder={editingField === 'price' ? '0.00' : 'Enter text'}
                  placeholderTextColor="#999"
                  keyboardType={editingField === 'price' ? 'decimal-pad' : 'default'}
                  autoFocus
                />
              )}
            </View>

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
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
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
});

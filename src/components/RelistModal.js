import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const RelistModal = ({ visible, listing, onConfirm, onCancel }) => {
  if (!listing) return null;
  
  const platforms = listing.relistStatus?.platforms || [];
  const daysOld = listing.relistStatus?.daysOld || 0;
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="refresh-circle" size={64} color="#F59E0B" />
          </View>
          
          {/* Title */}
          <Text style={styles.title}>Relist to Top?</Text>
          
          {/* Description */}
          <Text style={styles.description}>
            This listing is {daysOld} day{daysOld > 1 ? 's' : ''} old and buried in search results.
          </Text>
          
          {/* Platforms */}
          <View style={styles.platformsContainer}>
            <Text style={styles.platformsLabel}>Will relist on:</Text>
            <View style={styles.platformsList}>
              {platforms.includes('facebook') && (
                <View style={styles.platformBadge}>
                  <Ionicons name="logo-facebook" size={16} color="#1877F2" />
                  <Text style={styles.platformText}>Facebook</Text>
                </View>
              )}
              {platforms.includes('carousell') && (
                <View style={styles.platformBadge}>
                  <Ionicons name="pricetag" size={16} color="#D32F2F" />
                  <Text style={styles.platformText}>Carousell</Text>
                </View>
              )}
              {platforms.includes('shopee') && (
                <View style={styles.platformBadge}>
                  <Ionicons name="cart" size={16} color="#EE4D2D" />
                  <Text style={styles.platformText}>Shopee</Text>
                </View>
              )}
            </View>
          </View>
          
          {/* Benefits */}
          <View style={styles.benefitsContainer}>
            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.benefitText}>Pushes listing back to top</Text>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.benefitText}>Resets visibility timer</Text>
            </View>
            <View style={styles.benefitRow}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.benefitText}>Takes ~10 seconds</Text>
            </View>
          </View>
          
          {/* Buttons */}
          <View style={styles.buttons}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={onCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.confirmButton}
              onPress={onConfirm}
              activeOpacity={0.7}
            >
              <Ionicons name="refresh" size={18} color="#FFF" />
              <Text style={styles.confirmText}>Relist Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Montserrat_700Bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    fontFamily: 'Montserrat_400Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  platformsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  platformsLabel: {
    fontSize: 13,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#666',
    marginBottom: 8,
  },
  platformsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  platformText: {
    fontSize: 13,
    fontFamily: 'Montserrat_500Medium',
    color: '#374151',
  },
  benefitsContainer: {
    width: '100%',
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 10,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitText: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    color: '#166534',
    flex: 1,
  },
  buttons: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#6B7280',
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmText: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#FFF',
  },
});

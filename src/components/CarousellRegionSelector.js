import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CAROUSELL_REGIONS } from '../constants/carousellRegions';

export const CarousellRegionSelector = ({ visible, onSelect, onClose }) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Your Region</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#1A1D1F" />
            </TouchableOpacity>
          </View>

          {CAROUSELL_REGIONS.map((region) => (
            <TouchableOpacity
              key={region.id}
              style={styles.regionItem}
              onPress={() => onSelect(region)}
            >
              <Text style={styles.flag}>{region.flag}</Text>
              <View style={styles.regionInfo}>
                <Text style={styles.regionName}>{region.name}</Text>
                <Text style={styles.regionDomain}>{region.domain}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#6F7787" />
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
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
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Montserrat_700Bold',
    color: '#1A1D1F',
  },
  regionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  flag: {
    fontSize: 32,
    marginRight: 16,
  },
  regionInfo: {
    flex: 1,
  },
  regionName: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#1A1D1F',
    marginBottom: 2,
  },
  regionDomain: {
    fontSize: 13,
    fontFamily: 'Montserrat_400Regular',
    color: '#6F7787',
  },
});

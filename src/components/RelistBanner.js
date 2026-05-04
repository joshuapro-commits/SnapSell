import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const RelistBanner = ({ count, onRelistAll, onViewListings }) => {
  if (count === 0) return null;
  
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name="time-outline" size={24} color="#F59E0B" />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>
          ⚡ {count} listing{count > 1 ? 's' : ''} need{count === 1 ? 's' : ''} relisting
        </Text>
        <Text style={styles.subtitle}>
          Boost visibility by pushing to the top
        </Text>
      </View>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={onRelistAll}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>Relist All</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#92400E',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Montserrat_400Regular',
    color: '#B45309',
  },
  button: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Montserrat_600SemiBold',
  },
});

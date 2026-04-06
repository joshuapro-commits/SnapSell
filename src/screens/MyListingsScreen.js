import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { useListings } from '../contexts/ListingsContext';
import { useAuth } from '../contexts/AuthContext';

export const MyListingsScreen = ({ navigation }) => {
  const { myListings, loading, deleteListing, refreshListings } = useListings();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('Active');

  const tabs = ['Active (5)', 'Sold (2)', 'Drafts (3)'];

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshListings();
    setRefreshing(false);
  };

  const handleProductPress = (listing) => {
    navigation.navigate('ProductDetail', { listing });
  };

  const handleDeleteListing = (id, name) => {
    Alert.alert(
      'Delete Listing',
      `Are you sure you want to delete "${name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteListing(id),
        },
      ]
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const renderListingCard = ({ item, index }) => (
    <View style={styles.card}>
      <View style={styles.cardImageContainer}>
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={styles.cardImage} />
        ) : (
          <View style={styles.cardImagePlaceholder}>
            <Ionicons name="image-outline" size={40} color="#CCC" />
          </View>
        )}
        <View style={styles.soldOutBadge}>
          <Text style={styles.soldOutText}>SOLD OUT</Text>
        </View>
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={20} color="#666" />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.cardPrice}>₱{item.price.toLocaleString()}</Text>
        
        <View style={styles.cardStats}>
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={14} color="#666" />
            <Text style={styles.statText}>0 views</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="heart-outline" size={14} color="#666" />
            <Text style={styles.statText}>0 likes</Text>
          </View>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.markSoldButton}>
            <Text style={styles.markSoldText}>Mark as Sold</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.editButton}>
            <Text style={styles.editButtonText}>Edit Listing</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.boostButton}>
          <Ionicons name="flash" size={16} color="#FF6B35" />
          <Text style={styles.boostButtonText}>BOOST LISTING</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.logo}>SnapSell</Text>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Title Section */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>My Listings</Text>
        <Text style={styles.subtitle}>Manage your active, sold, and draft items effortlessly.</Text>
      </View>

      {/* Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.tabContainer}
        contentContainerStyle={styles.tabContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              selectedTab === tab.split(' ')[0] && styles.tabActive
            ]}
            onPress={() => setSelectedTab(tab.split(' ')[0])}
          >
            <Text style={[
              styles.tabText,
              selectedTab === tab.split(' ')[0] && styles.tabTextActive
            ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Listings */}
      <FlatList
        data={myListings}
        keyExtractor={(item) => item.id}
        renderItem={renderListingCard}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#FF6B35"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={56} color="#CCCCCC" />
            <Text style={styles.emptyText}>No listings yet</Text>
            <Text style={styles.emptySubtext}>
              Start selling by taking a photo of your item
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => navigation.navigate('Sell')}
            >
              <Text style={styles.emptyButtonText}>Create Listing</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('Sell')}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="home-outline" size={20} color="#666" />
          <Text style={styles.navLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Sell')}
        >
          <View style={styles.sellButton}>
            <Ionicons name="add" size={28} color="#FFF" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="list" size={20} color="#000" />
          <Text style={styles.navLabelActive}>My Listings</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-outline" size={20} color="#666" />
          <Text style={styles.navLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFF',
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B35',
    fontFamily: 'Montserrat_700Bold',
  },
  notificationButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 4,
    fontFamily: 'Montserrat_700Bold',
  },
  subtitle: {
    fontSize: 13,
    color: '#999',
    lineHeight: 18,
    fontFamily: 'Montserrat_400Regular',
  },
  tabContainer: {
    backgroundColor: '#FFF',
    maxHeight: 60,
  },
  tabContent: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: '#FF6B35',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'Montserrat_600SemiBold',
  },
  tabTextActive: {
    color: '#FFF',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardImageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
  },
  cardImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  soldOutBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FF4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  soldOutText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: 'Montserrat_700Bold',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    flex: 1,
    fontFamily: 'Montserrat_700Bold',
  },
  cardPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF6B35',
    marginBottom: 12,
    fontFamily: 'Montserrat_700Bold',
  },
  cardStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Montserrat_400Regular',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  markSoldButton: {
    flex: 1,
    backgroundColor: '#00D9A5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  markSoldText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFF',
    fontFamily: 'Montserrat_700Bold',
  },
  editButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
    fontFamily: 'Montserrat_600SemiBold',
  },
  boostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FFF4ED',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE8E0',
  },
  boostButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF6B35',
    letterSpacing: 0.5,
    fontFamily: 'Montserrat_700Bold',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Montserrat_600SemiBold',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Montserrat_400Regular',
  },
  emptyButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    backgroundColor: '#FF6B35',
    borderRadius: 24,
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    fontFamily: 'Montserrat_600SemiBold',
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    paddingBottom: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  sellButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#7704F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  navLabel: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
    fontFamily: 'Montserrat_500Medium',
  },
  navLabelActive: {
    fontSize: 10,
    color: '#000',
    fontWeight: '600',
    fontFamily: 'Montserrat_600SemiBold',
  },
});

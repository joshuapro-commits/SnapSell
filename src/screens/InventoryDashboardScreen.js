import React, { useContext, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ListingsContext } from '../contexts/ListingsContext';
import { AuthContext } from '../contexts/AuthContext';
import { COLORS } from '../constants/theme';
import { calculateRelistStatus, getListingsNeedingRelist } from '../utils/relistHelper';

const InventoryDashboardScreen = ({ navigation }) => {
  const { listings } = useContext(ListingsContext);
  const { user } = useContext(AuthContext);

  const userListings = useMemo(
    () => listings.filter((l) => l.userId === user?.id),
    [listings, user]
  );

  const stats = useMemo(() => {
    const active = userListings.filter((l) => l.status === 'active');
    const sold = userListings.filter((l) => l.status === 'sold');
    const needsRelist = getListingsNeedingRelist(active);
    const fresh = active.filter((l) => calculateRelistStatus(l.createdAt) === 'fresh');
    
    const totalValue = active.reduce((sum, l) => sum + (parseFloat(l.price) || 0), 0);
    const soldValue = sold.reduce((sum, l) => sum + (parseFloat(l.price) || 0), 0);
    
    const categoryBreakdown = active.reduce((acc, l) => {
      acc[l.category] = (acc[l.category] || 0) + 1;
      return acc;
    }, {});

    return {
      total: userListings.length,
      active: active.length,
      sold: sold.length,
      needsRelist: needsRelist.length,
      fresh: fresh.length,
      totalValue,
      soldValue,
      categoryBreakdown,
    };
  }, [userListings]);

  const StatCard = ({ icon, label, value, color, onPress }) => (
    <TouchableOpacity
      style={[styles.statCard, { borderLeftColor: color }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.statIcon}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </TouchableOpacity>
  );

  const CategoryRow = ({ category, count }) => (
    <View style={styles.categoryRow}>
      <Text style={styles.categoryName}>{category}</Text>
      <Text style={styles.categoryCount}>{count} items</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Inventory Dashboard</Text>
        <Text style={styles.subtitle}>Track your selling activity</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsGrid}>
          <StatCard
            icon="cube-outline"
            label="Total Listings"
            value={stats.total}
            color={COLORS.primary}
          />
          <StatCard
            icon="checkmark-circle-outline"
            label="Active"
            value={stats.active}
            color="#10B981"
          />
          <StatCard
            icon="cash-outline"
            label="Sold"
            value={stats.sold}
            color="#8B5CF6"
          />
          <StatCard
            icon="refresh-outline"
            label="Needs Relist"
            value={stats.needsRelist}
            color="#F59E0B"
            onPress={() => navigation.navigate('My Listings')}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Inventory Health</Text>
        <View style={styles.healthCard}>
          <View style={styles.healthRow}>
            <View style={styles.healthIndicator}>
              <View style={[styles.healthDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.healthLabel}>Fresh Listings</Text>
            </View>
            <Text style={styles.healthValue}>{stats.fresh}</Text>
          </View>
          <View style={styles.healthRow}>
            <View style={styles.healthIndicator}>
              <View style={[styles.healthDot, { backgroundColor: '#F59E0B' }]} />
              <Text style={styles.healthLabel}>Needs Attention</Text>
            </View>
            <Text style={styles.healthValue}>{stats.needsRelist}</Text>
          </View>
          <View style={styles.healthDivider} />
          <View style={styles.healthRow}>
            <Text style={styles.healthLabel}>Health Score</Text>
            <Text style={[styles.healthScore, { color: stats.needsRelist === 0 ? '#10B981' : '#F59E0B' }]}>
              {stats.active > 0 ? Math.round((stats.fresh / stats.active) * 100) : 0}%
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Value Tracking</Text>
        <View style={styles.valueCard}>
          <View style={styles.valueRow}>
            <Text style={styles.valueLabel}>Active Inventory Value</Text>
            <Text style={styles.valueAmount}>₱{stats.totalValue.toLocaleString()}</Text>
          </View>
          <View style={styles.valueRow}>
            <Text style={styles.valueLabel}>Total Earnings</Text>
            <Text style={[styles.valueAmount, { color: '#10B981' }]}>
              ₱{stats.soldValue.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Category Breakdown</Text>
        <View style={styles.categoryCard}>
          {Object.entries(stats.categoryBreakdown).length > 0 ? (
            Object.entries(stats.categoryBreakdown)
              .sort((a, b) => b[1] - a[1])
              .map(([category, count]) => (
                <CategoryRow key={category} category={category} count={count} />
              ))
          ) : (
            <Text style={styles.emptyText}>No active listings</Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Sell')}
        >
          <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
          <Text style={styles.actionText}>Create New Listing</Text>
        </TouchableOpacity>
        {stats.needsRelist > 0 && (
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: '#F59E0B' }]}
            onPress={() => navigation.navigate('My Listings')}
          >
            <Ionicons name="refresh-outline" size={24} color="#F59E0B" />
            <Text style={[styles.actionText, { color: '#F59E0B' }]}>
              Relist {stats.needsRelist} Items
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

export default InventoryDashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Montserrat-Bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: COLORS.textSecondary,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat-SemiBold',
    color: COLORS.text,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  statCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    margin: '1%',
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statIcon: {
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Montserrat-Bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Montserrat-Regular',
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  healthCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  healthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  healthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  healthLabel: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: COLORS.text,
  },
  healthValue: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: COLORS.text,
  },
  healthDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  healthScore: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
  },
  valueCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  valueLabel: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: COLORS.textSecondary,
  },
  valueAmount: {
    fontSize: 20,
    fontFamily: 'Montserrat-Bold',
    color: COLORS.text,
  },
  categoryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryName: {
    fontSize: 14,
    fontFamily: 'Montserrat-Medium',
    color: COLORS.text,
    textTransform: 'capitalize',
  },
  categoryCount: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: COLORS.textSecondary,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Montserrat-Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  actionText: {
    fontSize: 16,
    fontFamily: 'Montserrat-SemiBold',
    color: COLORS.primary,
    marginLeft: 12,
  },
});

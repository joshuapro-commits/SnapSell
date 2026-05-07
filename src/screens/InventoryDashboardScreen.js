import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useListings } from '../contexts/ListingsContext';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants/theme';
import { calculateRelistStatus, getListingsNeedingRelist } from '../utils/relistHelper';

const { width } = Dimensions.get('window');

const InventoryDashboardScreen = ({ navigation }) => {
  const { myListings } = useListings();
  const { user } = useAuth();
  const [timePeriod, setTimePeriod] = useState('week'); // day, week, month, year

  const userListings = myListings;

  const stats = useMemo(() => {
    const active = userListings.filter((l) => l.status === 'active');
    const sold = userListings.filter((l) => l.status === 'sold');
    const needsRelist = getListingsNeedingRelist(active);
    const fresh = active.filter((l) => calculateRelistStatus(l.createdAt) === 'fresh');
    
    const totalValue = active.reduce((sum, l) => sum + (parseFloat(l.price) || 0), 0);
    const soldValue = sold.reduce((sum, l) => sum + (parseFloat(l.price) || 0), 0);
    
    // Category breakdown with earnings
    const categoryBreakdown = userListings.reduce((acc, l) => {
      if (!acc[l.category]) {
        acc[l.category] = { count: 0, earnings: 0 };
      }
      acc[l.category].count += 1;
      if (l.status === 'sold') {
        acc[l.category].earnings += parseFloat(l.price) || 0;
      }
      return acc;
    }, {});

    // Weekly earnings data (mock for now - last 7 days)
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayName = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][date.getDay()];
      // Mock earnings - in production, filter sold items by date
      const earnings = Math.random() * 15000;
      return { day: dayName, earnings };
    });

    return {
      total: userListings.length,
      active: active.length,
      sold: sold.length,
      needsRelist: needsRelist.length,
      fresh: fresh.length,
      totalValue,
      soldValue,
      categoryBreakdown,
      weeklyData,
    };
  }, [userListings]);

  const getCategoryIcon = (category) => {
    const icons = {
      electronics: 'phone-portrait-outline',
      clothing: 'shirt-outline',
      furniture: 'bed-outline',
      books: 'book-outline',
      sporting: 'basketball-outline',
      other: 'cube-outline',
    };
    return icons[category] || 'cube-outline';
  };

  const getCategoryGradient = (index) => {
    const gradients = [
      ['#FF6B9D', '#C44569'],
      ['#A8E6CF', '#56AB91'],
      ['#FFD93D', '#F6C90E'],
      ['#A8DADC', '#457B9D'],
      ['#B8B8FF', '#8B8BFF'],
      ['#FFB4B4', '#FF8787'],
    ];
    return gradients[index % gradients.length];
  };

  const maxEarnings = Math.max(...stats.weeklyData.map(d => d.earnings), 1);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>Statistics</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Time Period Selector */}
        <View style={styles.timePeriodContainer}>
          <View style={styles.timePeriodSelector}>
            {['day', 'week', 'month', 'year'].map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  timePeriod === period && styles.periodButtonActive,
                ]}
                onPress={() => setTimePeriod(period)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.periodText,
                    timePeriod === period && styles.periodTextActive,
                  ]}
                >
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Earnings Chart */}
        <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
            <Text style={styles.totalEarnings}>₱{stats.soldValue.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
            <TouchableOpacity style={styles.pdfButton}>
              <Ionicons name="download-outline" size={18} color="#666" />
              <Text style={styles.pdfText}>PDF</Text>
            </TouchableOpacity>
          </View>

          {/* Bar Chart */}
          <View style={styles.chart}>
            <View style={styles.chartYAxis}>
              <Text style={styles.yAxisLabel}>₱20k</Text>
              <Text style={styles.yAxisLabel}>₱15k</Text>
              <Text style={styles.yAxisLabel}>₱5k</Text>
              <Text style={styles.yAxisLabel}>₱2k</Text>
              <Text style={styles.yAxisLabel}>₱0</Text>
            </View>
            <View style={styles.chartBars}>
              {stats.weeklyData.map((data, index) => {
                const barHeight = (data.earnings / maxEarnings) * 120;
                const gradient = getCategoryGradient(index);
                return (
                  <View key={index} style={styles.barContainer}>
                    <LinearGradient
                      colors={gradient}
                      style={[styles.bar, { height: Math.max(barHeight, 10) }]}
                    />
                    <Text style={styles.barLabel}>{data.day}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Key Metrics - 2x2 Grid */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <View style={styles.metricIconContainer}>
              <Ionicons name="eye-outline" size={24} color="#6B7280" />
            </View>
            <Text style={styles.metricValue}>{stats.total * 47}</Text>
            <Text style={styles.metricLabel}>Views</Text>
          </View>
          <View style={styles.metricCard}>
            <View style={styles.metricIconContainer}>
              <Ionicons name="checkmark-circle-outline" size={24} color="#6B7280" />
            </View>
            <Text style={styles.metricValue}>{stats.sold}</Text>
            <Text style={styles.metricLabel}>Items Sold</Text>
          </View>
          <View style={styles.metricCard}>
            <View style={styles.metricIconContainer}>
              <Ionicons name="cube-outline" size={24} color="#6B7280" />
            </View>
            <Text style={styles.metricValue}>{stats.active}</Text>
            <Text style={styles.metricLabel}>Active Listings</Text>
          </View>
          <View style={styles.metricCard}>
            <View style={styles.metricIconContainer}>
              <Ionicons name="wallet-outline" size={24} color="#6B7280" />
            </View>
            <Text style={styles.metricValue}>₱{(stats.totalValue / 1000).toFixed(1)}k</Text>
            <Text style={styles.metricLabel}>Inventory Value</Text>
          </View>
        </View>

        {/* Category Cards */}
        <View style={styles.categoriesGrid}>
          {Object.entries(stats.categoryBreakdown).length > 0 ? (
            Object.entries(stats.categoryBreakdown)
              .sort((a, b) => b[1].earnings - a[1].earnings)
              .slice(0, 4)
              .map(([category, data], index) => (
                <TouchableOpacity key={category} style={styles.categoryCard}>
                  <View style={styles.categoryIconContainer}>
                    <Ionicons name={getCategoryIcon(category)} size={24} color="#000" />
                  </View>
                  <Text style={styles.categoryName}>{category.charAt(0).toUpperCase() + category.slice(1)}</Text>
                  <Text style={styles.categoryEarnings}>₱{data.earnings.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                </TouchableOpacity>
              ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No sales data yet</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default InventoryDashboardScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EAED',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Montserrat_700Bold',
    color: '#000',
  },
  placeholder: {
    width: 40,
  },
  timePeriodContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  timePeriodSelector: {
    flexDirection: 'row',
    backgroundColor: '#D1D5DB',
    borderRadius: 25,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 22,
  },
  periodButtonActive: {
    backgroundColor: '#000',
  },
  periodText: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#6B7280',
  },
  periodTextActive: {
    color: '#FFF',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  metricCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FFF',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  metricIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 24,
    fontFamily: 'Montserrat_700Bold',
    color: '#000',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalEarnings: {
    fontSize: 36,
    fontFamily: 'Montserrat_700Bold',
    color: '#000',
  },
  pdfButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  pdfText: {
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
    color: '#666',
  },
  chart: {
    flexDirection: 'row',
    height: 180,
  },
  chartYAxis: {
    justifyContent: 'space-between',
    paddingRight: 8,
    paddingVertical: 10,
  },
  yAxisLabel: {
    fontSize: 12,
    fontFamily: 'Montserrat_400Regular',
    color: '#9CA3AF',
  },
  chartBars: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 28,
    borderRadius: 8,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 12,
    fontFamily: 'Montserrat_500Medium',
    color: '#6B7280',
    marginTop: 4,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  categoryCard: {
    width: (width - 52) / 2,
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
    color: '#6B7280',
    marginBottom: 4,
  },
  categoryEarnings: {
    fontSize: 24,
    fontFamily: 'Montserrat_700Bold',
    color: '#000',
  },
  emptyState: {
    width: '100%',
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Montserrat_500Medium',
    color: '#9CA3AF',
  },
});

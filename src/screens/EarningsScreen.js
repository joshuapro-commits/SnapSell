import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useListings } from '../contexts/ListingsContext';

const { width } = Dimensions.get('window');

export const EarningsScreen = ({ navigation }) => {
  const { myListings } = useListings();
  const [selectedYear, setSelectedYear] = useState('2025');

  const soldListings = myListings.filter(l => l.status === 'sold');
  const totalEarnings = soldListings.reduce((sum, l) => sum + (l.price || 0), 0);
  const activeListings = myListings.filter(l => l.status === 'active' || !l.status).length;

  // Mock data for chart (last 7 days)
  const chartData = [
    { day: 'Mon', earnings: 850, sales: 2 },
    { day: 'Tue', earnings: 1200, sales: 3 },
    { day: 'Wed', earnings: 950, sales: 2 },
    { day: 'Thu', earnings: 1500, sales: 4 },
    { day: 'Fri', earnings: 1100, sales: 3 },
    { day: 'Sat', earnings: 800, sales: 2 },
    { day: 'Sun', earnings: 1300, sales: 3 },
  ];

  const maxEarnings = Math.max(...chartData.map(d => d.earnings));
  const maxSales = Math.max(...chartData.map(d => d.sales));

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#1A1D1F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Earnings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>
              <Text style={styles.titleBold}>Statistics</Text>
            </Text>
            <TouchableOpacity style={styles.yearSelector}>
              <Text style={styles.yearText}>{selectedYear}</Text>
              <Ionicons name="chevron-down" size={20} color="#1A1D1F" />
            </TouchableOpacity>
          </View>

          <View style={styles.chartCard}>
            <View style={styles.chartContainer}>
              {chartData.map((item, index) => {
                const barHeight = (item.earnings / maxEarnings) * 100;
                const salesHeight = (item.sales / maxSales) * 50;
                
                return (
                  <View key={index} style={styles.barGroup}>
                    <View style={styles.barContainer}>
                      <View style={[styles.barSales, { height: Math.max(barHeight, 30) }]}>
                        {index === 3 && (
                          <View style={styles.percentBadge}>
                            <Text style={styles.percentText}>87%</Text>
                          </View>
                        )}
                      </View>
                      <View style={[styles.barEarnings, { height: Math.max(salesHeight, 25) }]}>
                        {index === 3 && (
                          <View style={styles.percentBadge}>
                            <Text style={styles.percentText}>37%</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <Text style={styles.dayLabel}>{item.day}</Text>
                  </View>
                );
              })}
            </View>

            <View style={styles.legend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#B8A5D8' }]} />
                <Text style={styles.legendText}>Sales</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#E8C4D8' }]} />
                <Text style={styles.legendText}>Earnings</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: '#E7F3FF' }]}>
              <Ionicons name="cash-outline" size={32} color="#1877F2" />
              <Text style={styles.statValue}>₱{totalEarnings.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Earnings</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: '#FFF0ED' }]}>
              <Ionicons name="checkmark-circle-outline" size={32} color="#EE4D2D" />
              <Text style={styles.statValue}>{soldListings.length}</Text>
              <Text style={styles.statLabel}>Items Sold</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: '#E8F9F4' }]}>
              <Ionicons name="list-outline" size={32} color="#10B981" />
              <Text style={styles.statValue}>{activeListings}</Text>
              <Text style={styles.statLabel}>Active Listings</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: '#FFF9E6' }]}>
              <Ionicons name="trending-up-outline" size={32} color="#FFB800" />
              <Text style={styles.statValue}>
                ₱{soldListings.length > 0 ? Math.round(totalEarnings / soldListings.length).toLocaleString() : 0}
              </Text>
              <Text style={styles.statLabel}>Avg. Sale Price</Text>
            </View>
          </View>

          <View style={styles.recommendedSection}>
            <Text style={styles.sectionTitle}>Recommended for you</Text>
            
            <View style={styles.recommendedGrid}>
              <TouchableOpacity style={[styles.recommendedCard, { backgroundColor: '#FFE8E8' }]}>
                <View style={styles.recommendedIcon}>
                  <Ionicons name="people-outline" size={28} color="#D32F2F" />
                </View>
                <Text style={styles.recommendedLabel}>Community</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.recommendedCard, { backgroundColor: '#E7F3FF' }]}>
                <View style={styles.recommendedIcon}>
                  <Ionicons name="school-outline" size={28} color="#1877F2" />
                </View>
                <Text style={styles.recommendedLabel}>Academy</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#1A1D1F',
  },
  placeholder: {
    width: 40,
  },
  content: {
    padding: 20,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
  },
  titleBold: {
    fontFamily: 'Montserrat_700Bold',
    color: '#1A1D1F',
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFF',
    borderRadius: 20,
  },
  yearText: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#1A1D1F',
  },
  chartCard: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
    marginBottom: 20,
  },
  barGroup: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    justifyContent: 'flex-end',
  },
  barContainer: {
    width: '80%',
    alignItems: 'center',
    gap: 4,
    maxHeight: 180,
  },
  barSales: {
    width: '100%',
    backgroundColor: '#E8C4D8',
    borderRadius: 12,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barEarnings: {
    width: '100%',
    backgroundColor: '#B8A5D8',
    borderRadius: 12,
    minHeight: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentBadge: {
    backgroundColor: '#1A1D1F',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  percentText: {
    fontSize: 12,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#FFF',
  },
  dayLabel: {
    fontSize: 11,
    fontFamily: 'Montserrat_500Medium',
    color: '#6F7787',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    fontFamily: 'Montserrat_500Medium',
    color: '#1A1D1F',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: (width - 52) / 2,
    padding: 20,
    borderRadius: 20,
    gap: 8,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Montserrat_700Bold',
    color: '#1A1D1F',
  },
  statLabel: {
    fontSize: 13,
    fontFamily: 'Montserrat_500Medium',
    color: '#6F7787',
  },
  recommendedSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Montserrat_700Bold',
    color: '#1A1D1F',
    marginBottom: 16,
  },
  recommendedGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  recommendedCard: {
    flex: 1,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    gap: 12,
  },
  recommendedIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendedLabel: {
    fontSize: 16,
    fontFamily: 'Montserrat_600SemiBold',
    color: '#1A1D1F',
  },
});

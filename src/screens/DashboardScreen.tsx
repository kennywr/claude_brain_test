import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { useFocusEffect } from '@react-navigation/native';
import { loadResults, TestResults } from '../utils/storage';
import { scoreForChart, formatDate, TEST_DEFINITIONS } from '../utils/testUtils';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const [results, setResults] = useState<TestResults>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTestResults();
  }, []);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadTestResults();
    }, [])
  );

  const loadTestResults = async () => {
    try {
      const loadedResults = await loadResults();
      setResults(loadedResults);
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLatestScore = (testId: string) => {
    const testResults = results[testId];
    if (!testResults || testResults.length === 0) return null;
    const latest = testResults[testResults.length - 1];
    return scoreForChart(testId, latest);
  };

  const getTestCount = (testId: string) => {
    const testResults = results[testId];
    return testResults ? testResults.length : 0;
  };

  const getChartData = (testId: string) => {
    const testResults = results[testId];
    if (!testResults || testResults.length === 0) return null;
    
    // Take last 10 results for the chart
    const recentResults = testResults.slice(-10);
    const data = recentResults.map(result => scoreForChart(testId, result));
    
    // Generate labels based on number of tests and time span
    const labels = generateLabels(recentResults);
    
    return {
      labels: labels,
      datasets: [{
        data: data,
        strokeWidth: 2,
        color: (opacity = 1) => {
          const test = TEST_DEFINITIONS.find(t => t.id === testId);
          return test?.color || '#3B82F6';
        }
      }]
    };
  };

  const generateLabels = (results: any[]) => {
    if (results.length === 0) return [];
    
    const now = new Date();
    const firstDate = new Date(results[0].when);
    const daysDiff = Math.floor((now.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return results.map((result, index) => {
      const date = new Date(result.when);
      
      // If tests span less than 7 days, show date (M/D)
      if (daysDiff <= 7 || results.length <= 5) {
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }
      // If tests span less than 30 days, show week info
      else if (daysDiff <= 30) {
        const weekNum = Math.floor(daysDiff / 7) + 1;
        return index % 2 === 0 ? `W${weekNum}` : '';
      }
      // For longer spans, show month/day less frequently
      else {
        return index % 3 === 0 ? `${date.getMonth() + 1}/${date.getDate()}` : '';
      }
    });
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: {
      borderRadius: 12,
    },
    propsForDots: {
      r: '3',
      strokeWidth: '1',
      stroke: '#3B82F6'
    },
    propsForLabels: {
      fontSize: 10,
    },
    formatXLabel: (value: any) => {
      // Keep the label as is, since we're already formatting it
      return value;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Mental Clarity Dashboard</Text>
          <Text style={styles.subtitle}>Track your cognitive performance</Text>
        </View>

        {/* Summary Stats */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>
              {TEST_DEFINITIONS.reduce((total, test) => total + getTestCount(test.id), 0)}
            </Text>
            <Text style={styles.summaryLabel}>Total Tests</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>
              {TEST_DEFINITIONS.filter(test => getTestCount(test.id) > 0).length}
            </Text>
            <Text style={styles.summaryLabel}>Tests Taken</Text>
          </View>
        </View>

        {/* Test Overview Cards */}
        <View style={styles.testsContainer}>
          {TEST_DEFINITIONS.map((test) => {
            const testCount = getTestCount(test.id);
            const latestScore = getLatestScore(test.id);
            const chartData = getChartData(test.id);
            
            return (
              <View key={test.id} style={[styles.testCard, { borderLeftColor: test.color }]}>
                <View style={styles.testHeader}>
                  <View>
                    <Text style={styles.testName}>{test.name}</Text>
                    <Text style={styles.testDescription}>{test.description}</Text>
                  </View>
                  <View style={[styles.testIndicator, { backgroundColor: test.color }]} />
                </View>

                {/* Chart or No Data */}
                <View style={styles.chartContainer}>
                  {chartData ? (
                    <View>
                      <LineChart
                        data={chartData}
                        width={screenWidth - 80}
                        height={120}
                        chartConfig={{
                          ...chartConfig,
                          color: (opacity = 1) => `${test.color}${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`,
                        }}
                        bezier
                        style={styles.chart}
                        withDots={true}
                        withInnerLines={false}
                        withOuterLines={false}
                        withVerticalLines={false}
                        withHorizontalLines={false}
                        fromZero={false}
                        withVerticalLabels={true}
                        withHorizontalLabels={true}
                      />
                    </View>
                  ) : (
                    <View style={styles.noDataContainer}>
                      <Text style={styles.noDataText}>No data yet</Text>
                      <Text style={styles.noDataSubtext}>Take this test to see your progress</Text>
                    </View>
                  )}
                </View>

                {/* Test Stats */}
                <View style={styles.testStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{testCount}</Text>
                    <Text style={styles.statLabel}>Tests</Text>
                  </View>
                  {latestScore !== null && (
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>{latestScore}</Text>
                      <Text style={styles.statLabel}>Latest</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsCard}>
          <Text style={styles.actionsTitle}>Quick Actions</Text>
          <Text style={styles.actionsDescription}>
            Take tests regularly to track your cognitive performance over time.
          </Text>
          <View style={styles.actionsList}>
            <Text style={styles.actionItem}>📊 Check your progress in the History tab</Text>
            <Text style={styles.actionItem}>🧠 Take tests 2-3 times per week</Text>
            <Text style={styles.actionItem}>⏰ Test at consistent times for better tracking</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 30,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  summaryNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  testsContainer: {
    gap: 20,
    marginBottom: 30,
  },
  testCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  testName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  testDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  testIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  chartContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  chart: {
    borderRadius: 8,
  },
  noDataContainer: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  noDataText: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 4,
  },
  noDataSubtext: {
    fontSize: 12,
    color: '#d1d5db',
  },
  testStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionsCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  actionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  actionsDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  actionsList: {
    gap: 8,
  },
  actionItem: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});
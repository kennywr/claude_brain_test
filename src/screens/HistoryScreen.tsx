import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { loadResults, TestResults, clearAllResults } from '../utils/storage';
import { formatDate, TEST_DEFINITIONS } from '../utils/testUtils';

interface TestEntry {
  testId: string;
  testName: string;
  date: string;
  result: any;
  color: string;
}

export default function HistoryScreen() {
  const [results, setResults] = useState<TestResults>({});
  const [allEntries, setAllEntries] = useState<TestEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Refresh data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadTestHistory();
    }, [])
  );

  const loadTestHistory = async () => {
    try {
      const loadedResults = await loadResults();
      setResults(loadedResults);
      
      // Convert results to flat array of entries
      const entries: TestEntry[] = [];
      
      Object.keys(loadedResults).forEach(testId => {
        const testDefinition = TEST_DEFINITIONS.find(def => def.id === testId);
        if (testDefinition && loadedResults[testId]) {
          loadedResults[testId].forEach(result => {
            entries.push({
              testId,
              testName: testDefinition.name,
              date: result.when,
              result,
              color: testDefinition.color
            });
          });
        }
      });
      
      // Sort by date (most recent first)
      entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAllEntries(entries);
    } catch (error) {
      console.error('Error loading test history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTestResult = (testId: string, result: any) => {
    switch (testId) {
      case 'rt':
        return `${result.meanMs}ms (±${result.sdMs}ms)`;
      case 'nback':
        return `${Math.round(result.accuracy * 100)}% accuracy`;
      case 'digit':
        return `Span: ${result.maxSpan}`;
      case 'stroop':
        return `Score: ${result.score} (${Math.round(result.accuracy * 100)}% accuracy)`;
      default:
        return 'Unknown result';
    }
  };

  const getTotalTests = () => {
    return Object.values(results).reduce((total, testResults) => total + testResults.length, 0);
  };

  const handleClearAll = async () => {
    try {
      await clearAllResults();
      setResults({});
      setAllEntries([]);
    } catch (error) {
      console.error('Error clearing results:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Test History</Text>
          <Text style={styles.subtitle}>Complete record of all your tests</Text>
        </View>

        {/* Summary Stats */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{getTotalTests()}</Text>
            <Text style={styles.summaryLabel}>Total Tests</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>
              {Object.keys(results).filter(testId => results[testId].length > 0).length}
            </Text>
            <Text style={styles.summaryLabel}>Different Tests</Text>
          </View>
          {allEntries.length > 0 && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>
                {Math.floor((new Date().getTime() - new Date(allEntries[allEntries.length - 1].date).getTime()) / (1000 * 60 * 60 * 24))}
              </Text>
              <Text style={styles.summaryLabel}>Days Testing</Text>
            </View>
          )}
        </View>

        {/* Clear All Button */}
        {allEntries.length > 0 && (
          <View style={styles.clearContainer}>
            <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
              <Text style={styles.clearButtonText}>Clear All History</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Test Entries */}
        {allEntries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No test history yet</Text>
            <Text style={styles.emptySubtext}>
              Take some cognitive tests to see your history here
            </Text>
          </View>
        ) : (
          <View style={styles.entriesContainer}>
            <Text style={styles.entriesTitle}>All Test Results</Text>
            {allEntries.map((entry, index) => (
              <View key={`${entry.testId}-${entry.date}-${index}`} style={[styles.entryCard, { borderLeftColor: entry.color }]}>
                <View style={styles.entryHeader}>
                  <View style={styles.entryTitleContainer}>
                    <Text style={styles.entryTestName}>{entry.testName}</Text>
                    <View style={[styles.entryIndicator, { backgroundColor: entry.color }]} />
                  </View>
                  <Text style={styles.entryDate}>{formatDate(entry.date)}</Text>
                </View>
                <Text style={styles.entryResult}>
                  {formatTestResult(entry.testId, entry.result)}
                </Text>
              </View>
            ))}
          </View>
        )}
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
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  clearContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  clearButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    backgroundColor: '#ffffff',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#d1d5db',
    textAlign: 'center',
    lineHeight: 20,
  },
  entriesContainer: {
    marginTop: 10,
  },
  entriesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  entryCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  entryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  entryTestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  entryIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  entryDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  entryResult: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'monospace',
  },
});
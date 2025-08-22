import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ReactionTimeTest from '../components/tests/ReactionTimeTest';
import NBackTest from '../components/tests/NBackTest';
import DigitSpanTest from '../components/tests/DigitSpanTest';
import { addResult } from '../utils/storage';
import { TEST_DEFINITIONS } from '../utils/testUtils';

type ActiveTest = null | 'rt' | 'nback' | 'digit' | 'stroop';

export default function TestsScreen() {
  const [activeTest, setActiveTest] = useState<ActiveTest>(null);

  const handleTestComplete = async (testId: string, result: any) => {
    try {
      await addResult(testId, result);
      // Automatically return to test selection
      setActiveTest(null);
      // Show brief success message
      Alert.alert('Success!', 'Test result saved successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to save test result. Please try again.');
    }
  };

  const handleTestCancel = () => {
    setActiveTest(null);
  };

  if (activeTest === 'rt') {
    return (
      <ReactionTimeTest
        onComplete={(result) => handleTestComplete('rt', result)}
        onCancel={handleTestCancel}
      />
    );
  }

  if (activeTest === 'nback') {
    return (
      <NBackTest
        onComplete={(result) => handleTestComplete('nback', result)}
        onCancel={handleTestCancel}
      />
    );
  }

  if (activeTest === 'digit') {
    return (
      <DigitSpanTest
        onComplete={(result) => handleTestComplete('digit', result)}
        onCancel={handleTestCancel}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Cognitive Tests</Text>
          <Text style={styles.subtitle}>Run mental clarity assessments</Text>
        </View>
        
        <View style={styles.testsContainer}>
          {TEST_DEFINITIONS.map((test) => (
            <TouchableOpacity
              key={test.id}
              style={[styles.testCard, { borderLeftColor: test.color }]}
              onPress={() => {
                if (test.id === 'rt') {
                  setActiveTest('rt');
                } else if (test.id === 'nback') {
                  setActiveTest('nback');
                } else if (test.id === 'digit') {
                  setActiveTest('digit');
                } else {
                  Alert.alert('Coming Soon', `${test.name} test is being developed.`);
                }
              }}
            >
              <View style={styles.testHeader}>
                <Text style={styles.testName}>{test.name}</Text>
                <View style={[styles.testIndicator, { backgroundColor: test.color }]} />
              </View>
              <Text style={styles.testDescription}>{test.description}</Text>
              <Text style={styles.testStatus}>
                {test.id === 'rt' || test.id === 'nback' || test.id === 'digit' ? 'Available' : 'Coming Soon'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Testing Tips</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>• Test at a consistent time each day</Text>
            <Text style={styles.tipItem}>• Find a quiet environment</Text>
            <Text style={styles.tipItem}>• Use the same device when possible</Text>
            <Text style={styles.tipItem}>• Aim for 2-3 sessions per week</Text>
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
  testsContainer: {
    marginBottom: 30,
  },
  testCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  testName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  testIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  testDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    lineHeight: 20,
  },
  testStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
  },
  tipsCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  tipsList: {
    gap: 6,
  },
  tipItem: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});
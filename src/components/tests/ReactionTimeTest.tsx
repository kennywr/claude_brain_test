import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { mean, stdev, ms } from '../../utils/testUtils';

interface ReactionTimeTestProps {
  onComplete: (result: any) => void;
  onCancel: () => void;
}

type Phase = 'idle' | 'wait' | 'go' | 'result';

export default function ReactionTimeTest({ onComplete, onCancel }: ReactionTimeTestProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [latencies, setLatencies] = useState<number[]>([]);
  const [trial, setTrial] = useState(0);
  const [antiCheat, setAntiCheat] = useState(true);
  const startRef = useRef(0);
  const timeoutRef = useRef<number>();

  useEffect(() => {
    if (phase === 'wait') {
      const delay = 800 + Math.random() * 2000;
      timeoutRef.current = setTimeout(() => {
        startRef.current = Date.now();
        setPhase('go');
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [phase]);

  const startTrial = () => {
    setPhase('wait');
  };

  const startTest = () => {
    setLatencies([]);
    setTrial(0);
    startTrial();
  };

  const handlePress = () => {
    if (phase === 'wait') {
      if (antiCheat) {
        Alert.alert('Too Early!', 'Wait for the green screen before tapping.');
        setLatencies(prev => [...prev, 1000]); // Penalty time
        nextTrial();
      }
      return;
    }

    if (phase === 'go') {
      const reactionTime = Date.now() - startRef.current;
      setLatencies(prev => [...prev, reactionTime]);
      nextTrial();
    }
  };

  const nextTrial = () => {
    if (trial + 1 >= 7) {
      setPhase('result');
      return;
    }
    setTrial(prev => prev + 1);
    setPhase('wait');
  };

  const restart = () => {
    setPhase('idle');
    setLatencies([]);
    setTrial(0);
  };

  const saveResult = () => {
    const meanMs = Math.round(mean(latencies));
    const sdMs = Math.round(stdev(latencies));
    const result = { 
      meanMs, 
      sdMs, 
      trials: latencies.length,
      rawTimes: latencies
    };
    onComplete(result);
  };

  if (phase === 'idle') {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Reaction Time Test</Text>
          <Text style={styles.subtitle}>
            Tap as soon as the screen changes from red to green. 7 trials.
          </Text>
          <Text style={styles.description}>
            This measures simple visual reaction time. Try to respond as quickly as possible.
          </Text>
          
          <View style={styles.settingContainer}>
            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={() => setAntiCheat(!antiCheat)}
            >
              <View style={[styles.checkbox, antiCheat && styles.checkboxChecked]}>
                {antiCheat && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>
                Anti-cheat (penalize early taps)
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={startTest}>
              <Text style={styles.primaryButtonText}>Start Test</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={onCancel}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (phase === 'result') {
    const meanMs = Math.round(mean(latencies));
    const sdMs = Math.round(stdev(latencies));

    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Reaction Time - Result</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Mean</Text>
              <Text style={styles.statValue}>{ms(meanMs)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>SD</Text>
              <Text style={styles.statValue}>{ms(sdMs)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Trials</Text>
              <Text style={styles.statValue}>{latencies.length}</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={saveResult}>
              <Text style={styles.primaryButtonText}>Save Result</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={restart}>
              <Text style={styles.secondaryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.trialInfo}>
        <Text style={styles.trialText}>Trial {trial + 1} / 7</Text>
      </View>
      
      <TouchableOpacity
        style={[
          styles.reactionArea,
          phase === 'wait' ? styles.waitArea : styles.goArea
        ]}
        onPress={handlePress}
        activeOpacity={1}
      >
        <Text style={styles.reactionText}>
          {phase === 'wait' ? 'Wait...' : 'TAP NOW!'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
    marginBottom: 24,
  },
  settingContainer: {
    marginBottom: 24,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  trialInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  trialText: {
    fontSize: 16,
    color: '#6b7280',
  },
  reactionArea: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  waitArea: {
    backgroundColor: '#fca5a5',
  },
  goArea: {
    backgroundColor: '#86efac',
  },
  reactionText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 24,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    minWidth: 80,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
});
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

interface NBackTestProps {
  onComplete: (result: any) => void;
  onCancel: () => void;
}

export default function NBackTest({ onComplete, onCancel }: NBackTestProps) {
  const [running, setRunning] = useState(false);
  const [seq, setSeq] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);
  const intervalRef = useRef<number>();
  const timeoutRef = useRef<number>();
  
  const letters = "BCDGHKLMNPRST";

  // Main sequence timer
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setCursor(c => c + 1);
        setSeq(s => [...s, letters[Math.floor(Math.random() * letters.length)]]);
      }, 2000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [running]);

  // Stop test after 20 trials
  useEffect(() => {
    if (cursor >= 18) {
      setRunning(false);
    }
  }, [cursor]);

  // Check if current letter is a target (matches 2 positions back)
  const isTarget = useMemo(() => {
    if (cursor < 2) return false;
    return seq[cursor] === seq[cursor - 2];
  }, [cursor, seq]);

  // Handle user response (MATCH button press)
  const respond = () => {
    if (!running) return;
    if (isTarget) {
      setHits(x => x + 1);
    } else {
      setFalseAlarms(x => x + 1);
    }
  };

  // Auto-advance without response (miss if it was a target)
  const advanceWithoutResponse = () => {
    if (cursor >= 0 && isTarget) {
      setMisses(x => x + 1);
    }
  };

  // Set timeout for each letter presentation
  useEffect(() => {
    if (!running || cursor < 0) return;
    
    timeoutRef.current = setTimeout(advanceWithoutResponse, 1800);
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [cursor, running, isTarget]);

  const start = () => {
    setRunning(true);
    setSeq([]);
    setCursor(-1);
    setHits(0);
    setMisses(0);
    setFalseAlarms(0);
  };

  const restart = () => {
    setRunning(false);
    setSeq([]);
    setCursor(-1);
    setHits(0);
    setMisses(0);
    setFalseAlarms(0);
  };

  // Results phase
  if (!running && cursor >= 18) {
    const totalTargets = seq.filter((_, i) => i >= 2 && seq[i] === seq[i - 2]).length;
    const accuracy = totalTargets ? hits / totalTargets : 0;
    const result = { 
      accuracy: Number(accuracy.toFixed(3)), 
      hits, 
      misses, 
      falseAlarms, 
      totalTargets 
    };

    const saveResult = () => {
      onComplete(result);
    };

    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>2-Back - Result</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Accuracy</Text>
              <Text style={styles.statValue}>{Math.round(accuracy * 100)}%</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Hits</Text>
              <Text style={styles.statValue}>{hits}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Misses</Text>
              <Text style={styles.statValue}>{misses}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>False Alarms</Text>
              <Text style={styles.statValue}>{falseAlarms}</Text>
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

  // Initial state
  if (!running) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>2-Back Memory Test</Text>
          <Text style={styles.subtitle}>
            Tap MATCH when the current letter matches the one 2 trials ago.
          </Text>
          <Text style={styles.description}>
            You'll see a stream of ~20 letters, each shown for 2 seconds. 
            Remember letters and respond when you see a match!
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={start}>
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

  // Running test
  return (
    <View style={styles.container}>
      <View style={styles.testHeader}>
        <Text style={styles.progressText}>Item {cursor + 1} / 20</Text>
      </View>
      
      <View style={styles.letterContainer}>
        <Text style={styles.letter}>{seq[cursor] || ""}</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.matchButton} 
          onPress={respond}
        >
          <Text style={styles.matchButtonText}>MATCH</Text>
        </TouchableOpacity>
      </View>
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
  testHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  progressText: {
    fontSize: 16,
    color: '#6b7280',
  },
  letterContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  letter: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#1f2937',
    letterSpacing: 4,
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 16,
    paddingHorizontal: 32,
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
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  matchButton: {
    backgroundColor: '#8B5CF6',
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: 120,
  },
  matchButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginVertical: 24,
    gap: 12,
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
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { mean } from '../../utils/testUtils';

interface StroopTestProps {
  onComplete: (result: any) => void;
  onCancel: () => void;
}

const COLORS = ['RED', 'GREEN', 'BLUE', 'YELLOW'];
const COLOR_VALUES = {
  RED: '#ef4444',
  GREEN: '#10b981', 
  BLUE: '#3b82f6',
  YELLOW: '#eab308'
};

interface StroopItem {
  word: string;
  ink: string;
  congruent: boolean;
}

interface ReactionData {
  ms: number;
  correct: boolean;
  congruent: boolean;
}

export default function StroopTest({ onComplete, onCancel }: StroopTestProps) {
  const [running, setRunning] = useState(false);
  const [items, setItems] = useState<StroopItem[]>([]);
  const [cursor, setCursor] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<ReactionData[]>([]);
  const startRef = useRef(0);

  // Generate a single Stroop item
  const generateItem = (): StroopItem => {
    const word = COLORS[Math.floor(Math.random() * COLORS.length)];
    const ink = COLORS[Math.floor(Math.random() * COLORS.length)];
    const congruent = word === ink;
    return { word, ink, congruent };
  };

  // Start the test
  const start = () => {
    const testItems = Array.from({ length: 24 }, generateItem);
    setItems(testItems);
    setCursor(0);
    setReactionTimes([]);
    setRunning(true);
    startRef.current = Date.now();
  };

  // Handle color choice
  const pickColor = (choice: string) => {
    if (!running) return;
    
    const now = Date.now();
    const reactionTime = now - startRef.current;
    startRef.current = now;
    
    const currentItem = items[cursor];
    const correct = choice === currentItem.ink;
    
    setReactionTimes(prev => [...prev, {
      ms: reactionTime,
      correct,
      congruent: currentItem.congruent
    }]);

    if (cursor + 1 >= items.length) {
      setRunning(false);
    } else {
      setCursor(c => c + 1);
    }
  };

  // Restart test
  const restart = () => {
    setRunning(false);
    setItems([]);
    setCursor(0);
    setReactionTimes([]);
  };

  // Results calculation and display
  if (!running && reactionTimes.length > 0) {
    const correctResponses = reactionTimes.filter(rt => rt.correct).length;
    const accuracy = correctResponses / reactionTimes.length;
    const meanReactionTime = mean(reactionTimes.map(rt => rt.ms));
    
    // Calculate Stroop interference
    const incongruentTrials = reactionTimes.filter(rt => !rt.congruent);
    const congruentTrials = reactionTimes.filter(rt => rt.congruent);
    const meanIncongruent = incongruentTrials.length ? mean(incongruentTrials.map(rt => rt.ms)) : meanReactionTime;
    const meanCongruent = congruentTrials.length ? mean(congruentTrials.map(rt => rt.ms)) : meanReactionTime;
    const interference = meanIncongruent - meanCongruent;
    
    // Calculate composite score (accuracy - interference penalty)
    const score = Math.max(0, Math.round(accuracy * 100 - interference / 10));
    
    const result = {
      accuracy: Number(accuracy.toFixed(3)),
      meanMs: Math.round(meanReactionTime),
      interferenceMs: Math.round(interference),
      score
    };

    const saveResult = () => {
      onComplete(result);
    };

    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Stroop Test - Result</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Accuracy</Text>
              <Text style={styles.statValue}>{Math.round(accuracy * 100)}%</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Mean RT</Text>
              <Text style={styles.statValue}>{Math.round(meanReactionTime)}ms</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Interference</Text>
              <Text style={styles.statValue}>{Math.round(interference)}ms</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Score</Text>
              <Text style={styles.statValue}>{score}</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={saveResult}>
              <Text style={styles.primaryButtonText}>Save & Continue</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={restart}>
              <Text style={styles.secondaryButtonText}>Try Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tertiaryButton} onPress={onCancel}>
              <Text style={styles.tertiaryButtonText}>Back to Tests</Text>
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
          <Text style={styles.title}>Stroop Test</Text>
          <Text style={styles.subtitle}>
            Tap the INK COLOR, ignoring what the word says.
          </Text>
          <Text style={styles.description}>
            You'll see color words (like "RED") displayed in different ink colors. 
            Your job is to identify the ink color, not read the word. This measures selective attention and cognitive control.
          </Text>

          <View style={styles.exampleContainer}>
            <Text style={styles.exampleTitle}>Example:</Text>
            <Text style={[styles.exampleWord, { color: COLOR_VALUES.BLUE }]}>RED</Text>
            <Text style={styles.exampleExplanation}>
              Word says "RED" but ink is BLUE → Tap BLUE
            </Text>
          </View>

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
  const currentItem = items[cursor];
  if (!currentItem) return null;

  return (
    <View style={styles.container}>
      <View style={styles.testHeader}>
        <Text style={styles.progressText}>Item {cursor + 1} / {items.length}</Text>
      </View>
      
      <View style={styles.wordContainer}>
        <Text 
          style={[
            styles.stroopWord, 
            { color: COLOR_VALUES[currentItem.ink as keyof typeof COLOR_VALUES] }
          ]}
        >
          {currentItem.word}
        </Text>
      </View>
      
      <View style={styles.colorButtonsContainer}>
        <Text style={styles.instructionText}>Tap the ink color:</Text>
        <View style={styles.colorButtons}>
          {COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              style={[styles.colorButton, { backgroundColor: COLOR_VALUES[color as keyof typeof COLOR_VALUES] }]}
              onPress={() => pickColor(color)}
            >
              <Text style={styles.colorButtonText}>{color}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
  exampleContainer: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  exampleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  exampleWord: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  exampleExplanation: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  testHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  progressText: {
    fontSize: 16,
    color: '#6b7280',
  },
  wordContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 150,
  },
  stroopWord: {
    fontSize: 64,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  colorButtonsContainer: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  instructionText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 20,
    textAlign: 'center',
  },
  colorButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    maxWidth: 300,
  },
  colorButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  colorButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#F59E0B',
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
  tertiaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  tertiaryButtonText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
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
    minWidth: 70,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
  },
});
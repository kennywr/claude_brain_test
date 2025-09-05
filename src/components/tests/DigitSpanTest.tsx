import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

interface DigitSpanTestProps {
  onComplete: (result: any) => void;
  onCancel: () => void;
}

type Phase = 'idle' | 'show' | 'recall' | 'result';

export default function DigitSpanTest({ onComplete, onCancel }: DigitSpanTestProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [span, setSpan] = useState(4);
  const [sequence, setSequence] = useState('');
  const [input, setInput] = useState('');
  const [best, setBest] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<TextInput>(null);

  // Generate random digit sequence
  const generate = (n: number): string => {
    return Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('');
  };

  // Start a new trial
  const start = (currentSpan?: number) => {
    const spanToUse = currentSpan || span;
    const seq = generate(spanToUse);
    setSequence(seq);
    setInput('');
    setPhase('show');
    
    // Show sequence for span * 500ms (minimum 1500ms)
    const showTime = Math.max(1500, spanToUse * 500);
    timeoutRef.current = setTimeout(() => {
      setPhase('recall');
      // Auto-focus input after a brief delay
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }, showTime);
  };

  // Submit user input
  const submit = () => {
    const correct = input === sequence;
    if (correct) {
      const nextSpan = span + 1;
      setBest(prev => Math.max(prev, span));
      setSpan(nextSpan);
      start(nextSpan); // Continue with next level, passing the new span
    } else {
      setPhase('result');
    }
  };

  // Restart test
  const restart = () => {
    setSpan(4);
    setBest(0);
    setSequence('');
    setInput('');
    setPhase('idle');
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Handle input change (only allow digits)
  const handleInputChange = (text: string) => {
    const digitsOnly = text.replace(/\D/g, '');
    setInput(digitsOnly);
  };

  // Results phase
  if (phase === 'result') {
    const maxSpan = Math.max(best, span - 1);
    const result = { maxSpan };

    const saveResult = () => {
      onComplete(result);
    };

    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Digit Span - Result</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Maximum Span</Text>
              <Text style={styles.statValue}>{maxSpan}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Last Attempt</Text>
              <Text style={styles.statValue}>{span}</Text>
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
  if (phase === 'idle') {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Digit Span Test</Text>
          <Text style={styles.subtitle}>
            Memorize digits and type them back. Test increases until you make a mistake.
          </Text>
          <Text style={styles.description}>
            You'll start with 4 digits. Each sequence will be shown briefly, then you type what you remember.
            The test continues with longer sequences until you get one wrong.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.primaryButton} onPress={() => start()}>
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

  // Running test (show or recall phase)
  return (
    <View style={styles.container}>
      <View style={styles.testHeader}>
        <Text style={styles.spanText}>Current span: {span}</Text>
      </View>
      
      <View style={styles.sequenceContainer}>
        {phase === 'show' ? (
          <Text style={styles.sequenceDisplay}>{sequence}</Text>
        ) : (
          <View style={styles.inputContainer}>
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              value={input}
              onChangeText={handleInputChange}
              placeholder="Type the digits"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              maxLength={span}
              textAlign="center"
              onSubmitEditing={submit}
              autoFocus
            />
          </View>
        )}
      </View>
      
      {phase === 'recall' && (
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.submitButton, input.length === 0 && styles.submitButtonDisabled]} 
            onPress={submit}
            disabled={input.length === 0}
          >
            <Text style={[styles.submitButtonText, input.length === 0 && styles.submitButtonTextDisabled]}>
              Submit
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {phase === 'show' && (
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>Memorize these digits...</Text>
        </View>
      )}
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
  spanText: {
    fontSize: 16,
    color: '#6b7280',
  },
  sequenceContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 150,
  },
  sequenceDisplay: {
    fontSize: 48,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#1f2937',
    letterSpacing: 8,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
  },
  textInput: {
    fontSize: 24,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    color: '#1f2937',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    textAlign: 'center',
    letterSpacing: 4,
    width: '100%',
  },
  instructionContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  instructionText: {
    fontSize: 16,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  buttonContainer: {
    gap: 12,
    marginTop: 20,
  },
  primaryButton: {
    backgroundColor: '#10B981',
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
  submitButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    alignSelf: 'center',
    minWidth: 120,
  },
  submitButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonTextDisabled: {
    color: '#9ca3af',
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
    minWidth: 120,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
});
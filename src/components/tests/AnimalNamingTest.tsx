import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

interface AnimalNamingTestProps {
  onComplete: (result: any) => void;
  onCancel: () => void;
}

type Phase = 'idle' | 'testing' | 'result';

interface Animal {
  id: string;
  name: string;
  acceptedAnswers: string[];
  imageUri: string;
}

const ANIMALS: Animal[] = [
  {
    id: 'lion',
    name: 'Lion',
    acceptedAnswers: ['lion'],
    imageUri: 'https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=400&h=400&fit=crop&crop=face', // Lion image
  },
  {
    id: 'camel',
    name: 'Camel',
    acceptedAnswers: ['camel', 'dromedary'],
    imageUri: 'https://images.unsplash.com/photo-1551803091-e20673f15770?w=400&h=400&fit=crop&crop=center', // Camel image
  },
  {
    id: 'rhinoceros',
    name: 'Rhinoceros', 
    acceptedAnswers: ['rhinoceros', 'rhino'],
    imageUri: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=400&h=400&fit=crop&crop=center', // Rhino image
  },
];

export default function AnimalNamingTest({ onComplete, onCancel }: AnimalNamingTestProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [scores, setScores] = useState<boolean[]>([]);
  const inputRef = useRef<TextInput>(null);

  // Fuzzy matching for user input
  const normalizeAnswer = (input: string): string => {
    return input.toLowerCase().trim().replace(/[^a-z]/g, '');
  };

  const isCorrectAnswer = (userInput: string, acceptedAnswers: string[]): boolean => {
    const normalized = normalizeAnswer(userInput);
    return acceptedAnswers.some(answer => 
      normalizeAnswer(answer) === normalized ||
      normalizeAnswer(answer).includes(normalized) ||
      normalized.includes(normalizeAnswer(answer))
    );
  };

  // Start the test
  const startTest = () => {
    setPhase('testing');
    setCurrentIndex(0);
    setAnswers([]);
    setCurrentInput('');
    setScores([]);
    // Focus input after a brief delay
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Submit current answer and move to next
  const submitAnswer = () => {
    if (currentInput.trim() === '') return;

    const currentAnimal = ANIMALS[currentIndex];
    const isCorrect = isCorrectAnswer(currentInput, currentAnimal.acceptedAnswers);
    
    const newAnswers = [...answers, currentInput];
    const newScores = [...scores, isCorrect];
    
    setAnswers(newAnswers);
    setScores(newScores);
    setCurrentInput('');

    if (currentIndex + 1 >= ANIMALS.length) {
      // Test complete
      setPhase('result');
    } else {
      // Next animal
      setCurrentIndex(currentIndex + 1);
      // Refocus input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // Restart test
  const restart = () => {
    setPhase('idle');
    setCurrentIndex(0);
    setAnswers([]);
    setCurrentInput('');
    setScores([]);
  };

  // Results phase
  if (phase === 'result') {
    const totalScore = scores.filter(score => score).length;
    const result = { 
      score: totalScore,
      maxScore: 3,
      answers: answers,
      correctAnswers: scores,
      accuracy: totalScore / 3
    };

    const saveResult = () => {
      onComplete(result);
    };

    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Animal Naming - Result</Text>
          
          <View style={styles.resultsContainer}>
            {ANIMALS.map((animal, index) => (
              <View key={animal.id} style={styles.resultItem}>
                <Image source={{ uri: animal.imageUri }} style={styles.resultImage} />
                <View style={styles.resultTextContainer}>
                  <Text style={styles.resultAnimalName}>{animal.name}</Text>
                  <Text style={styles.resultUserAnswer}>Your answer: {answers[index] || 'No answer'}</Text>
                  <Text style={[
                    styles.resultStatus,
                    { color: scores[index] ? '#10b981' : '#ef4444' }
                  ]}>
                    {scores[index] ? '✓ Correct' : '✗ Incorrect'}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Score</Text>
              <Text style={styles.statValue}>{totalScore} / 3</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Accuracy</Text>
              <Text style={styles.statValue}>{Math.round((totalScore / 3) * 100)}%</Text>
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
          <Text style={styles.title}>Animal Naming Test</Text>
          <Text style={styles.subtitle}>
            Look at each animal and type what you see.
          </Text>
          <Text style={styles.description}>
            You'll see 3 different animals. For each one, type the name of the animal you see. 
            This tests visual recognition and semantic memory. Take your time to look carefully at each image.
          </Text>

          <View style={styles.exampleContainer}>
            <Text style={styles.exampleTitle}>Instructions:</Text>
            <Text style={styles.exampleText}>• Look carefully at each animal</Text>
            <Text style={styles.exampleText}>• Type the name of the animal</Text>
            <Text style={styles.exampleText}>• Press Submit to continue</Text>
            <Text style={styles.exampleText}>• 3 animals total</Text>
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

  // Testing phase
  const currentAnimal = ANIMALS[currentIndex];
  
  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.testHeader}>
          <Text style={styles.progressText}>Animal {currentIndex + 1} / {ANIMALS.length}</Text>
        </View>
        
        <View style={styles.imageContainer}>
          <Image source={{ uri: currentAnimal.imageUri }} style={styles.animalImage} />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.questionText}>What animal is this?</Text>
          <TextInput
            ref={inputRef}
            style={styles.textInput}
            value={currentInput}
            onChangeText={setCurrentInput}
            placeholder="Type the animal name"
            placeholderTextColor="#9ca3af"
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={submitAnswer}
            returnKeyType="done"
          />
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[
              styles.submitButton, 
              currentInput.trim() === '' && styles.submitButtonDisabled
            ]} 
            onPress={submitAnswer}
            disabled={currentInput.trim() === ''}
          >
            <Text style={[
              styles.submitButtonText,
              currentInput.trim() === '' && styles.submitButtonTextDisabled
            ]}>
              {currentIndex + 1 === ANIMALS.length ? 'Finish' : 'Submit'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
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
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  exampleText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
    paddingLeft: 8,
  },
  testHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    color: '#6b7280',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 200,
  },
  animalImage: {
    width: 250,
    height: 250,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  inputContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    textAlign: 'center',
  },
  textInput: {
    fontSize: 16,
    color: '#1f2937',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
    maxWidth: 300,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#7c3aed',
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
    backgroundColor: '#7c3aed',
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
  resultsContainer: {
    marginVertical: 20,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  resultImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginRight: 12,
  },
  resultTextContainer: {
    flex: 1,
  },
  resultAnimalName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  resultUserAnswer: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  resultStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    minWidth: 100,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
});
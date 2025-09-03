import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { AnimalData } from '../../data/animalDatabase';
import ImageService from '../../services/imageService';
import AnimalSelectionService, { TestConfiguration } from '../../services/animalSelectionService';
import AnimalTestConfig from '../AnimalTestConfig';

interface EnhancedAnimalNamingTestProps {
  onComplete: (result: any) => void;
  onCancel: () => void;
}

type Phase = 'config' | 'loading' | 'testing' | 'result';

export default function EnhancedAnimalNamingTest({ onComplete, onCancel }: EnhancedAnimalNamingTestProps) {
  const [phase, setPhase] = useState<Phase>('config');
  const [animals, setAnimals] = useState<AnimalData[]>([]);
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string }>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [scores, setScores] = useState<boolean[]>([]);
  const [testConfig, setTestConfig] = useState<TestConfiguration | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isReloadingImage, setIsReloadingImage] = useState(false);
  const inputRef = useRef<TextInput>(null);

  // Fuzzy matching for user input
  const normalizeAnswer = (input: string): string => {
    return input.toLowerCase().trim().replace(/[^a-z]/g, '');
  };

  const isCorrectAnswer = (userInput: string, animal: AnimalData): boolean => {
    const normalized = normalizeAnswer(userInput);
    const acceptedAnswers = [animal.name, ...animal.synonyms];
    
    return acceptedAnswers.some(answer => {
      const normalizedAnswer = normalizeAnswer(answer);
      return normalizedAnswer === normalized ||
             normalizedAnswer.includes(normalized) ||
             normalized.includes(normalizedAnswer);
    });
  };

  // Load images for selected animals
  const loadImages = async (selectedAnimals: AnimalData[]) => {
    setLoadingProgress(0);
    const urls: { [key: string]: string } = {};
    
    for (let i = 0; i < selectedAnimals.length; i++) {
      const animal = selectedAnimals[i];
      try {
        console.log(`Loading image for ${animal.name} (${animal.searchTerm})`);
        const imageUrl = await ImageService.getImageUrl(animal);
        console.log(`Got image URL for ${animal.name}: ${imageUrl}`);
        urls[animal.id] = imageUrl;
      } catch (error) {
        console.warn(`Failed to load image for ${animal.name}:`, error);
        // Use Robohash as fallback - creates unique images per animal name
        const encodedName = encodeURIComponent(animal.name);
        urls[animal.id] = `https://robohash.org/${encodedName}?set=set4&size=400x400`;
      }
      setLoadingProgress((i + 1) / selectedAnimals.length);
    }
    
    console.log('All image URLs loaded:', urls);
    setImageUrls(urls);
  };

  // Reload current image with a fresh fetch
  const reloadCurrentImage = async () => {
    console.log('Reload button clicked!');
    
    if (!animals[currentIndex]) {
      console.log('No current animal found');
      return;
    }
    
    if (isReloadingImage) {
      console.log('Already reloading image, skipping...');
      return;
    }
    
    setIsReloadingImage(true);
    try {
      const currentAnimal = animals[currentIndex];
      const oldImageUrl = imageUrls[currentAnimal.id];
      console.log(`Reloading image for ${currentAnimal.name}, old URL: ${oldImageUrl}`);
      
      // Fetch a new image bypassing cache
      const newImageUrl = await ImageService.getImageUrl(currentAnimal, true);
      console.log(`Got new image URL: ${newImageUrl}`);
      
      if (newImageUrl !== oldImageUrl) {
        // Update the image URLs state
        setImageUrls(prev => {
          const updated = {
            ...prev,
            [currentAnimal.id]: newImageUrl
          };
          console.log('Updated imageUrls state:', updated);
          return updated;
        });
        
        console.log(`Image successfully reloaded for ${currentAnimal.name}`);
      } else {
        console.log('New image URL is the same as old one');
      }
    } catch (error) {
      console.warn('Error reloading image:', error);
    } finally {
      setIsReloadingImage(false);
    }
  };

  // Start test with configuration
  const handleStartTest = async (config: TestConfiguration) => {
    setTestConfig(config);
    setPhase('loading');
    
    try {
      // Select animals based on configuration
      const selectedAnimals = await AnimalSelectionService.selectAnimals(config);
      setAnimals(selectedAnimals);
      
      // Load images
      await loadImages(selectedAnimals);
      
      // Initialize test state
      setCurrentIndex(0);
      setAnswers([]);
      setCurrentInput('');
      setScores([]);
      
      setPhase('testing');
      
      // Focus input after a brief delay
      setTimeout(() => {
        inputRef.current?.focus();
      }, 500);
      
    } catch (error) {
      console.error('Error starting test:', error);
      onCancel();
    }
  };

  // Submit current answer and move to next
  const submitAnswer = () => {
    if (currentInput.trim() === '') return;

    const currentAnimal = animals[currentIndex];
    const isCorrect = isCorrectAnswer(currentInput, currentAnimal);
    
    const newAnswers = [...answers, currentInput];
    const newScores = [...scores, isCorrect];
    
    setAnswers(newAnswers);
    setScores(newScores);
    setCurrentInput('');

    if (currentIndex + 1 >= animals.length) {
      // Test complete
      finishTest(newAnswers, newScores);
    } else {
      // Next animal
      setCurrentIndex(currentIndex + 1);
      // Refocus input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  // Finish test and save progress
  const finishTest = async (finalAnswers: string[], finalScores: boolean[]) => {
    // Update user progress
    const animalIds = animals.map(a => a.id);
    const correctIds = animals.filter((_, i) => finalScores[i]).map(a => a.id);
    await AnimalSelectionService.updateProgress(animalIds, correctIds);
    
    setPhase('result');
  };

  // Calculate difficulty-adjusted score
  const calculateScore = (): number => {
    if (!testConfig || scores.length === 0) return 0;
    
    let totalScore = 0;
    let maxScore = 0;
    
    animals.forEach((animal, index) => {
      const difficultyMultiplier = animal.difficulty; // 1, 2, or 3
      maxScore += difficultyMultiplier;
      
      if (scores[index]) {
        totalScore += difficultyMultiplier;
      }
    });
    
    return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
  };

  // Restart test
  const restart = () => {
    setPhase('config');
    setAnimals([]);
    setImageUrls({});
    setCurrentIndex(0);
    setAnswers([]);
    setCurrentInput('');
    setScores([]);
    setTestConfig(null);
  };

  // Configuration phase
  if (phase === 'config') {
    return (
      <AnimalTestConfig
        onStartTest={handleStartTest}
        onCancel={onCancel}
      />
    );
  }

  // Loading phase
  if (phase === 'loading') {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#7c3aed" />
          <Text style={styles.loadingTitle}>Preparing Your Test</Text>
          <Text style={styles.loadingText}>Loading animal images...</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${loadingProgress * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{Math.round(loadingProgress * 100)}%</Text>
        </View>
      </View>
    );
  }

  // Results phase
  if (phase === 'result') {
    const totalScore = scores.filter(score => score).length;
    const difficultyScore = calculateScore();
    const accuracy = totalScore / animals.length;
    
    const result = { 
      score: difficultyScore,
      rawScore: totalScore,
      maxScore: animals.length,
      answers: answers,
      correctAnswers: scores,
      accuracy: accuracy,
      difficulty: testConfig?.difficulty,
      mode: testConfig?.mode,
      animals: animals.map(a => ({ id: a.id, name: a.name, difficulty: a.difficulty }))
    };

    const saveResult = () => {
      onComplete(result);
    };

    return (
      <View style={styles.container}>
        <ScrollView 
          style={styles.scrollContainer}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.card}>
            <Text style={styles.title}>Animal Naming - Results</Text>
            
            <View style={styles.resultsContainer}>
              {animals.map((animal, index) => (
                <View key={animal.id} style={styles.resultItem}>
                  <Image 
                    source={{ uri: imageUrls[animal.id] }} 
                    style={styles.resultImage} 
                    contentFit="cover"
                  />
                  <View style={styles.resultTextContainer}>
                    <Text style={styles.resultAnimalName}>
                      {animal.name} 
                      <Text style={styles.difficultyBadge}> L{animal.difficulty}</Text>
                    </Text>
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
                <Text style={styles.statLabel}>Difficulty Score</Text>
                <Text style={styles.statValue}>{difficultyScore}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Correct</Text>
                <Text style={styles.statValue}>{totalScore} / {animals.length}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Accuracy</Text>
                <Text style={styles.statValue}>{Math.round(accuracy * 100)}%</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Mode</Text>
                <Text style={styles.statValue}>{testConfig?.mode?.toUpperCase()}</Text>
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.primaryButton} onPress={saveResult}>
                <Text style={styles.primaryButtonText}>Save & Continue</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={restart}>
                <Text style={styles.secondaryButtonText}>New Test</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.tertiaryButton} onPress={onCancel}>
                <Text style={styles.tertiaryButtonText}>Back to Tests</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Testing phase
  const currentAnimal = animals[currentIndex];
  if (!currentAnimal) return null;

  return (
    <View style={styles.container}>
      <View style={styles.testHeader}>
        <Text style={styles.progressText}>
          Animal {currentIndex + 1} / {animals.length}
        </Text>
        <Text style={styles.difficultyIndicator}>
          Level {currentAnimal.difficulty} • {currentAnimal.category}
        </Text>
      </View>
      
      <View style={styles.imageContainer}>
        {imageUrls[currentAnimal.id] ? (
          <>
            <Image 
              source={{ uri: imageUrls[currentAnimal.id] }} 
              style={styles.animalImage}
              contentFit="cover"
            />
            <TouchableOpacity 
              style={styles.reloadButton}
              onPress={reloadCurrentImage}
              disabled={isReloadingImage}
            >
              {isReloadingImage ? (
                <ActivityIndicator size="small" color="#7c3aed" />
              ) : (
                <Text style={styles.reloadButtonText}>Incorrect Photo?</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.imagePlaceholder}>
            <ActivityIndicator size="large" color="#7c3aed" />
          </View>
        )}
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
            {currentIndex + 1 === animals.length ? 'Finish' : 'Submit'}
          </Text>
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
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 280,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
  },
  progressBar: {
    width: 200,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7c3aed',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
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
    textAlign: 'center',
  },
  testHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  difficultyIndicator: {
    fontSize: 12,
    color: '#7c3aed',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  imageContainer: {
    flex: 1,
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
  },
  animalImage: {
    width: 280,
    height: 280,
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: 280,
    height: 280,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reloadButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
  },
  reloadButtonText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
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
  difficultyBadge: {
    fontSize: 12,
    color: '#7c3aed',
    fontWeight: 'normal',
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
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginVertical: 20,
    gap: 12,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    minWidth: 80,
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
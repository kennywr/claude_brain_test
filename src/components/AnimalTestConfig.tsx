import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import AnimalSelectionService, { TestMode, DifficultyLevel, TestConfiguration } from '../services/animalSelectionService';

interface AnimalTestConfigProps {
  onStartTest: (config: TestConfiguration) => void;
  onCancel: () => void;
}

export default function AnimalTestConfig({ onStartTest, onCancel }: AnimalTestConfigProps) {
  const [mode, setMode] = useState<TestMode>('moca');
  const [animalCount, setAnimalCount] = useState(3);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(2);
  const [userStats, setUserStats] = useState<any>(null);
  const [recommendedConfig, setRecommendedConfig] = useState<TestConfiguration | null>(null);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const stats = await AnimalSelectionService.getUserStats();
      const recommended = await AnimalSelectionService.getRecommendedConfig();
      setUserStats(stats);
      setRecommendedConfig(recommended);
    } catch (error) {
      console.warn('Error loading user data:', error);
    }
  };

  const handleUseRecommended = () => {
    if (recommendedConfig) {
      setMode(recommendedConfig.mode);
      setAnimalCount(recommendedConfig.animalCount);
      setDifficulty(recommendedConfig.difficulty);
    }
  };

  const handleStartTest = () => {
    const config: TestConfiguration = {
      mode,
      animalCount,
      difficulty,
      allowRepeats: false
    };
    onStartTest(config);
  };

  const getModeDescription = (selectedMode: TestMode): string => {
    switch (selectedMode) {
      case 'moca':
        return 'Classic MoCA test with 3 standard animals (Lion, Camel, Rhinoceros)';
      case 'extended':
        return 'Mix of familiar and unfamiliar animals with customizable count';
      case 'adaptive':
        return 'AI adapts difficulty based on your performance history';
      case 'random':
        return 'Completely random selection from all available animals';
    }
  };

  const getDifficultyDescription = (selectedDifficulty: DifficultyLevel): string => {
    switch (selectedDifficulty) {
      case 1:
        return 'Easy: Common animals (Cat, Dog, Cow, etc.)';
      case 2:
        return 'Medium: Moderate animals (Lion, Elephant, Penguin, etc.)';
      case 3:
        return 'Hard: Rare animals (Pangolin, Quokka, Axolotl, etc.)';
      case 'mixed':
        return 'Mixed: Random selection from all difficulty levels';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>Configure Animal Test</Text>
        <Text style={styles.subtitle}>Customize your cognitive assessment</Text>
      </View>

      {userStats && (
        <View style={styles.statsCard}>
          <Text style={styles.sectionTitle}>Your Progress</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userStats.totalSeen}</Text>
              <Text style={styles.statLabel}>Animals Seen</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userStats.totalCorrect}</Text>
              <Text style={styles.statLabel}>Correct</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{Math.round(userStats.accuracy * 100)}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{userStats.totalTests}</Text>
              <Text style={styles.statLabel}>Tests</Text>
            </View>
          </View>
        </View>
      )}

      {recommendedConfig && (
        <View style={styles.recommendedCard}>
          <Text style={styles.sectionTitle}>Recommended for You</Text>
          <Text style={styles.recommendedText}>
            {recommendedConfig.mode.toUpperCase()} mode • {recommendedConfig.animalCount} animals • 
            {recommendedConfig.difficulty === 'mixed' ? 'Mixed' : `Level ${recommendedConfig.difficulty}`} difficulty
          </Text>
          <TouchableOpacity style={styles.useRecommendedButton} onPress={handleUseRecommended}>
            <Text style={styles.useRecommendedButtonText}>Use Recommended</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.configSection}>
        <Text style={styles.sectionTitle}>Test Mode</Text>
        <Text style={styles.sectionDescription}>{getModeDescription(mode)}</Text>
        <View style={styles.optionGrid}>
          {(['moca', 'extended', 'adaptive', 'random'] as TestMode[]).map((testMode) => (
            <TouchableOpacity
              key={testMode}
              style={[styles.optionButton, mode === testMode && styles.optionButtonSelected]}
              onPress={() => setMode(testMode)}
            >
              <Text style={[styles.optionText, mode === testMode && styles.optionTextSelected]}>
                {testMode.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {mode !== 'moca' && (
        <View style={styles.configSection}>
          <Text style={styles.sectionTitle}>Number of Animals</Text>
          <Text style={styles.sectionDescription}>How many animals to show in this test</Text>
          <View style={styles.optionGrid}>
            {[3, 5, 8, 10, 15, 20].map((count) => (
              <TouchableOpacity
                key={count}
                style={[styles.optionButton, animalCount === count && styles.optionButtonSelected]}
                onPress={() => setAnimalCount(count)}
              >
                <Text style={[styles.optionText, animalCount === count && styles.optionTextSelected]}>
                  {count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {mode !== 'moca' && mode !== 'adaptive' && (
        <View style={styles.configSection}>
          <Text style={styles.sectionTitle}>Difficulty Level</Text>
          <Text style={styles.sectionDescription}>{getDifficultyDescription(difficulty)}</Text>
          <View style={styles.optionGrid}>
            {([1, 2, 3, 'mixed'] as DifficultyLevel[]).map((level) => (
              <TouchableOpacity
                key={level}
                style={[styles.optionButton, difficulty === level && styles.optionButtonSelected]}
                onPress={() => setDifficulty(level)}
              >
                <Text style={[styles.optionText, difficulty === level && styles.optionTextSelected]}>
                  {level === 'mixed' ? 'MIXED' : `LEVEL ${level}`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.startButton} onPress={handleStartTest}>
          <Text style={styles.startButtonText}>Start Test</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    marginBottom: 24,
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
  statsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#7c3aed',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  recommendedCard: {
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#0ea5e9',
  },
  recommendedText: {
    fontSize: 14,
    color: '#0c4a6e',
    marginBottom: 12,
  },
  useRecommendedButton: {
    backgroundColor: '#0ea5e9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  useRecommendedButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  configSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    lineHeight: 20,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  optionButtonSelected: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  optionTextSelected: {
    color: '#ffffff',
  },
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
  startButton: {
    backgroundColor: '#7c3aed',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});
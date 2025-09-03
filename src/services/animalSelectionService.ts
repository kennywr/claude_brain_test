import { AnimalData, getAllAnimals, getCoreAnimals, getExtendedAnimals, getAnimalsByDifficulty } from '../data/animalDatabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TestMode = 'moca' | 'extended' | 'adaptive' | 'random';
export type DifficultyLevel = 1 | 2 | 3 | 'mixed';

interface TestConfiguration {
  mode: TestMode;
  animalCount: number;
  difficulty: DifficultyLevel;
  allowRepeats: boolean;
}

interface UserProgress {
  animalsSeen: Set<string>;
  animalsCorrect: Set<string>;
  difficultyLevel: number;
  totalTests: number;
}

const PROGRESS_STORAGE_KEY = '@animal_progress';

export class AnimalSelectionService {
  private static instance: AnimalSelectionService;
  private userProgress: UserProgress | null = null;

  public static getInstance(): AnimalSelectionService {
    if (!AnimalSelectionService.instance) {
      AnimalSelectionService.instance = new AnimalSelectionService();
    }
    return AnimalSelectionService.instance;
  }

  // Load user progress from storage
  private async loadUserProgress(): Promise<UserProgress> {
    if (this.userProgress) {
      return this.userProgress;
    }

    try {
      const stored = await AsyncStorage.getItem(PROGRESS_STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.userProgress = {
          animalsSeen: new Set(data.animalsSeen || []),
          animalsCorrect: new Set(data.animalsCorrect || []),
          difficultyLevel: data.difficultyLevel || 1,
          totalTests: data.totalTests || 0
        };
      } else {
        this.userProgress = {
          animalsSeen: new Set(),
          animalsCorrect: new Set(),
          difficultyLevel: 1,
          totalTests: 0
        };
      }
    } catch (error) {
      console.warn('Error loading user progress:', error);
      this.userProgress = {
        animalsSeen: new Set(),
        animalsCorrect: new Set(),
        difficultyLevel: 1,
        totalTests: 0
      };
    }

    return this.userProgress;
  }

  // Save user progress to storage
  private async saveUserProgress(): Promise<void> {
    if (!this.userProgress) return;

    try {
      const data = {
        animalsSeen: Array.from(this.userProgress.animalsSeen),
        animalsCorrect: Array.from(this.userProgress.animalsCorrect),
        difficultyLevel: this.userProgress.difficultyLevel,
        totalTests: this.userProgress.totalTests
      };
      await AsyncStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Error saving user progress:', error);
    }
  }

  // Update user progress after a test
  public async updateProgress(animalIds: string[], correctIds: string[]): Promise<void> {
    const progress = await this.loadUserProgress();
    
    // Add to seen animals
    animalIds.forEach(id => progress.animalsSeen.add(id));
    
    // Add to correct animals
    correctIds.forEach(id => progress.animalsCorrect.add(id));
    
    // Update test count
    progress.totalTests += 1;

    // Adaptive difficulty adjustment
    const accuracy = correctIds.length / animalIds.length;
    if (accuracy >= 0.8 && progress.difficultyLevel < 3) {
      progress.difficultyLevel += 0.1;
    } else if (accuracy < 0.5 && progress.difficultyLevel > 1) {
      progress.difficultyLevel -= 0.1;
    }

    this.userProgress = progress;
    await this.saveUserProgress();
  }

  // Get animals for MoCA mode (original 3 animals)
  private getMocaAnimals(): AnimalData[] {
    const allAnimals = getAllAnimals();
    return [
      allAnimals.find(a => a.id === 'lion')!,
      allAnimals.find(a => a.id === 'camel')!,
      allAnimals.find(a => a.id === 'rhinoceros')!,
    ].filter(Boolean);
  }

  // Get random animals with difficulty weighting
  private getRandomAnimals(count: number, difficulty: DifficultyLevel): AnimalData[] {
    let pool: AnimalData[];

    if (difficulty === 'mixed') {
      pool = getAllAnimals();
    } else {
      pool = getAnimalsByDifficulty(difficulty);
    }

    // Shuffle and select
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  // Get adaptive animals based on user progress
  private async getAdaptiveAnimals(count: number): Promise<AnimalData[]> {
    const progress = await this.loadUserProgress();
    const targetDifficulty = Math.round(progress.difficultyLevel) as 1 | 2 | 3;
    
    // Start with target difficulty
    let pool = getAnimalsByDifficulty(targetDifficulty);
    
    // Remove recently seen animals for variety (keep only unseen or least recently seen)
    if (pool.length > count && progress.animalsSeen.size > 0) {
      const unseen = pool.filter(animal => !progress.animalsSeen.has(animal.id));
      if (unseen.length >= count) {
        pool = unseen;
      }
    }

    // Add some easier/harder animals for balanced challenge
    if (pool.length >= count) {
      const selected = [...pool].sort(() => Math.random() - 0.5).slice(0, count);
      
      // Mix in one easier and one harder if possible
      if (count >= 3) {
        if (targetDifficulty > 1) {
          const easier = getAnimalsByDifficulty((targetDifficulty - 1) as 1 | 2);
          if (easier.length > 0) {
            selected[selected.length - 1] = easier[Math.floor(Math.random() * easier.length)];
          }
        }
        if (targetDifficulty < 3 && count >= 4) {
          const harder = getAnimalsByDifficulty((targetDifficulty + 1) as 2 | 3);
          if (harder.length > 0) {
            selected[selected.length - 2] = harder[Math.floor(Math.random() * harder.length)];
          }
        }
      }
      
      return selected;
    }

    // Fallback to random if not enough animals in target difficulty
    return this.getRandomAnimals(count, targetDifficulty);
  }

  // Get extended animals (mix of core and API animals)
  private getExtendedAnimals(count: number, difficulty: DifficultyLevel): AnimalData[] {
    const coreAnimals = getCoreAnimals();
    const extendedAnimals = getExtendedAnimals();
    
    let pool: AnimalData[];
    
    if (difficulty === 'mixed') {
      // Mix of core and extended animals
      const coreCount = Math.ceil(count * 0.4); // 40% core animals
      const extendedCount = count - coreCount;
      
      const selectedCore = [...coreAnimals].sort(() => Math.random() - 0.5).slice(0, coreCount);
      const selectedExtended = [...extendedAnimals].sort(() => Math.random() - 0.5).slice(0, extendedCount);
      
      pool = [...selectedCore, ...selectedExtended];
    } else {
      // Filter by difficulty from all animals
      const filteredCore = coreAnimals.filter(a => a.difficulty === difficulty);
      const filteredExtended = extendedAnimals.filter(a => a.difficulty === difficulty);
      pool = [...filteredCore, ...filteredExtended];
    }

    return [...pool].sort(() => Math.random() - 0.5).slice(0, Math.min(count, pool.length));
  }

  // Main method to select animals based on configuration
  public async selectAnimals(config: TestConfiguration): Promise<AnimalData[]> {
    switch (config.mode) {
      case 'moca':
        return this.getMocaAnimals();
      
      case 'extended':
        return this.getExtendedAnimals(config.animalCount, config.difficulty);
      
      case 'adaptive':
        return await this.getAdaptiveAnimals(config.animalCount);
      
      case 'random':
        return this.getRandomAnimals(config.animalCount, config.difficulty);
      
      default:
        return this.getMocaAnimals();
    }
  }

  // Get user statistics
  public async getUserStats(): Promise<{
    totalSeen: number;
    totalCorrect: number;
    accuracy: number;
    currentDifficulty: number;
    totalTests: number;
  }> {
    const progress = await this.loadUserProgress();
    
    return {
      totalSeen: progress.animalsSeen.size,
      totalCorrect: progress.animalsCorrect.size,
      accuracy: progress.animalsSeen.size > 0 ? progress.animalsCorrect.size / progress.animalsSeen.size : 0,
      currentDifficulty: progress.difficultyLevel,
      totalTests: progress.totalTests
    };
  }

  // Reset user progress
  public async resetProgress(): Promise<void> {
    this.userProgress = {
      animalsSeen: new Set(),
      animalsCorrect: new Set(),
      difficultyLevel: 1,
      totalTests: 0
    };
    await this.saveUserProgress();
  }

  // Get recommended configuration based on user progress
  public async getRecommendedConfig(): Promise<TestConfiguration> {
    const progress = await this.loadUserProgress();
    
    if (progress.totalTests === 0) {
      // First time user
      return {
        mode: 'moca',
        animalCount: 3,
        difficulty: 2,
        allowRepeats: false
      };
    } else if (progress.totalTests < 5) {
      // New user
      return {
        mode: 'extended',
        animalCount: 5,
        difficulty: 'mixed',
        allowRepeats: false
      };
    } else {
      // Experienced user
      return {
        mode: 'adaptive',
        animalCount: 8,
        difficulty: Math.round(progress.difficultyLevel) as 1 | 2 | 3,
        allowRepeats: false
      };
    }
  }
}

export default AnimalSelectionService.getInstance();
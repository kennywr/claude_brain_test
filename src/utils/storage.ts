import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'cogtest_results_v1';

export interface TestResult {
  when: string;
  [key: string]: any;
}

export interface TestResults {
  [testId: string]: TestResult[];
}

export async function loadResults(): Promise<TestResults> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error('Error loading results:', error);
    return {};
  }
}

export async function saveResults(results: TestResults): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(results));
  } catch (error) {
    console.error('Error saving results:', error);
  }
}

export async function addResult(testId: string, scoreObj: any): Promise<TestResults> {
  try {
    const results = await loadResults();
    const now = new Date().toISOString();
    
    if (!results[testId]) {
      results[testId] = [];
    }
    
    results[testId].push({ when: now, ...scoreObj });
    await saveResults(results);
    return results;
  } catch (error) {
    console.error('Error adding result:', error);
    return await loadResults();
  }
}

export async function clearTestResults(testId: string): Promise<void> {
  try {
    const results = await loadResults();
    delete results[testId];
    await saveResults(results);
  } catch (error) {
    console.error('Error clearing test results:', error);
  }
}

export async function clearAllResults(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing all results:', error);
  }
}
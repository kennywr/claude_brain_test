// Simple test script for ImageService hybrid loading
const AsyncStorage = require('@react-native-async-storage/async-storage');

// Mock AsyncStorage for testing
const mockStorage = {};
AsyncStorage.getItem = jest.fn((key) => Promise.resolve(mockStorage[key] || null));
AsyncStorage.setItem = jest.fn((key, value) => {
  mockStorage[key] = value;
  return Promise.resolve();
});
AsyncStorage.removeItem = jest.fn((key) => {
  delete mockStorage[key];
  return Promise.resolve();
});
AsyncStorage.getAllKeys = jest.fn(() => Promise.resolve(Object.keys(mockStorage)));
AsyncStorage.multiRemove = jest.fn((keys) => {
  keys.forEach(key => delete mockStorage[key]);
  return Promise.resolve();
});

// Test function
async function testImageService() {
  console.log('Testing Hybrid Image Loading System...');
  
  // Import the service
  const ImageService = require('./src/services/imageService.ts').default;
  
  // Test data
  const testAnimals = [
    {
      id: 'cat',
      name: 'Cat',
      synonyms: ['kitten', 'feline'],
      difficulty: 1,
      category: 'mammal',
      commonality: 10,
      searchTerm: 'cat',
      localAsset: 'cat.jpg'
    },
    {
      id: 'unicorn',
      name: 'Unicorn',
      synonyms: [],
      difficulty: 3,
      category: 'other',
      commonality: 1,
      searchTerm: 'unicorn'
    }
  ];
  
  console.log('\n1. Testing local asset loading (cat):');
  const catImage = await ImageService.getImageUrl(testAnimals[0]);
  console.log('Cat image source:', typeof catImage, catImage !== null ? 'SUCCESS' : 'FAILED');
  
  console.log('\n2. Testing Wikipedia/Pexels fallback (unicorn):');
  const unicornImage = await ImageService.getImageUrl(testAnimals[1]);
  console.log('Unicorn image source:', typeof unicornImage, unicornImage);
  
  console.log('\n3. Testing cache functionality:');
  const cachedUnicorn = await ImageService.getImageUrl(testAnimals[1]);
  console.log('Cached unicorn (should be same):', cachedUnicorn === unicornImage ? 'SUCCESS' : 'FAILED');
  
  console.log('\nHybrid Image Loading Test Complete!');
}

// Run the test
testImageService().catch(console.error);
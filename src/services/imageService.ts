import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { AnimalData } from '../data/animalDatabase';

// Pexels API configuration
const PEXELS_API_KEY = Constants.expoConfig?.extra?.pexelsApiKey || '';
const PEXELS_BASE_URL = 'https://api.pexels.com/v1';

// Cache configuration
const IMAGE_CACHE_PREFIX = '@animal_images_';
const CACHE_EXPIRY_HOURS = 24; // Cache images for 24 hours

interface CachedImage {
  url: string;
  timestamp: number;
  searchTerm: string;
}

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  photographer_id: number;
  avg_color: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  liked: boolean;
  alt: string;
}

interface PexelsResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
  next_page?: string;
}

export class ImageService {
  private static instance: ImageService;
  
  public static getInstance(): ImageService {
    if (!ImageService.instance) {
      ImageService.instance = new ImageService();
    }
    return ImageService.instance;
  }

  // Get local asset path for core animals
  public getLocalAssetPath(animal: AnimalData): string | null {
    if (animal.localAsset) {
      // In a real app, you'd have these assets in your bundle
      // Since we don't have actual local assets, return null to use Pexels API
      return null;
    }
    return null;
  }

  // Get cached image URL
  private async getCachedImageUrl(searchTerm: string): Promise<string | null> {
    try {
      const cacheKey = IMAGE_CACHE_PREFIX + searchTerm;
      const cachedData = await AsyncStorage.getItem(cacheKey);
      
      if (cachedData) {
        const cached: CachedImage = JSON.parse(cachedData);
        const now = Date.now();
        const expiryTime = cached.timestamp + (CACHE_EXPIRY_HOURS * 60 * 60 * 1000);
        
        if (now < expiryTime) {
          return cached.url;
        } else {
          // Cache expired, remove it
          await AsyncStorage.removeItem(cacheKey);
        }
      }
    } catch (error) {
      console.warn('Error reading image cache:', error);
    }
    
    return null;
  }

  // Cache image URL
  private async cacheImageUrl(searchTerm: string, url: string): Promise<void> {
    try {
      const cacheKey = IMAGE_CACHE_PREFIX + searchTerm;
      const cacheData: CachedImage = {
        url,
        timestamp: Date.now(),
        searchTerm
      };
      
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Error caching image:', error);
    }
  }

  // Fetch image from Pexels API
  private async fetchFromPexels(searchTerm: string, bypassCache: boolean = false): Promise<string | null> {
    try {
      // Fetch more photos to get variety, especially when bypassing cache
      const perPage = bypassCache ? 15 : 1;
      const url = `${PEXELS_BASE_URL}/search?query=${encodeURIComponent(searchTerm)}&per_page=${perPage}&orientation=square`;
      console.log(`Pexels: Fetching from URL: ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': PEXELS_API_KEY,
        },
      });

      console.log(`Pexels: Response status: ${response.status}`);

      if (!response.ok) {
        throw new Error(`Pexels API error: ${response.status}`);
      }

      const data: PexelsResponse = await response.json();
      console.log(`Pexels: Got ${data.photos?.length || 0} photos for "${searchTerm}"`);
      
      if (data.photos && data.photos.length > 0) {
        // If bypassing cache, select a random photo from the results
        // Otherwise, use the first one for consistency
        const photoIndex = bypassCache && data.photos.length > 1 
          ? Math.floor(Math.random() * data.photos.length)
          : 0;
        
        const imageUrl = data.photos[photoIndex].src.medium;
        console.log(`Pexels: Selected image URL (index ${photoIndex}): ${imageUrl}`);
        
        // Only cache if not bypassing cache
        if (!bypassCache) {
          await this.cacheImageUrl(searchTerm, imageUrl);
        }
        
        return imageUrl;
      } else {
        console.log(`Pexels: No photos found for "${searchTerm}"`);
      }
    } catch (error) {
      console.warn('Error fetching from Pexels:', error);
      // Fallback to placeholder on API error
      return this.getPlaceholderUrl(searchTerm);
    }
    
    return null;
  }

  // Get placeholder URL for development
  private getPlaceholderUrl(searchTerm: string): string {
    // Use Robohash for consistent, unique images per animal
    // This at least gives us consistent visual representations
    const encodedTerm = encodeURIComponent(searchTerm);
    return `https://robohash.org/${encodedTerm}?set=set4&size=400x400`;
  }

  // Generate a consistent seed from search term
  private generateSeedFromTerm(term: string): string {
    // Create a simple hash of the term for consistent seeding
    let hash = 0;
    for (let i = 0; i < term.length; i++) {
      const char = term.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString();
  }

  // Main method to get image URL for an animal
  public async getImageUrl(animal: AnimalData, bypassCache: boolean = false): Promise<string> {
    try {
      console.log(`ImageService: Getting image for ${animal.name} (${animal.searchTerm})${bypassCache ? ' [bypassing cache]' : ''}`);
      
      // First try local asset
      const localPath = this.getLocalAssetPath(animal);
      if (localPath) {
        console.log(`ImageService: Using local path for ${animal.name}: ${localPath}`);
        return localPath;
      }

      // Then try cache (unless bypassing)
      if (!bypassCache) {
        const cachedUrl = await this.getCachedImageUrl(animal.searchTerm);
        if (cachedUrl) {
          console.log(`ImageService: Using cached URL for ${animal.name}: ${cachedUrl}`);
          return cachedUrl;
        }
      }

      // Finally fetch from API
      console.log(`ImageService: Fetching from Pexels for ${animal.name}`);
      const apiUrl = await this.fetchFromPexels(animal.searchTerm, bypassCache);
      if (apiUrl) {
        console.log(`ImageService: Got Pexels URL for ${animal.name}: ${apiUrl}`);
        return apiUrl;
      }

      // Fallback to placeholder
      const placeholderUrl = this.getPlaceholderUrl(animal.searchTerm);
      console.log(`ImageService: Using placeholder for ${animal.name}: ${placeholderUrl}`);
      return placeholderUrl;
      
    } catch (error) {
      console.warn('Error getting image URL:', error);
      const fallbackUrl = this.getPlaceholderUrl(animal.searchTerm);
      console.log(`ImageService: Error fallback for ${animal.name}: ${fallbackUrl}`);
      return fallbackUrl;
    }
  }

  // Preload images for better performance
  public async preloadImages(animals: AnimalData[]): Promise<void> {
    const preloadPromises = animals.map(animal => this.getImageUrl(animal));
    await Promise.all(preloadPromises);
  }

  // Clear image cache
  public async clearImageCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(IMAGE_CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.warn('Error clearing image cache:', error);
    }
  }
}

export default ImageService.getInstance();
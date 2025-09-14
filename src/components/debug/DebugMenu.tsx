import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { AnimalData, CORE_ANIMALS } from '../../data/animalDatabase';
import ImageService from '../../services/imageService';

interface DebugMenuProps {
  onClose: () => void;
}

interface AnimalImageState {
  animal: AnimalData;
  imageSource: string | any;
  status: 'loading' | 'loaded' | 'error';
  sourceType: 'local' | 'wikipedia' | 'pexels' | 'placeholder' | 'unknown';
  loadTime?: number;
}

export default function DebugMenu({ onClose }: DebugMenuProps) {
  const [animalStates, setAnimalStates] = useState<AnimalImageState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(null);

  // Helper function to determine source type
  const getSourceType = (imageSource: any, animal: AnimalData): 'local' | 'wikipedia' | 'pexels' | 'placeholder' | 'unknown' => {
    if (typeof imageSource !== 'string') {
      return 'local';
    }
    
    if (imageSource.includes('robohash.org')) {
      return 'placeholder';
    } else if (imageSource.includes('wikimedia') || imageSource.includes('wikipedia')) {
      return 'wikipedia';
    } else if (imageSource.includes('pexels')) {
      return 'pexels';
    } else {
      return 'unknown';
    }
  };

  // Get status icon and color
  const getStatusIcon = (status: string, sourceType: string) => {
    switch (status) {
      case 'loading': return { icon: '⏳', color: '#f59e0b' };
      case 'loaded': {
        switch (sourceType) {
          case 'local': return { icon: '💾', color: '#10b981' };
          case 'wikipedia': return { icon: '📖', color: '#3b82f6' };
          case 'pexels': return { icon: '📸', color: '#8b5cf6' };
          case 'placeholder': return { icon: '🤖', color: '#6b7280' };
          default: return { icon: '❓', color: '#6b7280' };
        }
      }
      case 'error': return { icon: '❌', color: '#ef4444' };
      default: return { icon: '❓', color: '#6b7280' };
    }
  };

  // Load all animal images
  const loadAllImages = async () => {
    setIsLoading(true);
    const initialStates: AnimalImageState[] = CORE_ANIMALS.slice(0, 30).map(animal => ({
      animal,
      imageSource: null,
      status: 'loading' as const,
      sourceType: 'unknown' as const,
    }));
    
    setAnimalStates(initialStates);
    
    // Load images sequentially to avoid overwhelming the system
    for (let i = 0; i < initialStates.length; i++) {
      const animal = initialStates[i].animal;
      const startTime = Date.now();
      
      try {
        console.log(`[DebugMenu] Loading ${animal.name}...`);
        const imageSource = await ImageService.getImageUrl(animal);
        const loadTime = Date.now() - startTime;
        const sourceType = getSourceType(imageSource, animal);
        
        setAnimalStates(prev => prev.map((state, index) => 
          index === i ? {
            ...state,
            imageSource,
            status: 'loaded' as const,
            sourceType,
            loadTime
          } : state
        ));
        
        console.log(`[DebugMenu] ${animal.name} loaded from ${sourceType} in ${loadTime}ms`);
      } catch (error) {
        console.error(`[DebugMenu] Failed to load ${animal.name}:`, error);
        setAnimalStates(prev => prev.map((state, index) => 
          index === i ? {
            ...state,
            status: 'error' as const,
            sourceType: 'unknown' as const
          } : state
        ));
      }
    }
    
    setIsLoading(false);
  };

  // Reload specific animal image
  const reloadAnimal = async (animalId: string) => {
    const animalIndex = animalStates.findIndex(state => state.animal.id === animalId);
    if (animalIndex === -1) return;
    
    setSelectedAnimal(animalId);
    setAnimalStates(prev => prev.map((state, index) => 
      index === animalIndex ? { ...state, status: 'loading' as const } : state
    ));
    
    try {
      const animal = animalStates[animalIndex].animal;
      const startTime = Date.now();
      const imageSource = await ImageService.getImageUrl(animal, true); // Bypass cache
      const loadTime = Date.now() - startTime;
      const sourceType = getSourceType(imageSource, animal);
      
      setAnimalStates(prev => prev.map((state, index) => 
        index === animalIndex ? {
          ...state,
          imageSource,
          status: 'loaded' as const,
          sourceType,
          loadTime
        } : state
      ));
    } catch (error) {
      setAnimalStates(prev => prev.map((state, index) => 
        index === animalIndex ? {
          ...state,
          status: 'error' as const
        } : state
      ));
    }
    
    setSelectedAnimal(null);
  };

  // Clear all caches
  const clearCaches = async () => {
    Alert.alert(
      'Clear All Caches',
      'This will clear all cached images. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            try {
              await ImageService.clearImageCache();
              Alert.alert('Success', 'All image caches cleared!');
              loadAllImages(); // Reload everything
            } catch (error) {
              Alert.alert('Error', 'Failed to clear caches');
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    loadAllImages();
  }, []);

  // Statistics
  const stats = animalStates.reduce((acc, state) => {
    if (state.status === 'loaded') {
      acc[state.sourceType] = (acc[state.sourceType] || 0) + 1;
      acc.total++;
      if (state.loadTime) {
        acc.totalLoadTime += state.loadTime;
      }
    } else if (state.status === 'error') {
      acc.errors++;
    }
    return acc;
  }, {
    local: 0,
    wikipedia: 0,
    pexels: 0,
    placeholder: 0,
    unknown: 0,
    total: 0,
    errors: 0,
    totalLoadTime: 0
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>🔧 Debug Menu</Text>
            <Text style={styles.subtitle}>Animal Image Loading Analysis</Text>
          </View>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Statistics */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>📊 Loading Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.local}</Text>
              <Text style={styles.statLabel}>💾 Local</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.wikipedia}</Text>
              <Text style={styles.statLabel}>📖 Wikipedia</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.pexels}</Text>
              <Text style={styles.statLabel}>📸 Pexels</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.errors}</Text>
              <Text style={styles.statLabel}>❌ Errors</Text>
            </View>
          </View>
          {stats.total > 0 && (
            <Text style={styles.avgLoadTime}>
              Avg Load Time: {Math.round(stats.totalLoadTime / stats.total)}ms
            </Text>
          )}
        </View>

        {/* Controls */}
        <View style={styles.controlsCard}>
          <TouchableOpacity style={styles.controlButton} onPress={loadAllImages}>
            <Text style={styles.controlButtonText}>🔄 Reload All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton} onPress={clearCaches}>
            <Text style={styles.controlButtonText}>🗑️ Clear Cache</Text>
          </TouchableOpacity>
        </View>

        {/* Animal Grid */}
        <View style={styles.animalGrid}>
          {animalStates.map((state, index) => {
            const statusInfo = getStatusIcon(state.status, state.sourceType);
            const isSelected = selectedAnimal === state.animal.id;
            
            return (
              <TouchableOpacity
                key={state.animal.id}
                style={[styles.animalItem, isSelected && styles.animalItemSelected]}
                onPress={() => reloadAnimal(state.animal.id)}
              >
                <View style={styles.animalImageContainer}>
                  {state.status === 'loading' ? (
                    <ActivityIndicator size="small" color="#3b82f6" />
                  ) : state.status === 'loaded' && state.imageSource ? (
                    <Image
                      source={typeof state.imageSource === 'string' 
                        ? { uri: state.imageSource } 
                        : state.imageSource
                      }
                      style={styles.animalImage}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={styles.errorPlaceholder}>
                      <Text style={styles.errorText}>❌</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.animalInfo}>
                  <Text style={styles.animalName} numberOfLines={1}>
                    {state.animal.name}
                  </Text>
                  <View style={styles.statusRow}>
                    <Text style={[styles.statusIcon, { color: statusInfo.color }]}>
                      {statusInfo.icon}
                    </Text>
                    <Text style={[styles.statusText, { color: statusInfo.color }]}>
                      {state.sourceType}
                    </Text>
                  </View>
                  {state.loadTime && (
                    <Text style={styles.loadTime}>{state.loadTime}ms</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Loading animal images...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  closeButton: {
    backgroundColor: '#ef4444',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statsCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginTop: 2,
  },
  avgLoadTime: {
    textAlign: 'center',
    fontSize: 12,
    color: '#6b7280',
    marginTop: 12,
  },
  controlsCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  controlButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  controlButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  animalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  animalItem: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  animalItemSelected: {
    borderColor: '#3b82f6',
    borderWidth: 2,
  },
  animalImageContainer: {
    width: '100%',
    aspectRatio: 1, // Square aspect ratio
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'hidden', // Ensure rounded corners work
  },
  animalImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  errorPlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 24,
  },
  animalInfo: {
    alignItems: 'center',
  },
  animalName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  statusIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  loadTime: {
    fontSize: 9,
    color: '#9ca3af',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
});
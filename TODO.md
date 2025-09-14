# Mental Clarity Testing Expo App - TODO

## Project Status
Converting web-based cognitive testing app to React Native/Expo mobile app.

## Tasks

### ✅ Completed
- [x] Analyze existing web app structure and identify core components
- [x] Set up React Native navigation structure with tabs for Dashboard, Tests, and History
- [x] Create AsyncStorage-based data persistence system for test results
- [x] Convert Reaction Time test to React Native components
- [x] Convert 2-Back working memory test to React Native
- [x] Convert Digit Span test to React Native
- [x] Convert Stroop test to React Native
- [x] Implement dashboard with test overview and progress charts
- [x] Test app functionality and fix any mobile-specific issues (basic testing complete)
- [x] Set up git repository and GitHub integration
- [x] Add Animal Naming Test (MoCA-based visual recognition test)
- [x] Expand Animal Naming Test to 200+ animals with advanced features:
  - [x] Created comprehensive animal database (50 core + 150+ extended animals)
  - [x] Implemented difficulty categorization system (Easy/Medium/Hard)
  - [x] Added multiple test modes (MoCA/Extended/Adaptive/Random)
  - [x] Built image caching and optimization system with Expo Image
  - [x] Created test configuration screen with user progress tracking
  - [x] Implemented adaptive difficulty algorithm
  - [x] Added difficulty-weighted scoring system
  - [x] Built user progress tracking and statistics

### ✅ Completed (Recent)
- [x] **Implement Hybrid Animal Image Loading System**
  - [x] Create local assets directory structure for fallback animal images
  - [x] Source and prepare 30 high-quality animal images for local storage
  - [x] Update animalDatabase.ts to include local asset paths for selected animals
  - [x] Modify ImageService to implement hybrid loading strategy (local first, then Wikipedia/Pexels)
  - [x] Add Wikipedia image search as secondary fallback option
  - [x] Create animalAssets.ts registry for proper Expo bundling
  - [x] Update EnhancedAnimalNamingTest component to use hybrid image loading
  - [x] Add getImageSource() helper for local/remote image handling
  - [x] Implement separate caching for Wikipedia (48h) and Pexels (24h) APIs
  - [x] Add enhanced logging for debugging image source types

### ✅ Completed (Latest)
- [x] **Debug Menu & Image Testing System**
  - [x] Create debug menu component with navigation integration
  - [x] Build responsive animal image gallery with proper aspect ratios
  - [x] Add comprehensive image loading status indicators and error states
  - [x] Implement real-time debug logging system for image loading events
  - [x] Add debug controls for testing different image sources (local/Wikipedia/Pexels)
  - [x] Create tap-to-activate debug mode (5 taps on "Cognitive Tests" title)
  - [x] Build statistics dashboard showing source distribution and load times
  - [x] Add individual animal reload and cache clearing functionality

### 🔄 Next Priority
- [ ] Fix mismatched local animal images using debug menu findings
- [ ] Create history view with charts using react-native-chart-kit
- [ ] Add proper styling and mobile-optimized UI components

### ⏳ Future Enhancements  
- [ ] Test hybrid image loading across different network conditions
- [ ] Add fallback error handling and retry logic for failed image loads
- [ ] Implement image preloading and caching optimization for local assets
- [ ] Add offline mode support for cognitive tests
- [ ] Implement user preferences and settings screen

## Test Components Built
1. **Reaction Time** - Touch response speed measurement ✅
2. **2-Back** - Working memory test with letter sequences ✅
3. **Digit Span** - Memory span test with number sequences ✅
4. **Stroop** - Attention/inhibition test with color-word conflicts ✅
5. **Animal Naming** - Enhanced visual recognition test with 200+ animals ✅
   - Multiple test modes (MoCA/Extended/Adaptive/Random)
   - Difficulty-based scoring and adaptive progression
   - Comprehensive animal database with hybrid image loading
   - **Hybrid Image System**: 30 local assets + Wikipedia/Pexels API fallbacks
   - User progress tracking and personalized recommendations

## Technical Notes
- Using React Navigation for tab structure
- AsyncStorage for local data persistence
- react-native-chart-kit for progress visualization
- Touch-optimized UI components
- **Hybrid Image Loading**: animalAssets.ts registry + ImageService with multi-tier fallbacks
- **APIs**: Wikipedia Commons (secondary) + Pexels (tertiary) with differential caching
- **Debug System**: Comprehensive image testing with real-time statistics and controls

## Hybrid Animal Image Loading - IMPLEMENTED ✅

### Implementation Summary
Successfully implemented a robust hybrid image loading system that combines local bundled images with dynamic Wikipedia and Pexels API sources for optimal reliability and performance.

### 🏗️ Architecture Delivered
1. **Primary Source**: Local bundled images (30 core animals) - ✅ INSTANT LOADING
2. **Secondary Source**: Wikipedia Commons API (reliable, free) - ✅ 48h CACHE
3. **Tertiary Source**: Pexels API (high quality) - ✅ 24h CACHE
4. **Final Fallback**: Robohash placeholder - ✅ CONSISTENT

### 📁 File Structure Created
```
src/services/
├── animalAssets.ts          # Asset registry with require() statements
├── imageService.ts          # Hybrid loading logic + Wikipedia API
└── animalSelectionService.ts # Existing service

assets/images/animals/core/   # 30 bundled JPG images (1.7MB total)
├── cat.jpg, dog.jpg, lion.jpg, tiger.jpg...
└── [All core animals with localAsset property]
```

### 🔧 Key Components Updated
- **animalDatabase.ts**: Added `localAsset` property to 30 core animals
- **ImageService.ts**: Multi-tier loading strategy + Wikipedia API integration  
- **EnhancedAnimalNamingTest.tsx**: Added `getImageSource()` helper for hybrid sources
- **animalAssets.ts**: Centralized require() registry for Expo bundling

### ⚡ Performance Features
- **Instant Loading**: Core animals load immediately from local bundle
- **Smart Caching**: Wikipedia (48h) vs Pexels (24h) differential expiry
- **Graceful Degradation**: Multiple fallback layers prevent broken images
- **Bundle Optimization**: Expo automatically optimizes and compresses assets
- **Debug Menu**: Real-time monitoring and testing of all image sources

### 🔧 Debug System Features
- **Access**: Tap "Cognitive Tests" title 5 times to activate
- **Visual Indicators**: 💾 Local, 📖 Wikipedia, 📸 Pexels, 🤖 Placeholder, ❌ Error
- **Statistics Dashboard**: Source distribution, load times, error tracking
- **Interactive Controls**: Individual reload, cache clearing, comprehensive testing
- **Responsive Design**: Square aspect ratio grid prevents image distortion

## Original Implementation Plan (Reference)

### Architecture
1. **Primary Source**: Local bundled images (20-30 core animals)
2. **Secondary Source**: Wikipedia Commons API (reliable, free)
3. **Tertiary Source**: Pexels API (current implementation, high quality)

### Implementation Details

#### 1. Local Asset Structure
```
assets/images/animals/
├── core/                 # 20-30 most common animals
│   ├── cat.jpg
│   ├── dog.jpg
│   ├── lion.jpg
│   └── ...
└── fallback/            # Generic fallback images
    └── animal-placeholder.jpg
```

#### 2. Loading Strategy
- **Step 1**: Check if animal has local asset, load immediately if available
- **Step 2**: If no local asset, try Wikipedia Commons API
- **Step 3**: If Wikipedia fails, fallback to current Pexels API
- **Step 4**: If all fail, show generic animal placeholder

#### 3. Performance Optimizations
- Preload all local assets during app initialization
- Implement progressive image loading (thumbnail → full resolution)
- Cache Wikipedia URLs with longer expiry (48 hours vs 24 hours for Pexels)
- Implement retry logic with exponential backoff

#### 4. Image Selection Criteria
**Local Assets (Priority Animals)**:
- cat, dog, cow, horse, pig, sheep, chicken, duck, fish, rabbit
- lion, tiger, elephant, giraffe, zebra, monkey, bear, wolf
- bird, frog, butterfly, spider, whale, shark, penguin, owl
- Total: 25-30 animals covering highest commonality scores

#### 5. Wikipedia Integration
- Use Wikipedia Commons API: `https://commons.wikimedia.org/w/api.php`
- Search for animal images using scientific and common names
- Filter for high-resolution, appropriate images
- Respect API rate limits and implement caching

#### 6. Debug Menu Features
**Purpose**: Testing and validation of hybrid image loading system

**Features**:
- **Animal Gallery**: Scrollable grid showing all 30 core animals
- **Image Status**: Visual indicators (✅ loaded, ⏳ loading, ❌ failed)
- **Source Labels**: Show which source loaded each image (local/Wikipedia/Pexels)
- **Load Testing**: Force reload from different sources
- **Performance Metrics**: Load times, cache hits, failures
- **Log Viewer**: Real-time image loading events and errors

**Navigation**: Accessible via hidden gesture or dev menu (shake device)

**Layout**:
```
┌─────────────────┐
│ Debug Menu      │
├─────────────────┤
│ 📊 Image Stats  │
│ 🔄 Force Reload │
│ 📝 View Logs    │
├─────────────────┤
│ [Cat] ✅ local  │
│ [Dog] ✅ local  │
│ [Lion] ⏳ wiki  │
│ [Tiger] ❌ fail │
│ ...             │
└─────────────────┘
```
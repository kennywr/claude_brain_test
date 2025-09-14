# Animal Images Directory

## Structure

### `/core/`
Contains 20-30 high-quality images of the most common animals used in the Animal Naming Test. These images are bundled with the app to ensure reliability and instant loading.

**Priority Animals (from animalDatabase.ts)**:
- **Easy Animals**: cat, dog, cow, horse, pig, sheep, chicken, duck, fish, rabbit, bird, mouse, frog, butterfly, spider
- **Medium Animals**: lion, tiger, elephant, giraffe, zebra, monkey, bear, wolf, deer, penguin, owl, eagle, shark, whale, dolphin

### `/fallback/`
Contains generic placeholder images used when all image sources (local, Wikipedia, Pexels) fail to load.

## Image Requirements

### Core Animal Images
- **Format**: JPG (for smaller file size) or PNG (if transparency needed)
- **Resolution**: 512x512px minimum, 1024x1024px preferred
- **Quality**: High quality, clear animal representation
- **Background**: Clean, minimal background preferred
- **File Size**: Under 200KB each to minimize app bundle size
- **Naming**: Use animal ID from animalDatabase.ts (e.g., `cat.jpg`, `lion.jpg`)

### Fallback Images
- `animal-placeholder.jpg`: Generic animal silhouette or icon
- Same size and quality requirements as core images

## Integration Notes
- Images are referenced in `animalDatabase.ts` via the `localAsset` property
- The `ImageService` will check for local assets first before trying external APIs
- All images should be optimized for mobile devices (appropriate compression)
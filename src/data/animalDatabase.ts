export interface AnimalData {
  id: string;
  name: string;           // Primary name
  synonyms: string[];     // Alternative names
  difficulty: 1 | 2 | 3;  // 1=Easy, 2=Medium, 3=Hard
  category: 'mammal' | 'bird' | 'reptile' | 'amphibian' | 'fish' | 'insect' | 'other';
  commonality: number;    // How familiar (1-10, 10=most common)
  localAsset?: string;    // Relative path to local image asset from assets/images/animals/core/
  searchTerm: string;     // Term to use for API image search
}

// Core animals - 30 have local assets for optimal performance, others use API loading
// Animals with local assets: bear, bird, butterfly, cat, chicken, cow, deer, dog, dolphin, duck, 
// eagle, elephant, fish, frog, giraffe, horse, lion, monkey, mouse, owl, penguin, pig, rabbit, 
// shark, sheep, spider, tiger, whale, wolf, zebra
export const CORE_ANIMALS: AnimalData[] = [
  // EASY ANIMALS (commonality 8-10)
  { id: 'cat', name: 'Cat', synonyms: ['kitten', 'feline'], difficulty: 1, category: 'mammal', commonality: 10, searchTerm: 'cat', localAsset: 'cat.jpg' },
  { id: 'dog', name: 'Dog', synonyms: ['puppy', 'canine'], difficulty: 1, category: 'mammal', commonality: 10, searchTerm: 'dog', localAsset: 'dog.jpg' },
  { id: 'cow', name: 'Cow', synonyms: ['cattle', 'bull'], difficulty: 1, category: 'mammal', commonality: 9, searchTerm: 'cow', localAsset: 'cow.jpg' },
  { id: 'horse', name: 'Horse', synonyms: ['stallion', 'mare'], difficulty: 1, category: 'mammal', commonality: 9, searchTerm: 'horse', localAsset: 'horse.jpg' },
  { id: 'pig', name: 'Pig', synonyms: ['swine', 'hog'], difficulty: 1, category: 'mammal', commonality: 9, searchTerm: 'pig', localAsset: 'pig.jpg' },
  { id: 'sheep', name: 'Sheep', synonyms: ['lamb', 'ewe', 'ram'], difficulty: 1, category: 'mammal', commonality: 9, searchTerm: 'sheep', localAsset: 'sheep.jpg' },
  { id: 'chicken', name: 'Chicken', synonyms: ['hen', 'rooster'], difficulty: 1, category: 'bird', commonality: 10, searchTerm: 'chicken', localAsset: 'chicken.jpg' },
  { id: 'duck', name: 'Duck', synonyms: ['duckling'], difficulty: 1, category: 'bird', commonality: 9, searchTerm: 'duck', localAsset: 'duck.jpg' },
  { id: 'fish', name: 'Fish', synonyms: ['goldfish'], difficulty: 1, category: 'fish', commonality: 10, searchTerm: 'fish', localAsset: 'fish.jpg' },
  { id: 'rabbit', name: 'Rabbit', synonyms: ['bunny', 'hare'], difficulty: 1, category: 'mammal', commonality: 9, searchTerm: 'rabbit', localAsset: 'rabbit.jpg' },
  { id: 'bird', name: 'Bird', synonyms: ['sparrow'], difficulty: 1, category: 'bird', commonality: 10, searchTerm: 'bird', localAsset: 'bird.jpg' },
  { id: 'mouse', name: 'Mouse', synonyms: ['mice'], difficulty: 1, category: 'mammal', commonality: 8, searchTerm: 'mouse', localAsset: 'mouse.jpg' },
  { id: 'frog', name: 'Frog', synonyms: ['toad'], difficulty: 1, category: 'amphibian', commonality: 8, searchTerm: 'frog', localAsset: 'frog.jpg' },
  { id: 'butterfly', name: 'Butterfly', synonyms: [], difficulty: 1, category: 'insect', commonality: 8, searchTerm: 'butterfly', localAsset: 'butterfly.jpg' },
  { id: 'spider', name: 'Spider', synonyms: [], difficulty: 1, category: 'insect', commonality: 8, searchTerm: 'spider', localAsset: 'spider.jpg' },

  // MEDIUM ANIMALS (commonality 5-7)
  { id: 'lion', name: 'Lion', synonyms: [], difficulty: 2, category: 'mammal', commonality: 7, searchTerm: 'lion', localAsset: 'lion.jpg' },
  { id: 'tiger', name: 'Tiger', synonyms: [], difficulty: 2, category: 'mammal', commonality: 7, searchTerm: 'tiger', localAsset: 'tiger.jpg' },
  { id: 'elephant', name: 'Elephant', synonyms: [], difficulty: 2, category: 'mammal', commonality: 7, searchTerm: 'elephant', localAsset: 'elephant.jpg' },
  { id: 'giraffe', name: 'Giraffe', synonyms: [], difficulty: 2, category: 'mammal', commonality: 6, searchTerm: 'giraffe', localAsset: 'giraffe.jpg' },
  { id: 'zebra', name: 'Zebra', synonyms: [], difficulty: 2, category: 'mammal', commonality: 6, searchTerm: 'zebra', localAsset: 'zebra.jpg' },
  { id: 'monkey', name: 'Monkey', synonyms: ['ape', 'chimp'], difficulty: 2, category: 'mammal', commonality: 7, searchTerm: 'monkey', localAsset: 'monkey.jpg' },
  { id: 'bear', name: 'Bear', synonyms: [], difficulty: 2, category: 'mammal', commonality: 7, searchTerm: 'bear', localAsset: 'bear.jpg' },
  { id: 'wolf', name: 'Wolf', synonyms: [], difficulty: 2, category: 'mammal', commonality: 6, searchTerm: 'wolf', localAsset: 'wolf.jpg' },
  { id: 'deer', name: 'Deer', synonyms: ['doe', 'buck'], difficulty: 2, category: 'mammal', commonality: 6, searchTerm: 'deer', localAsset: 'deer.jpg' },
  { id: 'camel', name: 'Camel', synonyms: ['dromedary'], difficulty: 2, category: 'mammal', commonality: 5, searchTerm: 'camel' },
  { id: 'rhinoceros', name: 'Rhinoceros', synonyms: ['rhino'], difficulty: 2, category: 'mammal', commonality: 5, searchTerm: 'rhinoceros', localAsset: 'rhino.jpg' },
  { id: 'hippopotamus', name: 'Hippopotamus', synonyms: ['hippo'], difficulty: 2, category: 'mammal', commonality: 5, searchTerm: 'hippopotamus', localAsset: 'hippo.jpg' },
  { id: 'kangaroo', name: 'Kangaroo', synonyms: [], difficulty: 2, category: 'mammal', commonality: 6, searchTerm: 'kangaroo' },
  { id: 'penguin', name: 'Penguin', synonyms: [], difficulty: 2, category: 'bird', commonality: 6, searchTerm: 'penguin', localAsset: 'penguin.jpg' },
  { id: 'owl', name: 'Owl', synonyms: [], difficulty: 2, category: 'bird', commonality: 6, searchTerm: 'owl', localAsset: 'owl.jpg' },
  { id: 'eagle', name: 'Eagle', synonyms: [], difficulty: 2, category: 'bird', commonality: 6, searchTerm: 'eagle', localAsset: 'eagle.jpg' },
  { id: 'shark', name: 'Shark', synonyms: [], difficulty: 2, category: 'fish', commonality: 6, searchTerm: 'shark', localAsset: 'shark.jpg' },
  { id: 'whale', name: 'Whale', synonyms: [], difficulty: 2, category: 'mammal', commonality: 6, searchTerm: 'whale', localAsset: 'whale.jpg' },
  { id: 'dolphin', name: 'Dolphin', synonyms: [], difficulty: 2, category: 'mammal', commonality: 6, searchTerm: 'dolphin', localAsset: 'dolphin.jpg' },
  { id: 'octopus', name: 'Octopus', synonyms: [], difficulty: 2, category: 'other', commonality: 5, searchTerm: 'octopus' },

  // HARD ANIMALS (commonality 2-4) - No local assets, will use API loading
  { id: 'pangolin', name: 'Pangolin', synonyms: [], difficulty: 3, category: 'mammal', commonality: 2, searchTerm: 'pangolin' },
  { id: 'quokka', name: 'Quokka', synonyms: [], difficulty: 3, category: 'mammal', commonality: 2, searchTerm: 'quokka' },
  { id: 'capybara', name: 'Capybara', synonyms: [], difficulty: 3, category: 'mammal', commonality: 3, searchTerm: 'capybara' },
  { id: 'axolotl', name: 'Axolotl', synonyms: [], difficulty: 3, category: 'amphibian', commonality: 2, searchTerm: 'axolotl' },
  { id: 'numbat', name: 'Numbat', synonyms: [], difficulty: 3, category: 'mammal', commonality: 2, searchTerm: 'numbat' },
  { id: 'tapir', name: 'Tapir', synonyms: [], difficulty: 3, category: 'mammal', commonality: 2, searchTerm: 'tapir' },
  { id: 'okapi', name: 'Okapi', synonyms: [], difficulty: 3, category: 'mammal', commonality: 2, searchTerm: 'okapi' },
  { id: 'aardvark', name: 'Aardvark', synonyms: [], difficulty: 3, category: 'mammal', commonality: 2, searchTerm: 'aardvark' },
  { id: 'echidna', name: 'Echidna', synonyms: [], difficulty: 3, category: 'mammal', commonality: 2, searchTerm: 'echidna' },
  { id: 'platypus', name: 'Platypus', synonyms: [], difficulty: 3, category: 'mammal', commonality: 3, searchTerm: 'platypus' },
];

// Extended animals - these will be loaded via API
export const EXTENDED_ANIMALS: AnimalData[] = [
  // More mammals
  { id: 'llama', name: 'Llama', synonyms: ['alpaca'], difficulty: 2, category: 'mammal', commonality: 4, searchTerm: 'llama' },
  { id: 'meerkat', name: 'Meerkat', synonyms: [], difficulty: 2, category: 'mammal', commonality: 4, searchTerm: 'meerkat' },
  { id: 'wombat', name: 'Wombat', synonyms: [], difficulty: 3, category: 'mammal', commonality: 2, searchTerm: 'wombat' },
  { id: 'koala', name: 'Koala', synonyms: [], difficulty: 2, category: 'mammal', commonality: 6, searchTerm: 'koala' },
  { id: 'sloth', name: 'Sloth', synonyms: [], difficulty: 2, category: 'mammal', commonality: 4, searchTerm: 'sloth' },
  { id: 'armadillo', name: 'Armadillo', synonyms: [], difficulty: 3, category: 'mammal', commonality: 3, searchTerm: 'armadillo' },
  { id: 'raccoon', name: 'Raccoon', synonyms: [], difficulty: 2, category: 'mammal', commonality: 5, searchTerm: 'raccoon' },
  { id: 'skunk', name: 'Skunk', synonyms: [], difficulty: 2, category: 'mammal', commonality: 4, searchTerm: 'skunk' },
  { id: 'porcupine', name: 'Porcupine', synonyms: [], difficulty: 2, category: 'mammal', commonality: 4, searchTerm: 'porcupine' },
  { id: 'hedgehog', name: 'Hedgehog', synonyms: [], difficulty: 2, category: 'mammal', commonality: 4, searchTerm: 'hedgehog' },

  // Birds
  { id: 'flamingo', name: 'Flamingo', synonyms: [], difficulty: 2, category: 'bird', commonality: 5, searchTerm: 'flamingo' },
  { id: 'peacock', name: 'Peacock', synonyms: ['peafowl'], difficulty: 2, category: 'bird', commonality: 5, searchTerm: 'peacock' },
  { id: 'parrot', name: 'Parrot', synonyms: [], difficulty: 2, category: 'bird', commonality: 6, searchTerm: 'parrot' },
  { id: 'toucan', name: 'Toucan', synonyms: [], difficulty: 2, category: 'bird', commonality: 4, searchTerm: 'toucan' },
  { id: 'pelican', name: 'Pelican', synonyms: [], difficulty: 2, category: 'bird', commonality: 4, searchTerm: 'pelican' },
  { id: 'heron', name: 'Heron', synonyms: [], difficulty: 2, category: 'bird', commonality: 3, searchTerm: 'heron' },
  { id: 'crane', name: 'Crane', synonyms: [], difficulty: 2, category: 'bird', commonality: 3, searchTerm: 'crane bird' },
  { id: 'stork', name: 'Stork', synonyms: [], difficulty: 2, category: 'bird', commonality: 3, searchTerm: 'stork' },
  { id: 'swan', name: 'Swan', synonyms: [], difficulty: 2, category: 'bird', commonality: 5, searchTerm: 'swan' },
  { id: 'goose', name: 'Goose', synonyms: [], difficulty: 2, category: 'bird', commonality: 5, searchTerm: 'goose' },

  // Reptiles
  { id: 'snake', name: 'Snake', synonyms: ['serpent'], difficulty: 1, category: 'reptile', commonality: 7, searchTerm: 'snake' },
  { id: 'lizard', name: 'Lizard', synonyms: [], difficulty: 2, category: 'reptile', commonality: 5, searchTerm: 'lizard' },
  { id: 'turtle', name: 'Turtle', synonyms: ['tortoise'], difficulty: 1, category: 'reptile', commonality: 7, searchTerm: 'turtle' },
  { id: 'crocodile', name: 'Crocodile', synonyms: ['alligator'], difficulty: 2, category: 'reptile', commonality: 5, searchTerm: 'crocodile' },
  { id: 'iguana', name: 'Iguana', synonyms: [], difficulty: 2, category: 'reptile', commonality: 4, searchTerm: 'iguana' },
  { id: 'gecko', name: 'Gecko', synonyms: [], difficulty: 2, category: 'reptile', commonality: 4, searchTerm: 'gecko' },
  { id: 'chameleon', name: 'Chameleon', synonyms: [], difficulty: 2, category: 'reptile', commonality: 4, searchTerm: 'chameleon' },
  { id: 'cobra', name: 'Cobra', synonyms: [], difficulty: 3, category: 'reptile', commonality: 3, searchTerm: 'cobra' },
  { id: 'python', name: 'Python', synonyms: [], difficulty: 3, category: 'reptile', commonality: 3, searchTerm: 'python snake' },
  { id: 'viper', name: 'Viper', synonyms: [], difficulty: 3, category: 'reptile', commonality: 2, searchTerm: 'viper snake' },

  // Marine life
  { id: 'seal', name: 'Seal', synonyms: [], difficulty: 2, category: 'mammal', commonality: 5, searchTerm: 'seal' },
  { id: 'walrus', name: 'Walrus', synonyms: [], difficulty: 2, category: 'mammal', commonality: 4, searchTerm: 'walrus' },
  { id: 'otter', name: 'Otter', synonyms: [], difficulty: 2, category: 'mammal', commonality: 4, searchTerm: 'otter' },
  { id: 'jellyfish', name: 'Jellyfish', synonyms: [], difficulty: 2, category: 'other', commonality: 5, searchTerm: 'jellyfish' },
  { id: 'starfish', name: 'Starfish', synonyms: ['sea star'], difficulty: 2, category: 'other', commonality: 5, searchTerm: 'starfish' },
  { id: 'crab', name: 'Crab', synonyms: [], difficulty: 2, category: 'other', commonality: 6, searchTerm: 'crab' },
  { id: 'lobster', name: 'Lobster', synonyms: [], difficulty: 2, category: 'other', commonality: 5, searchTerm: 'lobster' },
  { id: 'shrimp', name: 'Shrimp', synonyms: [], difficulty: 2, category: 'other', commonality: 6, searchTerm: 'shrimp' },
  { id: 'seahorse', name: 'Seahorse', synonyms: [], difficulty: 2, category: 'fish', commonality: 4, searchTerm: 'seahorse' },
  { id: 'stingray', name: 'Stingray', synonyms: [], difficulty: 2, category: 'fish', commonality: 4, searchTerm: 'stingray' },

  // More exotic mammals
  { id: 'lemur', name: 'Lemur', synonyms: [], difficulty: 3, category: 'mammal', commonality: 3, searchTerm: 'lemur' },
  { id: 'gibbon', name: 'Gibbon', synonyms: [], difficulty: 3, category: 'mammal', commonality: 2, searchTerm: 'gibbon' },
  { id: 'orangutan', name: 'Orangutan', synonyms: [], difficulty: 3, category: 'mammal', commonality: 3, searchTerm: 'orangutan' },
  { id: 'chimpanzee', name: 'Chimpanzee', synonyms: ['chimp'], difficulty: 2, category: 'mammal', commonality: 5, searchTerm: 'chimpanzee' },
  { id: 'gorilla', name: 'Gorilla', synonyms: [], difficulty: 2, category: 'mammal', commonality: 5, searchTerm: 'gorilla' },
  { id: 'baboon', name: 'Baboon', synonyms: [], difficulty: 3, category: 'mammal', commonality: 3, searchTerm: 'baboon' },
  { id: 'mandrill', name: 'Mandrill', synonyms: [], difficulty: 3, category: 'mammal', commonality: 2, searchTerm: 'mandrill' },
  { id: 'macaque', name: 'Macaque', synonyms: [], difficulty: 3, category: 'mammal', commonality: 2, searchTerm: 'macaque' },

  // African animals
  { id: 'cheetah', name: 'Cheetah', synonyms: [], difficulty: 2, category: 'mammal', commonality: 5, searchTerm: 'cheetah' },
  { id: 'leopard', name: 'Leopard', synonyms: [], difficulty: 2, category: 'mammal', commonality: 4, searchTerm: 'leopard' },
  { id: 'hyena', name: 'Hyena', synonyms: [], difficulty: 2, category: 'mammal', commonality: 4, searchTerm: 'hyena' },
  { id: 'warthog', name: 'Warthog', synonyms: [], difficulty: 3, category: 'mammal', commonality: 2, searchTerm: 'warthog' },
  { id: 'wildebeest', name: 'Wildebeest', synonyms: ['gnu'], difficulty: 3, category: 'mammal', commonality: 2, searchTerm: 'wildebeest' },
  { id: 'antelope', name: 'Antelope', synonyms: [], difficulty: 2, category: 'mammal', commonality: 4, searchTerm: 'antelope' },
  { id: 'gazelle', name: 'Gazelle', synonyms: [], difficulty: 3, category: 'mammal', commonality: 3, searchTerm: 'gazelle' },
  { id: 'impala', name: 'Impala', synonyms: [], difficulty: 3, category: 'mammal', commonality: 2, searchTerm: 'impala' },

  // More birds
  { id: 'vulture', name: 'Vulture', synonyms: [], difficulty: 2, category: 'bird', commonality: 4, searchTerm: 'vulture' },
  { id: 'falcon', name: 'Falcon', synonyms: [], difficulty: 2, category: 'bird', commonality: 4, searchTerm: 'falcon' },
  { id: 'hawk', name: 'Hawk', synonyms: [], difficulty: 2, category: 'bird', commonality: 4, searchTerm: 'hawk' },
  { id: 'condor', name: 'Condor', synonyms: [], difficulty: 3, category: 'bird', commonality: 2, searchTerm: 'condor' },
  { id: 'albatross', name: 'Albatross', synonyms: [], difficulty: 3, category: 'bird', commonality: 3, searchTerm: 'albatross' },
  { id: 'puffin', name: 'Puffin', synonyms: [], difficulty: 2, category: 'bird', commonality: 4, searchTerm: 'puffin' },
  { id: 'woodpecker', name: 'Woodpecker', synonyms: [], difficulty: 2, category: 'bird', commonality: 4, searchTerm: 'woodpecker' },
  { id: 'hummingbird', name: 'Hummingbird', synonyms: [], difficulty: 2, category: 'bird', commonality: 5, searchTerm: 'hummingbird' },
  { id: 'robin', name: 'Robin', synonyms: [], difficulty: 2, category: 'bird', commonality: 5, searchTerm: 'robin bird' },
  { id: 'cardinal', name: 'Cardinal', synonyms: [], difficulty: 2, category: 'bird', commonality: 4, searchTerm: 'cardinal bird' },

  // Arctic/Cold climate animals  
  { id: 'polar bear', name: 'Polar Bear', synonyms: [], difficulty: 2, category: 'mammal', commonality: 5, searchTerm: 'polar bear' },
  { id: 'arctic fox', name: 'Arctic Fox', synonyms: [], difficulty: 3, category: 'mammal', commonality: 3, searchTerm: 'arctic fox' },
  { id: 'reindeer', name: 'Reindeer', synonyms: ['caribou'], difficulty: 2, category: 'mammal', commonality: 4, searchTerm: 'reindeer' },
  { id: 'moose', name: 'Moose', synonyms: ['elk'], difficulty: 2, category: 'mammal', commonality: 4, searchTerm: 'moose' },
  { id: 'musk ox', name: 'Musk Ox', synonyms: [], difficulty: 3, category: 'mammal', commonality: 2, searchTerm: 'musk ox' },

  // Insects and small creatures
  { id: 'ant', name: 'Ant', synonyms: [], difficulty: 1, category: 'insect', commonality: 8, searchTerm: 'ant' },
  { id: 'bee', name: 'Bee', synonyms: [], difficulty: 1, category: 'insect', commonality: 8, searchTerm: 'bee' },
  { id: 'wasp', name: 'Wasp', synonyms: [], difficulty: 2, category: 'insect', commonality: 6, searchTerm: 'wasp' },
  { id: 'beetle', name: 'Beetle', synonyms: [], difficulty: 2, category: 'insect', commonality: 5, searchTerm: 'beetle' },
  { id: 'grasshopper', name: 'Grasshopper', synonyms: [], difficulty: 2, category: 'insect', commonality: 5, searchTerm: 'grasshopper' },
  { id: 'cricket', name: 'Cricket', synonyms: [], difficulty: 2, category: 'insect', commonality: 5, searchTerm: 'cricket insect' },
  { id: 'dragonfly', name: 'Dragonfly', synonyms: [], difficulty: 2, category: 'insect', commonality: 4, searchTerm: 'dragonfly' },
  { id: 'ladybug', name: 'Ladybug', synonyms: ['ladybird'], difficulty: 2, category: 'insect', commonality: 6, searchTerm: 'ladybug' },
  { id: 'praying mantis', name: 'Praying Mantis', synonyms: ['mantis'], difficulty: 3, category: 'insect', commonality: 3, searchTerm: 'praying mantis' },
  { id: 'scorpion', name: 'Scorpion', synonyms: [], difficulty: 2, category: 'other', commonality: 4, searchTerm: 'scorpion' },

  // More farm/domestic animals
  { id: 'goat', name: 'Goat', synonyms: [], difficulty: 1, category: 'mammal', commonality: 8, searchTerm: 'goat' },
  { id: 'turkey', name: 'Turkey', synonyms: [], difficulty: 2, category: 'bird', commonality: 6, searchTerm: 'turkey bird' },
  { id: 'rooster', name: 'Rooster', synonyms: [], difficulty: 2, category: 'bird', commonality: 6, searchTerm: 'rooster' },
  { id: 'donkey', name: 'Donkey', synonyms: ['mule'], difficulty: 2, category: 'mammal', commonality: 5, searchTerm: 'donkey' },
  { id: 'mule', name: 'Mule', synonyms: [], difficulty: 2, category: 'mammal', commonality: 4, searchTerm: 'mule' },

  // More fish
  { id: 'salmon', name: 'Salmon', synonyms: [], difficulty: 2, category: 'fish', commonality: 6, searchTerm: 'salmon' },
  { id: 'tuna', name: 'Tuna', synonyms: [], difficulty: 2, category: 'fish', commonality: 6, searchTerm: 'tuna fish' },
  { id: 'trout', name: 'Trout', synonyms: [], difficulty: 2, category: 'fish', commonality: 5, searchTerm: 'trout' },
  { id: 'bass', name: 'Bass', synonyms: [], difficulty: 2, category: 'fish', commonality: 4, searchTerm: 'bass fish' },
  { id: 'catfish', name: 'Catfish', synonyms: [], difficulty: 2, category: 'fish', commonality: 4, searchTerm: 'catfish' },
  { id: 'anglerfish', name: 'Anglerfish', synonyms: [], difficulty: 3, category: 'fish', commonality: 2, searchTerm: 'anglerfish' },
  { id: 'pufferfish', name: 'Pufferfish', synonyms: [], difficulty: 3, category: 'fish', commonality: 3, searchTerm: 'pufferfish' },
  { id: 'swordfish', name: 'Swordfish', synonyms: [], difficulty: 2, category: 'fish', commonality: 4, searchTerm: 'swordfish' },

  // Unique/rare animals
  { id: 'fennec fox', name: 'Fennec Fox', synonyms: [], difficulty: 3, category: 'mammal', commonality: 2, searchTerm: 'fennec fox' },
  { id: 'sugar glider', name: 'Sugar Glider', synonyms: [], difficulty: 3, category: 'mammal', commonality: 2, searchTerm: 'sugar glider' },
  { id: 'chinchilla', name: 'Chinchilla', synonyms: [], difficulty: 3, category: 'mammal', commonality: 3, searchTerm: 'chinchilla' },
  { id: 'ferret', name: 'Ferret', synonyms: [], difficulty: 2, category: 'mammal', commonality: 4, searchTerm: 'ferret' },
  { id: 'hamster', name: 'Hamster', synonyms: [], difficulty: 2, category: 'mammal', commonality: 6, searchTerm: 'hamster' },
  { id: 'guinea pig', name: 'Guinea Pig', synonyms: [], difficulty: 2, category: 'mammal', commonality: 5, searchTerm: 'guinea pig' },
  { id: 'gerbil', name: 'Gerbil', synonyms: [], difficulty: 2, category: 'mammal', commonality: 4, searchTerm: 'gerbil' },
];

// Utility functions
export function getAllAnimals(): AnimalData[] {
  return [...CORE_ANIMALS, ...EXTENDED_ANIMALS];
}

export function getAnimalsByDifficulty(difficulty: 1 | 2 | 3): AnimalData[] {
  return getAllAnimals().filter(animal => animal.difficulty === difficulty);
}

export function getAnimalsByCategory(category: AnimalData['category']): AnimalData[] {
  return getAllAnimals().filter(animal => animal.category === category);
}

export function getCoreAnimals(): AnimalData[] {
  return CORE_ANIMALS;
}

export function getExtendedAnimals(): AnimalData[] {
  return EXTENDED_ANIMALS;
}

export function getAnimalsWithLocalAssets(): AnimalData[] {
  return getAllAnimals().filter(animal => animal.localAsset);
}

export function getAnimalsWithoutLocalAssets(): AnimalData[] {
  return getAllAnimals().filter(animal => !animal.localAsset);
}
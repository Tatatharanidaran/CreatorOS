import customBackgrounds from '../templates/customBackgrounds.json';

const DECORATIVE_ASSETS = [
  {
    id: 'balloons',
    name: 'Balloons',
    category: 'Birthday',
    src: '/story_templates/birthday/balloons.svg'
  },
  {
    id: 'confetti',
    name: 'Confetti',
    category: 'Birthday',
    src: '/story_templates/birthday/confetti.svg'
  },
  {
    id: 'cake',
    name: 'Cake',
    category: 'Birthday',
    src: '/story_templates/birthday/cake.svg'
  },
  {
    id: 'gift',
    name: 'Gift Box',
    category: 'Birthday',
    src: '/story_templates/birthday/gift.svg'
  },
  {
    id: 'party-hat',
    name: 'Party Hat',
    category: 'Birthday',
    src: '/story_templates/birthday/party_hat.svg'
  },
  {
    id: 'sparkles',
    name: 'Sparkles',
    category: 'Birthday',
    src: '/story_templates/birthday/sparkles.svg'
  }
];

const BACKGROUND_ASSETS = customBackgrounds.map((item) => ({
  id: item.id,
  name: item.name,
  category: item.category,
  src: item.src
}));

const MANUAL_ASSET_SOURCES = [
  {
    provider: 'Unsplash',
    url: 'https://unsplash.com/s/photos/birthday-background',
    searchTerms: ['birthday party background', 'birthday confetti background']
  },
  {
    provider: 'Pexels',
    url: 'https://www.pexels.com/search/birthday/',
    searchTerms: ['birthday cake celebration', 'colorful party balloons']
  },
  {
    provider: 'Pixabay',
    url: 'https://pixabay.com/images/search/birthday/',
    searchTerms: ['birthday confetti background', 'birthday party background']
  }
];

export { DECORATIVE_ASSETS, BACKGROUND_ASSETS, MANUAL_ASSET_SOURCES };

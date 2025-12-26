import { Template, TemplateConfig, TemplateCategory } from '@/types/templates';

export const templateCategories = [
  {
    id: 'classic' as TemplateCategory,
    name: 'Classic',
    description: 'Timeless and traditional designs',
  },
  {
    id: 'modern' as TemplateCategory,
    name: 'Modern',
    description: 'Clean, contemporary aesthetics',
  },
  {
    id: 'elegant' as TemplateCategory,
    name: 'Elegant',
    description: 'Sophisticated and refined',
  },
];

export const templates: Template[] = [
  // Classic Templates
  {
    id: 'classic-gallery',
    name: 'Classic Elegance',
    category: 'classic',
    description: 'Elegant scrollable design with beautiful typography and photo gallery',
    thumbnail: '/placeholder.svg',
    isPremium: false,
    isPopular: true,
    component: 'AnthonyOdileTemplate',
    sections: [
      { id: 'hero', enabled: true, order: 1, customizable: true },
      { id: 'story', enabled: true, order: 2, customizable: true },
      { id: 'gallery', enabled: true, order: 3, customizable: true },
      { id: 'countdown', enabled: true, order: 4, customizable: true },
      { id: 'location', enabled: true, order: 5, customizable: true },
      { id: 'gifts', enabled: true, order: 6, customizable: true },
      { id: 'rsvp', enabled: true, order: 7, customizable: true },
    ],
    style: {
      layout: 'single-page',
      spacing: 'spacious',
      fontPrimary: 'Dancing Script',
      fontSecondary: 'Inter',
      headingSize: 'xl',
      colorScheme: {
        primary: '#c9a6a6',
        secondary: '#e8c4c4',
        accent: '#faf8f5',
        background: '#ffffff',
        text: '#3e2723',
      },
      borderRadius: 'lg',
      shadows: 'soft',
      animations: true,
    },
  },
  
  // Wedding Templates
  {
    id: 'elegant-fullscreen',
    name: 'Classic Elegance',
    category: 'elegant',
    description: 'Scrollable elegant design with beautiful typography and static image gallery',
    thumbnail: '/placeholder.svg',
    isPremium: false,
    isPopular: true,
    component: 'AnthonyOdileTemplate',
    sections: [
      { id: 'hero', enabled: true, order: 1, customizable: true },
      { id: 'story', enabled: true, order: 2, customizable: true },
      { id: 'gallery', enabled: true, order: 3, customizable: true },
      { id: 'countdown', enabled: true, order: 4, customizable: true },
      { id: 'location', enabled: true, order: 5, customizable: true },
      { id: 'gifts', enabled: true, order: 6, customizable: true },
      { id: 'rsvp', enabled: true, order: 7, customizable: true },
    ],
    style: {
      layout: 'single-page',
      spacing: 'spacious',
      fontPrimary: 'Dancing Script',
      fontSecondary: 'Inter',
      headingSize: 'xl',
      colorScheme: {
        primary: '#c9a6a6',
        secondary: '#e8c4c4',
        accent: '#faf8f5',
        background: '#ffffff',
        text: '#3e2723',
      },
      borderRadius: 'lg',
      shadows: 'soft',
      animations: true,
    },
  },
  {
    id: 'modern-wedding',
    name: 'Modern Template',
    category: 'modern',
    description: 'Contemporary design with bold typography, fixed background, and clean layouts',
    thumbnail: '/placeholder.svg',
    isPremium: false,
    isPopular: true,
    component: 'ModernTemplate',
    sections: [
      { id: 'hero', enabled: true, order: 1, customizable: true },
      { id: 'story', enabled: true, order: 2, customizable: true },
      { id: 'gallery', enabled: true, order: 3, customizable: true },
      { id: 'countdown', enabled: true, order: 4, customizable: true },
      { id: 'location', enabled: true, order: 5, customizable: true },
      { id: 'gifts', enabled: true, order: 6, customizable: true },
      { id: 'rsvp', enabled: true, order: 7, customizable: true },
    ],
    style: {
      layout: 'single-page',
      spacing: 'spacious',
      fontPrimary: 'Dancing Script',
      fontSecondary: 'Inter',
      headingSize: 'xl',
      colorScheme: {
        primary: '#c9a6a6',
        secondary: '#e8c4c4',
        accent: '#faf8f5',
        background: '#ffffff',
        text: '#3e2723',
      },
      borderRadius: 'lg',
      shadows: 'soft',
      animations: true,
    },
  },
  {
    id: 'video-cinematic',
    name: 'Cinematic Video',
    category: 'modern',
    description: 'Immersive video background with scrollable content sections - no gallery needed',
    thumbnail: '/placeholder.svg',
    isPremium: true,
    isPopular: false,
    component: 'VideoBackgroundTemplate',
    sections: [
      { id: 'hero', enabled: true, order: 1, customizable: true },
      { id: 'story', enabled: true, order: 2, customizable: true },
      { id: 'countdown', enabled: true, order: 3, customizable: true },
      { id: 'location', enabled: true, order: 4, customizable: true },
      { id: 'gifts', enabled: true, order: 5, customizable: true },
      { id: 'rsvp', enabled: true, order: 6, customizable: true },
    ],
    style: {
      layout: 'single-page',
      spacing: 'spacious',
      fontPrimary: 'Dancing Script',
      fontSecondary: 'Inter',
      headingSize: 'xl',
      colorScheme: {
        primary: '#ffffff',
        secondary: '#f0f0f0',
        accent: '#ffffff',
        background: 'transparent',
        text: '#ffffff',
      },
      borderRadius: 'lg',
      shadows: 'medium',
      animations: true,
    },
  },
  
  // Bachelor Party Templates
  {
    id: 'bachelor-leafy',
    name: 'Bachelor Leafy',
    category: 'modern',
    description: 'Fun bachelor party invitation with botanical design',
    thumbnail: '/placeholder.svg',
    isPremium: false,
    isPopular: true,
    component: 'BachelorLeafyTemplate',
    sections: [
      { id: 'hero', enabled: true, order: 1, customizable: true },
      { id: 'countdown', enabled: true, order: 2, customizable: true },
      { id: 'location', enabled: true, order: 3, customizable: true },
      { id: 'gifts', enabled: true, order: 4, customizable: true },
    ],
    style: {
      layout: 'single-page',
      spacing: 'comfortable',
      fontPrimary: 'Inter',
      fontSecondary: 'Dancing Script',
      headingSize: 'xl',
      colorScheme: {
        primary: '#8B7355',
        secondary: '#C4B5A0',
        accent: '#f5f1e8',
        background: '#ffffff',
        text: '#2C2C2C',
      },
      borderRadius: 'lg',
      shadows: 'medium',
      animations: true,
    },
  },
  {
    id: 'christmas-dinner',
    name: 'Christmas Dinner',
    category: 'classic',
    description: 'Elegant Christmas dinner invitation with festive decorations',
    thumbnail: '/placeholder.svg',
    isPremium: false,
    isPopular: false,
    component: 'ChristmasTemplate',
    sections: [
      { id: 'hero', enabled: true, order: 1, customizable: true },
      { id: 'details', enabled: true, order: 2, customizable: true },
      { id: 'location', enabled: true, order: 3, customizable: true },
    ],
    style: {
      layout: 'single-page',
      spacing: 'comfortable',
      fontPrimary: 'Georgia',
      fontSecondary: 'Inter',
      headingSize: 'large',
      colorScheme: {
        primary: '#8a623a',
        secondary: '#8a7646',
        accent: '#d8c997',
        background: '#f7f7f7',
        text: '#444',
      },
      borderRadius: 'lg',
      shadows: 'soft',
      animations: false,
    },
  },
  {
    id: 'rose-gold-tabs',
    name: 'Rose Gold Tabs',
    category: 'elegant',
    description: 'Fullscreen video background with swappable pages and elegant transitions',
    thumbnail: '/placeholder.svg',
    isPremium: false,
    isPopular: true,
    component: 'ElegantTabsTemplate',
    sections: [
      { id: 'hero', enabled: true, order: 1, customizable: true },
      { id: 'details', enabled: true, order: 2, customizable: true },
      { id: 'location', enabled: true, order: 3, customizable: true },
      { id: 'rsvp', enabled: true, order: 4, customizable: true },
    ],
    style: {
      layout: 'single-page',
      spacing: 'comfortable',
      fontPrimary: 'Inter',
      fontSecondary: 'Inter',
      headingSize: 'large',
      colorScheme: {
        primary: '#fb7185',
        secondary: '#fbbf24',
        accent: '#fdf7f2',
        background: '#ffffff',
        text: '#475569',
      },
      borderRadius: 'lg',
      shadows: 'soft',
      animations: true,
    },
  },
];

export const templateConfig: TemplateConfig = {
  templates,
  categories: templateCategories,
};

// Helper functions
export const getTemplateById = (id: string): Template | undefined => {
  return templates.find(t => t.id === id);
};

export const getTemplatesByCategory = (category: TemplateCategory): Template[] => {
  return templates.filter(t => t.category === category);
};

export const getPopularTemplates = (): Template[] => {
  return templates.filter(t => t.isPopular);
};

export const getFreeTemplates = (): Template[] => {
  return templates.filter(t => !t.isPremium);
};

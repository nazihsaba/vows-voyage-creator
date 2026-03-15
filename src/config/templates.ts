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
  {
    id: 'minimalist' as TemplateCategory,
    name: 'Minimalist',
    description: 'Simple and understated',
  },
  {
    id: 'romantic' as TemplateCategory,
    name: 'Romantic',
    description: 'Soft and dreamy designs',
  },
  {
    id: 'rustic' as TemplateCategory,
    name: 'Rustic',
    description: 'Natural and organic feel',
  },
];

export const templates: Template[] = [
  // Classic Templates
  {
    id: 'classic-cover',
    name: 'Classic Cover',
    category: 'classic',
    description: 'Traditional single-page design with elegant serif typography',
    thumbnail: '/placeholder.svg',
    isPremium: false,
    isPopular: true,
    component: 'ClassicCoverTemplate',
    sections: [
      { id: 'hero', enabled: true, order: 1, customizable: true },
      { id: 'countdown', enabled: true, order: 2, customizable: true },
      { id: 'details', enabled: true, order: 3, customizable: true },
      { id: 'location', enabled: true, order: 4, customizable: true },
      { id: 'gifts', enabled: true, order: 5, customizable: true },
    ],
    style: {
      layout: 'single-page',
      spacing: 'comfortable',
      fontPrimary: 'Playfair Display',
      fontSecondary: 'Inter',
      headingSize: 'large',
      colorScheme: {
        primary: '#8B7355',
        secondary: '#D4AF37',
        accent: '#F5E6D3',
        background: '#FFFFFF',
        text: '#2C2C2C',
      },
      borderRadius: 'md',
      shadows: 'soft',
      animations: true,
    },
  },
  
  // Modern Templates
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    category: 'modern',
    description: 'Clean lines with bold typography and ample white space',
    thumbnail: '/placeholder.svg',
    isPremium: false,
    isPopular: true,
    component: 'ModernMinimalTemplate',
    sections: [
      { id: 'hero', enabled: true, order: 1, customizable: true },
      { id: 'countdown', enabled: true, order: 2, customizable: true },
      { id: 'details', enabled: true, order: 3, customizable: true },
      { id: 'location', enabled: true, order: 4, customizable: true },
    ],
    style: {
      layout: 'single-page',
      spacing: 'spacious',
      fontPrimary: 'Inter',
      fontSecondary: 'Inter',
      headingSize: 'xl',
      colorScheme: {
        primary: '#000000',
        secondary: '#666666',
        accent: '#F0F0F0',
        background: '#FFFFFF',
        text: '#1A1A1A',
      },
      borderRadius: 'none',
      shadows: 'none',
      animations: true,
    },
  },
  {
    id: 'modern-split',
    name: 'Modern Split',
    category: 'modern',
    description: 'Dynamic split-screen layout with parallax effects',
    thumbnail: '/placeholder.svg',
    isPremium: true,
    isPopular: false,
    component: 'ModernSplitTemplate',
    sections: [
      { id: 'hero', enabled: true, order: 1, customizable: true },
      { id: 'story', enabled: true, order: 2, customizable: true },
      { id: 'countdown', enabled: true, order: 3, customizable: true },
      { id: 'gallery', enabled: true, order: 4, customizable: true },
      { id: 'details', enabled: true, order: 5, customizable: true },
      { id: 'location', enabled: true, order: 6, customizable: true },
      { id: 'gifts', enabled: true, order: 7, customizable: true },
    ],
    style: {
      layout: 'parallax',
      spacing: 'spacious',
      fontPrimary: 'Inter',
      fontSecondary: 'Inter',
      headingSize: 'xl',
      colorScheme: {
        primary: '#2C3E50',
        secondary: '#3498DB',
        accent: '#ECF0F1',
        background: '#FFFFFF',
        text: '#1A1A1A',
      },
      borderRadius: 'lg',
      shadows: 'medium',
      animations: true,
    },
  },
  
  // Elegant Templates
  {
    id: 'elegant-classic',
    name: 'Elegant Classic',
    category: 'elegant',
    description: 'Refined design with luxurious gold accents',
    thumbnail: '/placeholder.svg',
    isPremium: true,
    isPopular: true,
    component: 'ElegantClassicTemplate',
    sections: [
      { id: 'hero', enabled: true, order: 1, customizable: true },
      { id: 'story', enabled: true, order: 2, customizable: true },
      { id: 'countdown', enabled: true, order: 3, customizable: true },
      { id: 'details', enabled: true, order: 4, customizable: true },
      { id: 'location', enabled: true, order: 5, customizable: true },
      { id: 'gallery', enabled: true, order: 6, customizable: true },
      { id: 'gifts', enabled: true, order: 7, customizable: true },
    ],
    style: {
      layout: 'single-page',
      spacing: 'comfortable',
      fontPrimary: 'Cormorant Garamond',
      fontSecondary: 'Inter',
      headingSize: 'xl',
      colorScheme: {
        primary: '#1A1A1A',
        secondary: '#D4AF37',
        accent: '#F8F5F1',
        background: '#FFFFFF',
        text: '#2C2C2C',
      },
      borderRadius: 'sm',
      shadows: 'soft',
      animations: true,
    },
  },
  
  // Minimalist Templates
  {
    id: 'minimalist-pure',
    name: 'Minimalist Pure',
    category: 'minimalist',
    description: 'Ultra-clean design with focus on content',
    thumbnail: '/placeholder.svg',
    isPremium: false,
    isPopular: false,
    component: 'MinimalistPureTemplate',
    sections: [
      { id: 'hero', enabled: true, order: 1, customizable: true },
      { id: 'details', enabled: true, order: 2, customizable: true },
      { id: 'location', enabled: true, order: 3, customizable: true },
    ],
    style: {
      layout: 'single-page',
      spacing: 'spacious',
      fontPrimary: 'Inter',
      fontSecondary: 'Inter',
      headingSize: 'medium',
      colorScheme: {
        primary: '#000000',
        secondary: '#888888',
        accent: '#F9F9F9',
        background: '#FFFFFF',
        text: '#333333',
      },
      borderRadius: 'none',
      shadows: 'none',
      animations: false,
    },
  },
  
  // Romantic Templates
  {
    id: 'romantic-floral',
    name: 'Romantic Floral',
    category: 'romantic',
    description: 'Soft colors with delicate floral accents',
    thumbnail: '/placeholder.svg',
    isPremium: true,
    isPopular: true,
    component: 'RomanticFloralTemplate',
    sections: [
      { id: 'hero', enabled: true, order: 1, customizable: true },
      { id: 'story', enabled: true, order: 2, customizable: true },
      { id: 'countdown', enabled: true, order: 3, customizable: true },
      { id: 'gallery', enabled: true, order: 4, customizable: true },
      { id: 'details', enabled: true, order: 5, customizable: true },
      { id: 'location', enabled: true, order: 6, customizable: true },
      { id: 'gifts', enabled: true, order: 7, customizable: true },
    ],
    style: {
      layout: 'single-page',
      spacing: 'comfortable',
      fontPrimary: 'Great Vibes',
      fontSecondary: 'Inter',
      headingSize: 'large',
      colorScheme: {
        primary: '#C9A6A6',
        secondary: '#E8C4C4',
        accent: '#FFF5F5',
        background: '#FFFFFF',
        text: '#5A5A5A',
      },
      borderRadius: 'lg',
      shadows: 'soft',
      animations: true,
    },
  },
  
  // Rustic Templates
  {
    id: 'rustic-barn',
    name: 'Rustic Barn',
    category: 'rustic',
    description: 'Natural wood textures with organic elements',
    thumbnail: '/placeholder.svg',
    isPremium: false,
    isPopular: false,
    component: 'RusticBarnTemplate',
    sections: [
      { id: 'hero', enabled: true, order: 1, customizable: true },
      { id: 'countdown', enabled: true, order: 2, customizable: true },
      { id: 'gallery', enabled: true, order: 3, customizable: true },
      { id: 'details', enabled: true, order: 4, customizable: true },
      { id: 'location', enabled: true, order: 5, customizable: true },
      { id: 'gifts', enabled: true, order: 6, customizable: true },
    ],
    style: {
      layout: 'single-page',
      spacing: 'comfortable',
      fontPrimary: 'Dancing Script',
      fontSecondary: 'Inter',
      headingSize: 'large',
      colorScheme: {
        primary: '#6B4423',
        secondary: '#A0826D',
        accent: '#F5E6D3',
        background: '#FAF8F5',
        text: '#3E2723',
      },
      borderRadius: 'sm',
      shadows: 'soft',
      animations: true,
    },
  },
  
  // Wedding Templates
  {
    id: 'modern-wedding',
    name: 'Modern Template',
    category: 'modern',
    description: 'Contemporary design with bold typography, fixed background, and clean layouts',
    thumbnail: '/placeholder.svg',
    isPremium: false,
    isPopular: true,
    component: 'VeriteTemplate',
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
    component: 'GraceTemplate',
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
    id: 'classic-romance',
    name: 'Classic Romance',
    category: 'romantic',
    description: 'Elegant scrollable design with photo gallery, countdown, and RSVP sections',
    thumbnail: '/placeholder.svg',
    isPremium: false,
    isPopular: true,
    component: 'EclatTemplate',
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
    id: 'bible-verse-tabs',
    name: 'Bible Verse Tabs',
    category: 'elegant',
    description: 'Elegant tab-based design with Bible verse quote, family names, and botanical decorations',
    thumbnail: '/placeholder.svg',
    isPremium: false,
    isPopular: true,
    component: 'AuraTemplate',
    sections: [
      { id: 'hero', enabled: true, order: 1, customizable: true },
      { id: 'countdown', enabled: true, order: 2, customizable: true },
      { id: 'location', enabled: true, order: 3, customizable: true },
      { id: 'gifts', enabled: true, order: 4, customizable: true },
      { id: 'rsvp', enabled: true, order: 5, customizable: true },
    ],
    style: {
      layout: 'tabs',
      spacing: 'comfortable',
      fontPrimary: 'Dancing Script',
      fontSecondary: 'Inter',
      headingSize: 'xl',
      colorScheme: {
        primary: '#7a4c4c',
        secondary: '#c4a35a',
        accent: '#faf8f5',
        background: '#ffffff',
        text: '#374151',
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

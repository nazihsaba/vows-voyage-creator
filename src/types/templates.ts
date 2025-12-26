export type TemplateCategory = 'classic' | 'modern' | 'elegant' | 'minimalist' | 'romantic' | 'rustic';

export type TemplateSection = 
  | 'hero'
  | 'story'
  | 'countdown'
  | 'details'
  | 'location'
  | 'gallery'
  | 'gifts'
  | 'rsvp';

export interface TemplateStyle {
  // Layout
  layout: 'single-page' | 'multi-page' | 'parallax';
  spacing: 'compact' | 'comfortable' | 'spacious';
  
  // Typography
  fontPrimary: string;
  fontSecondary: string;
  headingSize: 'small' | 'medium' | 'large' | 'xl';
  
  // Colors
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  
  // Visual Elements
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  shadows: 'none' | 'soft' | 'medium' | 'hard';
  animations: boolean;
}

export interface TemplateSectionConfig {
  id: TemplateSection;
  enabled: boolean;
  order: number;
  customizable: boolean;
  style?: Partial<TemplateStyle>;
}

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  thumbnail: string;
  previewImage?: string;
  
  // Features
  isPremium: boolean;
  isPopular: boolean;
  
  // Configuration
  sections: TemplateSectionConfig[];
  style: TemplateStyle;
  
  // Component reference
  component: string;
}

export interface TemplateConfig {
  templates: Template[];
  categories: {
    id: TemplateCategory;
    name: string;
    description: string;
  }[];
}

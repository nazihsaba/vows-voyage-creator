# Template System Documentation

## Overview

This application uses a comprehensive template system that allows users to choose from various pre-designed invitation templates. Each template has its own style, layout, and configurable sections.

## Template Structure

### Template Categories
- **Classic**: Timeless and traditional designs
- **Modern**: Clean, contemporary aesthetics
- **Elegant**: Sophisticated and refined
- **Minimalist**: Simple and understated
- **Romantic**: Soft and dreamy designs
- **Rustic**: Natural and organic feel

### Available Templates

#### Classic Templates
1. **Classic Cover** (classic-cover)
   - Traditional single-page design with elegant serif typography
   - Sections: Hero, Countdown, Details, Location, Gifts
   - Free template, Popular

2. **Classic Gallery** (classic-gallery)
   - Traditional design with photo gallery showcase
   - Sections: Hero, Story, Countdown, Gallery, Details, Location, Gifts
   - Free template, Popular

#### Modern Templates
3. **Modern Minimal** (modern-minimal)
   - Clean lines with bold typography and ample white space
   - Sections: Hero, Countdown, Details, Location
   - Free template, Popular

4. **Modern Split** (modern-split)
   - Dynamic split-screen layout with parallax effects
   - Sections: Hero, Story, Countdown, Gallery, Details, Location, Gifts
   - Premium template

#### Elegant Templates
5. **Elegant Classic** (elegant-classic)
   - Refined design with luxurious gold accents
   - Sections: Hero, Story, Countdown, Details, Location, Gallery, Gifts
   - Premium template, Popular

#### Minimalist Templates
6. **Minimalist Pure** (minimalist-pure)
   - Ultra-clean design with focus on content
   - Sections: Hero, Details, Location
   - Free template

#### Romantic Templates
7. **Romantic Floral** (romantic-floral)
   - Soft colors with delicate floral accents
   - Sections: Hero, Story, Countdown, Gallery, Details, Location, Gifts
   - Premium template, Popular

#### Rustic Templates
8. **Rustic Barn** (rustic-barn)
   - Natural wood textures with organic elements
   - Sections: Hero, Countdown, Gallery, Details, Location, Gifts
   - Free template

## Template Configuration

Each template includes:

### Style Configuration
```typescript
{
  layout: 'single-page' | 'multi-page' | 'parallax',
  spacing: 'compact' | 'comfortable' | 'spacious',
  fontPrimary: string,      // Main heading font
  fontSecondary: string,    // Body text font
  headingSize: 'small' | 'medium' | 'large' | 'xl',
  colorScheme: {
    primary: string,        // Main brand color
    secondary: string,      // Accent color
    accent: string,         // Background highlights
    background: string,     // Main background
    text: string,          // Body text color
  },
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full',
  shadows: 'none' | 'soft' | 'medium' | 'hard',
  animations: boolean
}
```

### Section Types
- **hero**: Main cover section with names and date
- **story**: Couple's story or description
- **countdown**: Countdown timer to wedding date
- **details**: Event details and information
- **location**: Ceremony and venue locations
- **gallery**: Photo gallery showcase
- **gifts**: Gift card information
- **rsvp**: RSVP form (coming soon)

## Using Templates

### In Code

```typescript
import { getTemplateById, getTemplatesByCategory } from '@/config/templates';
import { useTemplate } from '@/hooks/useTemplate';

// Get a specific template
const template = getTemplateById('classic-cover');

// Get templates by category
const modernTemplates = getTemplatesByCategory('modern');

// Use in a component
function MyComponent({ templateId }) {
  const template = useTemplate(templateId);
  
  if (!template) return null;
  
  return <div>Using {template.name}</div>;
}
```

### Backward Compatibility

The system maintains backward compatibility with the old template IDs:
- `template1` → `classic-cover`
- `template2` → `classic-gallery`
- `template3` → `modern-split`

This mapping is handled automatically by the `templateMapping` utility.

## Adding New Templates

To add a new template:

1. Add template configuration to `src/config/templates.ts`:

```typescript
{
  id: 'my-new-template',
  name: 'My New Template',
  category: 'modern',
  description: 'Description of the template',
  thumbnail: '/path/to/thumbnail.jpg',
  isPremium: false,
  isPopular: false,
  component: 'MyNewTemplate',
  sections: [
    { id: 'hero', enabled: true, order: 1, customizable: true },
    // ... more sections
  ],
  style: {
    // ... style configuration
  }
}
```

2. The template will automatically appear in the template selection interface.

3. Customize the rendering in `TemplateRenderer` component if needed.

## Font Families Available

The following Google Fonts are pre-loaded:
- Dancing Script
- Playfair Display
- Cormorant Garamond
- Great Vibes
- Cinzel
- Inter

## Color Schemes

Templates use HSL color values for easy customization and theming. All colors are semantic and can be adjusted per template.

## Future Enhancements

- Custom template creator
- Template marketplace
- User-uploaded templates
- Template versioning
- A/B testing for templates
- Template analytics

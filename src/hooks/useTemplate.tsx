import { useMemo } from 'react';
import { getTemplateById } from '@/config/templates';
import { Template } from '@/types/templates';
import { normalizeTemplateId } from '@/utils/templateMapping';

/**
 * Hook to get template configuration
 */
export const useTemplate = (templateId: string | null | undefined): Template | undefined => {
  const normalizedId = useMemo(() => normalizeTemplateId(templateId), [templateId]);
  
  return useMemo(() => {
    return getTemplateById(normalizedId);
  }, [normalizedId]);
};

/**
 * Hook to get template style with fallback to defaults
 */
export const useTemplateStyle = (templateId: string | null | undefined) => {
  const template = useTemplate(templateId);
  
  return useMemo(() => {
    if (!template) {
      // Default style fallback
      return {
        fontPrimary: 'Playfair Display',
        fontSecondary: 'Inter',
        colorScheme: {
          primary: '#8B7355',
          secondary: '#D4AF37',
          accent: '#F5E6D3',
          background: '#FFFFFF',
          text: '#2C2C2C',
        },
      };
    }
    
    return template.style;
  }, [template]);
};

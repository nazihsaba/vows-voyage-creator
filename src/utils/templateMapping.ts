// Maps old template IDs to new template IDs for backward compatibility
export const templateMapping: Record<string, string> = {
  'template3': 'romantic-fullscreen',
  'template4': 'elegant-fullscreen',
  'template5': 'modern-wedding',
};

// Reverse mapping for saving to database
export const reverseTemplateMapping: Record<string, string> = {
  'classic-cover': 'template1',
  'classic-gallery': 'template2',
  'romantic-fullscreen': 'template3',
  'elegant-fullscreen': 'template4',
  'modern-wedding': 'template5',
};

/**
 * Converts old template ID to new template ID
 */
export const getNewTemplateId = (oldId: string): string => {
  return templateMapping[oldId] || oldId;
};

/**
 * Converts new template ID to old template ID for database storage
 * This ensures backward compatibility with existing database records
 */
export const getOldTemplateId = (newId: string): string => {
  return reverseTemplateMapping[newId] || newId;
};

/**
 * Checks if a template ID is a legacy ID
 */
export const isLegacyTemplateId = (id: string): boolean => {
  return id in templateMapping;
};

/**
 * Normalizes template ID to new format for use in components
 */
export const normalizeTemplateId = (id: string | null | undefined): string => {
  if (!id) return 'classic-cover';
  return getNewTemplateId(id);
};

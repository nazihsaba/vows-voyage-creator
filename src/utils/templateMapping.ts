// Maps old template IDs to new template IDs for backward compatibility
export const templateMapping: Record<string, string> = {
  'template1': 'classic-cover',
  'template2': 'classic-gallery',
  'template3': 'modern-split',
};

// Reverse mapping for saving to database
export const reverseTemplateMapping: Record<string, string> = {
  'classic-cover': 'template1',
  'classic-gallery': 'template2',
  'modern-split': 'template3',
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

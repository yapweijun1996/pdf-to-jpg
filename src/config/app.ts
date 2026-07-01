import type { ConversionOptions, QualityPreset } from '@/types/conversion';

export const APP_CONFIG = {
  NAME: 'PDF2JPG Pro',
  MAX_FILE_SIZE_MB: 50,
  MAX_FILE_SIZE_BYTES: 50 * 1024 * 1024,
  ACCEPTED_FILE_TYPE: 'application/pdf',
  DEFAULT_OUTPUT_BASE_NAME: '',
};

export const QUALITY_PRESETS: QualityPreset[] = [
  {
    id: 'compact',
    label: 'Compact',
    description: 'Smaller JPG files for sharing.',
    scale: 1,
    jpegQuality: 0.72,
    dpi: 96,
  },
  {
    id: 'standard',
    label: 'Standard',
    description: 'Balanced quality and file size.',
    scale: 1.5,
    jpegQuality: 0.85,
    dpi: 144,
  },
  {
    id: 'high',
    label: 'High',
    description: 'Sharper output for print or archiving.',
    scale: 2,
    jpegQuality: 0.92,
    dpi: 192,
  },
];

export const DEFAULT_CONVERSION_OPTIONS: ConversionOptions = {
  pageMode: 'all',
  startPage: 1,
  endPage: 1,
  qualityPresetId: 'standard',
  outputBaseName: APP_CONFIG.DEFAULT_OUTPUT_BASE_NAME,
};

import { APP_CONFIG } from '@/config/app';

export interface FileValidationResult {
  acceptedFiles: File[];
  error: string | null;
}

export const isPdfFile = (file: File) => {
  return file.type === APP_CONFIG.ACCEPTED_FILE_TYPE || file.name.toLowerCase().endsWith('.pdf');
};

export const validatePdfFiles = (files: File[]): FileValidationResult => {
  if (files.length === 0) {
    return { acceptedFiles: [], error: 'Please choose at least one PDF file.' };
  }

  const invalidType = files.find((file) => !isPdfFile(file));
  if (invalidType) {
    return { acceptedFiles: [], error: `"${invalidType.name}" is not a PDF file.` };
  }

  const oversized = files.find((file) => file.size > APP_CONFIG.MAX_FILE_SIZE_BYTES);
  if (oversized) {
    return {
      acceptedFiles: [],
      error: `"${oversized.name}" is too large. Max ${APP_CONFIG.MAX_FILE_SIZE_MB}MB per PDF.`,
    };
  }

  return { acceptedFiles: files, error: null };
};

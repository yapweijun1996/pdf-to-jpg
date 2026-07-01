export interface ConvertedImage {
  id: string;
  pageNumber: number;
  url: string; // Blob URL for display
  blob: Blob;  // Actual data for zip/download
  width: number;
  height: number;
}

export type QualityPresetId = 'compact' | 'standard' | 'high';

export interface QualityPreset {
  id: QualityPresetId;
  label: string;
  description: string;
  scale: number;
  jpegQuality: number;
  dpi: number;
}

export interface ConversionOptions {
  pageMode: 'all' | 'range';
  startPage: number;
  endPage: number;
  qualityPresetId: QualityPresetId;
  outputBaseName: string;
}

export enum DocumentStatus {
  PENDING = 'PENDING',
  READING = 'READING',
  CONVERTING = 'CONVERTING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
  CANCELLED = 'CANCELLED',
}

export interface ConvertedDocument {
  id: string;
  fileName: string;
  outputBaseName: string;
  status: DocumentStatus;
  error: string | null;
  images: ConvertedImage[];
  totalPageCount: number;
  selectedPageCount: number;
}

export enum ConversionStatus {
  IDLE = 'IDLE',
  READING = 'READING',
  CONVERTING = 'CONVERTING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
  CANCELLED = 'CANCELLED',
}

export interface ConversionState {
  status: ConversionStatus;
  progress: number; // 0 to 100
  totalPageCount: number;
  currentPage: number;
  currentFileIndex: number;
  totalFileCount: number;
  activeFileName: string | null;
  error: string | null;
  documents: ConvertedDocument[];
  options: ConversionOptions | null;
}

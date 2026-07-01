export interface ConvertedImage {
  id: string;
  pageNumber: number;
  url: string; // Blob URL for display
  blob: Blob;  // Actual data for zip/download
  width: number;
  height: number;
}

export enum ConversionStatus {
  IDLE = 'IDLE',
  READING = 'READING',
  CONVERTING = 'CONVERTING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
}

export interface ConversionState {
  status: ConversionStatus;
  progress: number; // 0 to 100
  totalPageCount: number;
  currentPage: number;
  error: string | null;
  images: ConvertedImage[];
  fileName: string | null;
}

import { useState, useCallback, useRef } from 'react';
import { ConversionState, ConversionStatus, ConvertedImage } from '../types';
import { initPdfJs, readFileAsArrayBuffer, renderPageToBlob } from '../utils/pdfUtils';
import { APP_CONFIG } from '../utils/constants';

const INITIAL_STATE: ConversionState = {
  status: ConversionStatus.IDLE,
  progress: 0,
  totalPageCount: 0,
  currentPage: 0,
  error: null,
  images: [],
  fileName: null,
};

export const usePdfConverter = () => {
  const [state, setState] = useState<ConversionState>(INITIAL_STATE);
  const abortControllerRef = useRef<AbortController | null>(null);

  const reset = useCallback(() => {
    // Revoke old URLs to avoid memory leaks
    state.images.forEach(img => URL.revokeObjectURL(img.url));
    setState(INITIAL_STATE);
  }, [state.images]);

  const processFile = useCallback(async (file: File) => {
    reset();
    setState(prev => ({ ...prev, status: ConversionStatus.READING, fileName: file.name }));
    
    abortControllerRef.current = new AbortController();

    try {
      const pdfjsLib = await initPdfJs();
      const arrayBuffer = await readFileAsArrayBuffer(file);
      
      const loadingTask = pdfjsLib.getDocument({
        data: arrayBuffer,
        cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
        cMapPacked: true,
      });

      const pdfDoc = await loadingTask.promise;
      const totalPageCount = pdfDoc.numPages;

      setState(prev => ({
        ...prev,
        status: ConversionStatus.CONVERTING,
        totalPageCount,
        progress: 0
      }));

      const newImages: ConvertedImage[] = [];

      // Process pages sequentially to avoid freezing the browser on low-end devices
      for (let i = 1; i <= totalPageCount; i++) {
        // Check for cancellation
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error('Conversion cancelled');
        }

        const image = await renderPageToBlob(pdfDoc, i, APP_CONFIG.PDF_RENDER_SCALE);
        newImages.push(image);

        setState(prev => ({
          ...prev,
          currentPage: i,
          progress: Math.round((i / totalPageCount) * 100),
          images: [...newImages] // Update UI progressively
        }));

        // Small delay to let the UI breathe
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      setState(prev => ({ ...prev, status: ConversionStatus.COMPLETED }));

    } catch (err: any) {
      console.error(err);
      setState(prev => ({
        ...prev,
        status: ConversionStatus.ERROR,
        error: err.message || 'Failed to process PDF'
      }));
    }
  }, [reset]);

  return {
    state,
    processFile,
    reset
  };
};

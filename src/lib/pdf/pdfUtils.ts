import { ConvertedImage } from '@/types/conversion';
import { APP_CONFIG } from '@/config/app';
import type * as PdfJsModule from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Minimal type definitions for PDF.js to avoid 'any'
interface PDFViewport {
  width: number;
  height: number;
}

interface PDFRenderContext {
  canvasContext: CanvasRenderingContext2D;
  viewport: PDFViewport;
}

interface PDFPageProxy {
  getViewport(params: { scale: number }): PDFViewport;
  render(params: PDFRenderContext): { promise: Promise<void> };
}

interface PDFDocumentProxy {
  numPages: number;
  getPage(pageNumber: number): Promise<PDFPageProxy>;
}

interface PDFJSGlobal {
  GlobalWorkerOptions: {
    workerSrc: string;
  };
  getDocument(src: string | Uint8Array | { data: ArrayBuffer; cMapUrl: string; cMapPacked: boolean }): { promise: Promise<PDFDocumentProxy> };
}

let pdfJsModule: typeof PdfJsModule | null = null;

export const initPdfJs = async (): Promise<PDFJSGlobal> => {
  if (!pdfJsModule) {
    pdfJsModule = await import('pdfjs-dist');
  }

  const localPdfJs = pdfJsModule as unknown as PDFJSGlobal;
  localPdfJs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  return localPdfJs;
};

export const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const renderPageToBlob = async (
  pdfDoc: PDFDocumentProxy, 
  pageNumber: number, 
  scale: number = 2.0 // High quality
): Promise<ConvertedImage> => {
  const page = await pdfDoc.getPage(pageNumber);
  
  // Create a viewport
  const viewport = page.getViewport({ scale });
  
  // Prepare canvas using PDF page dimensions
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  if (!context) throw new Error('Canvas context not available');

  // Render PDF page into canvas context
  const renderContext: PDFRenderContext = {
    canvasContext: context,
    viewport: viewport,
  };
  
  await page.render(renderContext).promise;

  // Convert canvas to blob
  return new Promise<ConvertedImage>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas to Blob failed'));
        return;
      }
      const url = URL.createObjectURL(blob);
      resolve({
        id: crypto.randomUUID(),
        pageNumber,
        url,
        blob,
        width: viewport.width,
        height: viewport.height
      });
    }, 'image/jpeg', APP_CONFIG.JPEG_QUALITY);
  });
};

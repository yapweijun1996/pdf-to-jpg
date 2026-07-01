import { ConvertedImage } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Constants for PDF.js CDN
const PDFJS_VERSION = '3.11.174';
const PDFJS_CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`;
const PDFJS_WORKER_CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;

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

let isPdfJsLoaded = false;

// Helper to load script dynamically
const loadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.head.appendChild(script);
  });
};

export const initPdfJs = async (): Promise<PDFJSGlobal> => {
  if (isPdfJsLoaded && (window as any).pdfjsLib) {
    return (window as any).pdfjsLib;
  }

  await loadScript(PDFJS_CDN);
  const pdfjsLib = (window as any).pdfjsLib;
  
  if (!pdfjsLib) {
    throw new Error('PDF.js library failed to load');
  }

  pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN;
  isPdfJsLoaded = true;
  return pdfjsLib;
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
        id: uuidv4(),
        pageNumber,
        url,
        blob,
        width: viewport.width,
        height: viewport.height
      });
    }, 'image/jpeg', 0.85); // 0.85 quality
  });
};

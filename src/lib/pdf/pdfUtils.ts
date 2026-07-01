import { ConvertedImage } from '@/types/conversion';
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

interface PDFRenderTask {
  promise: Promise<void>;
  cancel?: () => void;
}

interface PDFPageProxy {
  getViewport(params: { scale: number }): PDFViewport;
  render(params: PDFRenderContext): PDFRenderTask;
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

export const readFileAsArrayBuffer = (file: File, signal: AbortSignal): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const abortRead = () => {
      reader.abort();
      reject(new Error('Conversion cancelled'));
    };

    if (signal.aborted) {
      reject(new Error('Conversion cancelled'));
      return;
    }

    signal.addEventListener('abort', abortRead, { once: true });
    reader.onload = () => {
      signal.removeEventListener('abort', abortRead);
      resolve(reader.result as ArrayBuffer);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

export const renderPageToBlob = async (
  pdfDoc: PDFDocumentProxy, 
  pageNumber: number, 
  scale: number,
  jpegQuality: number,
  signal: AbortSignal
): Promise<ConvertedImage> => {
  if (signal.aborted) throw new Error('Conversion cancelled');

  const page = await pdfDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.height = viewport.height;
  canvas.width = viewport.width;

  if (!context) throw new Error('Canvas context not available');

  const renderContext: PDFRenderContext = {
    canvasContext: context,
    viewport: viewport,
  };

  const renderTask = page.render(renderContext);
  const cancelRender = () => renderTask.cancel?.();
  signal.addEventListener('abort', cancelRender, { once: true });

  try {
    await renderTask.promise;
  } finally {
    signal.removeEventListener('abort', cancelRender);
  }

  if (signal.aborted) throw new Error('Conversion cancelled');

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
    }, 'image/jpeg', jpegQuality);
  });
};

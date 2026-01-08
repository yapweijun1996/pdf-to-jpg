import { ConvertedImage } from '../types';
import { v4 as uuidv4 } from 'uuid'; // Using simple shim if uuid not avail, but for this env we use logic below

// Dynamic import for PDF.js to ensure we get the worker from CDN
const PDFJS_VERSION = '3.11.174';
const PDFJS_CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`;
const PDFJS_WORKER_CDN = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;

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

export const initPdfJs = async () => {
  if (isPdfJsLoaded) return (window as any).pdfjsLib;

  await loadScript(PDFJS_CDN);
  const pdfjsLib = (window as any).pdfjsLib;
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
  pdfDoc: any, 
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
  const renderContext = {
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
        id: Math.random().toString(36).substring(7),
        pageNumber,
        url,
        blob,
        width: viewport.width,
        height: viewport.height
      });
    }, 'image/jpeg', 0.85); // 0.85 quality
  });
};

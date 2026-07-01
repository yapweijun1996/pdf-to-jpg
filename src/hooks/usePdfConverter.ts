import { useCallback, useState } from 'react';
import { QUALITY_PRESETS } from '@/config/app';
import { resolveOutputBaseName } from '@/lib/files/fileNames';
import { initPdfJs, readFileAsArrayBuffer, renderPageToBlob } from '@/lib/pdf/pdfUtils';
import {
  ConvertedDocument,
  ConversionOptions,
  ConversionState,
  ConversionStatus,
  DocumentStatus,
  QualityPreset,
} from '@/types/conversion';

const INITIAL_STATE: ConversionState = {
  status: ConversionStatus.IDLE,
  progress: 0,
  totalPageCount: 0,
  currentPage: 0,
  currentFileIndex: 0,
  totalFileCount: 0,
  activeFileName: null,
  error: null,
  documents: [],
  options: null,
};

const revokeDocuments = (documents: ConvertedDocument[]) => {
  documents.forEach((document) => {
    document.images.forEach((image) => URL.revokeObjectURL(image.url));
  });
};

const getQualityPreset = (options: ConversionOptions): QualityPreset => {
  return QUALITY_PRESETS.find((preset) => preset.id === options.qualityPresetId) ?? QUALITY_PRESETS[1];
};

const getSelectedPages = (totalPageCount: number, options: ConversionOptions) => {
  if (options.pageMode === 'all') {
    return Array.from({ length: totalPageCount }, (_, index) => index + 1);
  }

  const startPage = Math.max(1, Math.floor(options.startPage));
  const endPage = Math.min(totalPageCount, Math.floor(options.endPage));
  if (startPage > totalPageCount || endPage < startPage) return [];

  return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
};

const createDocuments = (files: File[], options: ConversionOptions): ConvertedDocument[] => {
  return files.map((file, index) => ({
    id: crypto.randomUUID(),
    fileName: file.name,
    outputBaseName: resolveOutputBaseName(file.name, options.outputBaseName, index, files.length),
    status: DocumentStatus.PENDING,
    error: null,
    images: [],
    totalPageCount: 0,
    selectedPageCount: 0,
  }));
};

export const usePdfConverter = () => {
  const [state, setState] = useState<ConversionState>(INITIAL_STATE);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const reset = useCallback(() => {
    abortController?.abort();
    setAbortController(null);
    setState((current) => {
      revokeDocuments(current.documents);
      return INITIAL_STATE;
    });
  }, [abortController]);

  const cancel = useCallback(() => {
    abortController?.abort();
  }, [abortController]);

  const processFiles = useCallback(async (files: File[], options: ConversionOptions) => {
    abortController?.abort();
    const controller = new AbortController();
    const documents = createDocuments(files, options);
    const quality = getQualityPreset(options);

    setAbortController(controller);
    setState((current) => {
      revokeDocuments(current.documents);
      return {
        ...INITIAL_STATE,
        status: ConversionStatus.READING,
        totalFileCount: files.length,
        documents,
        options,
      };
    });

    for (const [fileIndex, file] of files.entries()) {
      if (controller.signal.aborted) break;

      setState((current) => ({
        ...current,
        status: ConversionStatus.READING,
        activeFileName: file.name,
        currentFileIndex: fileIndex + 1,
        currentPage: 0,
        totalPageCount: 0,
        documents: current.documents.map((document, index) =>
          index === fileIndex ? { ...document, status: DocumentStatus.READING, error: null } : document
        ),
      }));

      try {
        const pdfjsLib = await initPdfJs();
        const arrayBuffer = await readFileAsArrayBuffer(file, controller.signal);
        const loadingTask = pdfjsLib.getDocument({
          data: arrayBuffer,
          cMapUrl: './cmaps/',
          cMapPacked: true,
        });
        const pdfDoc = await loadingTask.promise;
        const selectedPages = getSelectedPages(pdfDoc.numPages, options);

        if (selectedPages.length === 0) {
          throw new Error(`Selected page range is outside this PDF's ${pdfDoc.numPages} pages.`);
        }

        setState((current) => ({
          ...current,
          status: ConversionStatus.CONVERTING,
          totalPageCount: selectedPages.length,
          documents: current.documents.map((document, index) =>
            index === fileIndex
              ? {
                  ...document,
                  status: DocumentStatus.CONVERTING,
                  totalPageCount: pdfDoc.numPages,
                  selectedPageCount: selectedPages.length,
                }
              : document
          ),
        }));

        for (const [pageIndex, pageNumber] of selectedPages.entries()) {
          const image = await renderPageToBlob(pdfDoc, pageNumber, quality.scale, quality.jpegQuality, controller.signal);
          const overallProgress = Math.round(((fileIndex + (pageIndex + 1) / selectedPages.length) / files.length) * 100);

          setState((current) => ({
            ...current,
            progress: overallProgress,
            currentPage: pageIndex + 1,
            documents: current.documents.map((document, index) =>
              index === fileIndex ? { ...document, images: [...document.images, image] } : document
            ),
          }));

          await new Promise((resolve) => setTimeout(resolve, 25));
        }

        setState((current) => ({
          ...current,
          documents: current.documents.map((document, index) =>
            index === fileIndex ? { ...document, status: DocumentStatus.COMPLETED } : document
          ),
        }));
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to process PDF';

        setState((current) => ({
          ...current,
          documents: current.documents.map((document, index) => {
            if (index !== fileIndex) return document;
            document.images.forEach((image) => URL.revokeObjectURL(image.url));
            return {
              ...document,
              status: controller.signal.aborted ? DocumentStatus.CANCELLED : DocumentStatus.ERROR,
              error: controller.signal.aborted ? 'Conversion cancelled.' : message,
              images: [],
            };
          }),
        }));

        if (controller.signal.aborted) break;
        console.error(error);
      }
    }

    setAbortController(null);
    setState((current) => {
      if (controller.signal.aborted) {
        return {
          ...current,
          status: ConversionStatus.CANCELLED,
          error: 'Conversion cancelled.',
          documents: current.documents.map((document) =>
            document.status === DocumentStatus.PENDING || document.status === DocumentStatus.CONVERTING
              ? { ...document, status: DocumentStatus.CANCELLED, error: 'Conversion cancelled.' }
              : document
          ),
        };
      }

      const hasCompleted = current.documents.some((document) => document.status === DocumentStatus.COMPLETED);
      return {
        ...current,
        status: hasCompleted ? ConversionStatus.COMPLETED : ConversionStatus.ERROR,
        progress: hasCompleted ? 100 : current.progress,
        error: hasCompleted ? null : 'No PDFs could be converted.',
      };
    });
  }, [abortController]);

  return {
    state,
    processFiles,
    reset,
    cancel,
  };
};

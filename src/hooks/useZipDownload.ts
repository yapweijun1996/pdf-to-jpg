import { useCallback, useState } from 'react';
import JSZip from 'jszip';
import saveAs from 'file-saver';
import { buildImageFileName, buildZipFileName } from '@/lib/files/fileNames';
import { ConvertedDocument } from '@/types/conversion';

export const useZipDownload = () => {
  const [isZipping, setIsZipping] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);

  const downloadDocumentsAsZip = useCallback(async (documents: ConvertedDocument[], archiveName = 'converted_images') => {
    const completedDocuments = documents.filter((document) => document.images.length > 0);
    if (completedDocuments.length === 0) return;

    setIsZipping(true);
    setZipError(null);

    try {
      const zip = new JSZip();

      completedDocuments.forEach((document) => {
        const folder = zip.folder(document.outputBaseName);
        document.images.forEach((image) => {
          folder?.file(
            buildImageFileName(document.outputBaseName, image.pageNumber, document.totalPageCount),
            image.blob
          );
        });
      });

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, buildZipFileName(archiveName));
    } catch (error) {
      console.error('Failed to zip', error);
      setZipError('Failed to create the ZIP file. Try downloading individual JPG files.');
    } finally {
      setIsZipping(false);
    }
  }, []);

  const clearZipError = useCallback(() => setZipError(null), []);

  return { isZipping, zipError, downloadDocumentsAsZip, clearZipError };
};

import { useState, useCallback } from 'react';
import JSZip from 'jszip';
import saveAs from 'file-saver';
import { ConvertedImage } from '@/types/conversion';

export const useZipDownload = () => {
  const [isZipping, setIsZipping] = useState(false);

  const downloadAllAsZip = useCallback(async (images: ConvertedImage[], fileName: string | null) => {
    if (images.length === 0) return;
    setIsZipping(true);
    
    try {
      const zip = new JSZip();
      const folder = zip.folder("converted_images");
      const baseName = fileName?.replace('.pdf', '') || 'document';

      images.forEach((img) => {
        folder?.file(`${baseName}_page_${img.pageNumber}.jpg`, img.blob);
      });

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${baseName}_images.zip`);
    } catch (e) {
      console.error("Failed to zip", e);
      alert("Failed to create zip file.");
    } finally {
      setIsZipping(false);
    }
  }, []);

  return { isZipping, downloadAllAsZip };
};

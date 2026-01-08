import React from 'react';
import { Download, Image as ImageIcon } from 'lucide-react';
import { ConvertedImage } from '../types';
import saveAs from 'file-saver';

interface ImageGridProps {
  images: ConvertedImage[];
  fileName: string | null;
}

export const ImageGrid: React.FC<ImageGridProps> = ({ images, fileName }) => {
  const downloadImage = (image: ConvertedImage) => {
    const baseName = fileName?.replace('.pdf', '') || 'document';
    saveAs(image.blob, `${baseName}_page_${image.pageNumber}.jpg`);
  };

  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full animate-fade-in-up">
      {images.map((img) => (
        <div 
          key={img.id} 
          className="group relative bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-200 hover:shadow-md hover:border-brand-200"
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
            <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider flex items-center">
              <ImageIcon size={14} className="mr-1.5" />
              Page {img.pageNumber}
            </span>
            <span className="text-xs text-slate-400">
              {img.width} x {img.height}
            </span>
          </div>

          {/* Image Preview Area */}
          <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
             <img 
               src={img.url} 
               alt={`Page ${img.pageNumber}`}
               className="w-full h-full object-contain p-2"
               loading="lazy"
             />
             
             {/* Overlay Actions */}
             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <button
                  onClick={() => downloadImage(img)}
                  className="bg-white text-slate-900 px-4 py-2 rounded-full font-medium text-sm flex items-center shadow-lg hover:bg-brand-50 hover:text-brand-600 transition-colors transform translate-y-2 group-hover:translate-y-0 duration-200"
                >
                  <Download size={16} className="mr-2" />
                  Download JPG
                </button>
             </div>
          </div>
        </div>
      ))}
    </div>
  );
};
import React, { useCallback, useState } from 'react';
import { UploadCloud, FileType, AlertCircle } from 'lucide-react';
import { APP_CONFIG } from '../utils/constants';

interface DropzoneProps {
  onFileAccepted: (file: File) => void;
  isLoading: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFileAccepted, isLoading }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) setIsDragActive(true);
  }, [isLoading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const validateAndAccept = (file: File) => {
    setError(null);
    if (file.type !== APP_CONFIG.ACCEPTED_FILE_TYPE) {
      setError('Please upload a valid PDF file.');
      return;
    }
    
    if (file.size > APP_CONFIG.MAX_FILE_SIZE_BYTES) {
      setError(`File size too large (Max ${APP_CONFIG.MAX_FILE_SIZE_MB}MB).`);
      return;
    }
    onFileAccepted(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (isLoading) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndAccept(files[0]);
    }
  }, [isLoading]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndAccept(files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-6 sm:p-10 text-center transition-all duration-200 ease-in-out cursor-pointer group
          ${isDragActive 
            ? 'border-brand-500 bg-brand-50 scale-[1.01] shadow-lg' 
            : 'border-slate-300 hover:border-brand-400 hover:bg-slate-50'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}
        `}
        onClick={() => !isLoading && document.getElementById('file-input')?.click()}
      >
        <input
          type="file"
          id="file-input"
          className="hidden"
          accept=".pdf"
          onChange={handleFileInput}
          disabled={isLoading}
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={`
            p-4 rounded-full transition-colors duration-200
            ${isDragActive ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-500 group-hover:bg-brand-50 group-hover:text-brand-500'}
          `}>
            {isLoading ? (
               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div>
            ) : (
               <UploadCloud size={40} />
            )}
          </div>
          
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-slate-800">
              {isLoading ? 'Processing PDF...' : 'Click or drag PDF here'}
            </h3>
            <p className="text-sm text-slate-500">
              Maximum file size {APP_CONFIG.MAX_FILE_SIZE_MB}MB. Secure client-side conversion.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg flex items-center text-red-700 text-sm animate-fade-in">
          <AlertCircle size={18} className="mr-2 flex-shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
};

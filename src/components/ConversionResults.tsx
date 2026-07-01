import React from 'react';
import { AlertCircle, CheckCircle2, Download, RefreshCw } from 'lucide-react';
import { ImageGrid } from '@/components/ImageGrid';
import { ConvertedDocument, DocumentStatus } from '@/types/conversion';

interface ConversionResultsProps {
  documents: ConvertedDocument[];
  isZipping: boolean;
  zipError: string | null;
  onDownloadZip: () => void;
  onReset: () => void;
}

export const ConversionResults: React.FC<ConversionResultsProps> = ({
  documents,
  isZipping,
  zipError,
  onDownloadZip,
  onReset,
}) => {
  const completedDocuments = documents.filter((document) => document.images.length > 0);
  const totalImages = completedDocuments.reduce((sum, document) => sum + document.images.length, 0);
  const hasDownloads = totalImages > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">Conversion Finished</h3>
            <p className="text-sm text-slate-500">
              {completedDocuments.length} PDF batches, {totalImages} JPG files ready
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onReset}
            className="flex-1 sm:flex-none items-center justify-center px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors flex"
          >
            <RefreshCw size={18} className="mr-2" />
            New Batch
          </button>
          <button
            onClick={onDownloadZip}
            disabled={isZipping || !hasDownloads}
            className="flex-1 sm:flex-none items-center justify-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium shadow-md transition-all flex disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isZipping ? (
              <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Download size={18} className="mr-2" />
            )}
            {isZipping ? 'Zipping...' : 'Download ZIP'}
          </button>
        </div>
      </div>

      {zipError && (
        <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-start gap-3 text-red-700 text-sm">
          <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
          <span>{zipError}</span>
        </div>
      )}

      {documents.map((document) => (
        <section key={document.id} className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <div>
              <h4 className="font-semibold text-slate-900">{document.fileName}</h4>
              <p className="text-sm text-slate-500">
                Output base: {document.outputBaseName}
                {document.selectedPageCount > 0 ? `, ${document.selectedPageCount} selected pages` : ''}
              </p>
            </div>
            {document.status === DocumentStatus.ERROR && (
              <span className="text-sm text-red-600">{document.error}</span>
            )}
            {document.status === DocumentStatus.CANCELLED && (
              <span className="text-sm text-amber-600">{document.error}</span>
            )}
          </div>
          <ImageGrid
            images={document.images}
            outputBaseName={document.outputBaseName}
            totalPageCount={document.totalPageCount || document.images.length}
          />
        </section>
      ))}
    </div>
  );
};

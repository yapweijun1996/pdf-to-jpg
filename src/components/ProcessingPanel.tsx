import React from 'react';
import { XCircle } from 'lucide-react';
import { ConversionState } from '@/types/conversion';

interface ProcessingPanelProps {
  state: ConversionState;
  onCancel: () => void;
}

export const ProcessingPanel: React.FC<ProcessingPanelProps> = ({ state, onCancel }) => {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl p-6 sm:p-8 shadow-sm border border-slate-200 text-center space-y-6">
      <div className="relative pt-4">
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 transition-all duration-300 ease-out"
            style={{ width: `${state.progress}%` }}
          />
        </div>
        <div className="absolute -top-1 right-0 text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
          {state.progress}%
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900">Converting PDFs...</h3>
        <p className="text-slate-500 mt-1">
          File {state.currentFileIndex || 1} of {state.totalFileCount || 1}
          {state.activeFileName ? `: ${state.activeFileName}` : ''}
        </p>
        <p className="text-sm text-slate-400 mt-1">
          Processed {state.currentPage} of {state.totalPageCount} selected pages
        </p>
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="inline-flex items-center justify-center px-4 py-2 border border-red-200 rounded-lg text-red-700 font-medium hover:bg-red-50 transition-colors"
      >
        <XCircle size={18} className="mr-2" />
        Cancel
      </button>
    </div>
  );
};

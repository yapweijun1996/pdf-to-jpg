import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ConversionErrorPanelProps {
  title?: string;
  message: string | null;
  onReset: () => void;
}

export const ConversionErrorPanel: React.FC<ConversionErrorPanelProps> = ({ title = 'Conversion Failed', message, onReset }) => {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl p-6 shadow-sm border border-red-100 text-center space-y-5">
      <div className="mx-auto h-12 w-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
        <AlertCircle size={26} />
      </div>
      <div>
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500 mt-2">
          {message || 'The selected PDF could not be converted. Try another file or refresh the page.'}
        </p>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
      >
        <RefreshCw size={18} className="mr-2" />
        Choose Another File
      </button>
    </div>
  );
};

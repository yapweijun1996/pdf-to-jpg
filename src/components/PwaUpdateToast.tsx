import React from 'react';
import { RefreshCw } from 'lucide-react';

interface PwaUpdateToastProps {
  isVisible: boolean;
  onRefresh: () => void;
}

export const PwaUpdateToast: React.FC<PwaUpdateToastProps> = ({ isVisible, onRefresh }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div className="flex w-full max-w-md items-center justify-between gap-4 rounded-xl border border-brand-100 bg-white px-4 py-3 shadow-lg">
        <div>
          <p className="text-sm font-semibold text-slate-900">New version ready</p>
          <p className="text-xs text-slate-500">Refresh when you are ready.</p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="flex items-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { Download } from 'lucide-react';
import { usePwaInstall } from '@/hooks/usePwaInstall';

interface PwaInstallButtonProps {
  onShowIosInstructions: () => void;
}

export const PwaInstallButton: React.FC<PwaInstallButtonProps> = ({ onShowIosInstructions }) => {
  const { canInstall, install, isIos } = usePwaInstall();

  if (!canInstall) return null;

  const handleClick = () => {
    if (isIos) {
      onShowIosInstructions();
      return;
    }

    install();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="bg-brand-50 text-brand-700 px-3 py-2 rounded-lg hover:bg-brand-100 transition-colors text-xs sm:text-sm flex items-center gap-2"
      aria-label="Install app"
    >
      <Download size={16} />
      <span className="hidden sm:inline">Install</span>
    </button>
  );
};

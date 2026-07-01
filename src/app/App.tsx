import React, { useState } from 'react';
import { Zap, ShieldCheck, CheckCircle2, Github, Lock, Code2, WifiOff } from 'lucide-react';
import { ConversionErrorPanel } from '@/components/ConversionErrorPanel';
import { ConversionResults } from '@/components/ConversionResults';
import { ConversionSettings } from '@/components/ConversionSettings';
import { Dropzone } from '@/components/Dropzone';
import { Modal } from '@/components/Modal';
import { ProcessingPanel } from '@/components/ProcessingPanel';
import { PwaInstallButton } from '@/components/PwaInstallButton';
import { PwaUpdateToast } from '@/components/PwaUpdateToast';
import { DEFAULT_CONVERSION_OPTIONS } from '@/config/app';
import { usePdfConverter } from '@/hooks/usePdfConverter';
import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate';
import { useZipDownload } from '@/hooks/useZipDownload';
import { ConversionOptions, ConversionStatus } from '@/types/conversion';
import { APP_CONFIG } from '@/config/app';

const App: React.FC = () => {
  const { state, processFiles, reset, cancel } = usePdfConverter();
  const { isZipping, zipError, downloadDocumentsAsZip, clearZipError } = useZipDownload();
  const { updateAvailable, updateApp } = useServiceWorkerUpdate();
  
  const [activeModal, setActiveModal] = useState<'how-it-works' | 'ios-install' | null>(null);
  const [options, setOptions] = useState<ConversionOptions>(DEFAULT_CONVERSION_OPTIONS);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const isRangeInvalid = options.pageMode === 'range' && options.endPage < options.startPage;
  const isProcessing = state.status === ConversionStatus.READING || state.status === ConversionStatus.CONVERTING;
  const hasDocuments = state.documents.length > 0;
  const hasDownloadableDocuments = state.documents.some((document) => document.images.length > 0);

  const handleOptionsChange = (nextOptions: ConversionOptions) => {
    setOptions(nextOptions);
    setSettingsError(null);
  };

  const handleFilesAccepted = (files: File[]) => {
    if (isRangeInvalid) {
      setSettingsError('Fix the page range before converting.');
      return;
    }

    clearZipError();
    setSettingsError(null);
    processFiles(files, options);
  };

  const handleReset = () => {
    clearZipError();
    setSettingsError(null);
    reset();
  };

  const handleDownloadZip = () => {
    downloadDocumentsAsZip(state.documents, 'converted_images');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <img
              src={`${import.meta.env.BASE_URL}icon-512.png`}
              alt=""
              className="h-9 w-9 rounded-lg shadow-sm"
            />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              {APP_CONFIG.NAME.split(' ')[0]} <span className="text-brand-600 font-extrabold">{APP_CONFIG.NAME.split(' ')[1]}</span>
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sm font-medium text-slate-500">
             <button onClick={() => setActiveModal('how-it-works')} className="hover:text-brand-600 transition-colors hidden sm:block">How it works</button>
             <a href="./privacy.html" className="hover:text-brand-600 transition-colors hidden sm:block">Privacy</a>
             <a href="./terms.html" className="hover:text-brand-600 transition-colors hidden md:block">Terms</a>
             <PwaInstallButton onShowIosInstructions={() => setActiveModal('ios-install')} />
             <a 
               href="https://github.com/yapweijun1996/pdf-to-jpg" 
               target="_blank" 
               rel="noopener noreferrer"
               className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors text-xs sm:text-sm flex items-center gap-2"
             >
               <Github size={16} />
               <span className="hidden sm:inline">GitHub</span>
               <span className="sm:hidden">Code</span>
             </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8 sm:space-y-12">
        
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900">
            Convert PDF to JPG <br/>
            <span className="text-brand-600">Privately & Precisely</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Batch convert selected PDF pages into JPG images with quality, DPI, and file naming controls. 
            All processing happens in your browser—your files never leave your device.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-slate-500 pt-2">
            <div className="flex items-center"><Zap size={16} className="mr-1.5 text-yellow-500" /> Batch Ready</div>
            <div className="flex items-center"><ShieldCheck size={16} className="mr-1.5 text-green-500" /> 100% Private</div>
            <div className="flex items-center"><CheckCircle2 size={16} className="mr-1.5 text-brand-500" /> Quality Controls</div>
          </div>
        </div>

        {/* Trust Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3">
            <Lock size={20} className="text-brand-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-slate-900">No File Uploads</p>
              <p className="text-xs text-slate-500 mt-0.5">Your PDFs never leave your device or touch a server.</p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3">
            <WifiOff size={20} className="text-brand-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-slate-900">Works Without a Connection</p>
              <p className="text-xs text-slate-500 mt-0.5">Conversion runs entirely in your browser, even offline.</p>
            </div>
          </div>
          <a
            href="https://github.com/yapweijun1996/pdf-to-jpg"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white border border-slate-200 rounded-xl p-4 flex items-start gap-3 hover:border-brand-300 transition-colors"
          >
            <Code2 size={20} className="text-brand-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm text-slate-900">Open Source</p>
              <p className="text-xs text-slate-500 mt-0.5">Read the code yourself and verify the privacy claim.</p>
            </div>
          </a>
        </div>

        {/* Converter Area */}
        <div className="space-y-6 sm:space-y-8">
          <ConversionSettings options={options} disabled={isProcessing} onChange={handleOptionsChange} />

          {settingsError && (
            <div className="max-w-2xl mx-auto bg-red-50 border border-red-100 rounded-lg p-4 text-sm text-red-700">
              {settingsError}
            </div>
          )}

          {state.status === ConversionStatus.IDLE && (
            <Dropzone onFilesAccepted={handleFilesAccepted} isLoading={false} />
          )}

          {state.status === ConversionStatus.ERROR && !hasDownloadableDocuments && (
            <ConversionErrorPanel message={state.error} onReset={handleReset} />
          )}

          {state.status === ConversionStatus.CANCELLED && (
            <ConversionErrorPanel title="Conversion Cancelled" message={state.error} onReset={handleReset} />
          )}

          {isProcessing && (
            <ProcessingPanel state={state} onCancel={cancel} />
          )}

          {!isProcessing && hasDocuments && hasDownloadableDocuments && (
            <ConversionResults
              documents={state.documents}
              isZipping={isZipping}
              zipError={zipError}
              onDownloadZip={handleDownloadZip}
              onReset={handleReset}
            />
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-400 text-sm space-y-3">
          <p>© {new Date().getFullYear()} {APP_CONFIG.NAME}. Built with React & Tailwind.</p>
          <div className="flex items-center justify-center gap-4">
            <a href="./privacy.html" className="hover:text-brand-600 transition-colors">Privacy Policy</a>
            <a href="./terms.html" className="hover:text-brand-600 transition-colors">Terms of Use</a>
          </div>
        </div>
      </footer>

      <PwaUpdateToast isVisible={updateAvailable} onRefresh={() => updateApp?.()} />

      {/* Modals */}
      <Modal 
        isOpen={activeModal === 'how-it-works'} 
        onClose={() => setActiveModal(null)} 
        title="How it Works"
      >
        <div className="space-y-4 text-slate-600">
          <p>
            PDF to JPG Pro uses advanced browser technologies (WebAssembly & HTML5 Canvas) to render your PDF files directly on your device.
          </p>
          <ol className="list-decimal pl-5 space-y-2">
            <li><strong>Select PDFs:</strong> Drag and drop or click to select one or more files.</li>
            <li><strong>Choose controls:</strong> Set page range, quality/DPI, and output names.</li>
            <li><strong>Local Processing:</strong> The browser reads the file into memory.</li>
            <li><strong>Rendering:</strong> Each page is rendered to a high-resolution canvas.</li>
            <li><strong>Conversion:</strong> The canvas is converted to a JPG blob.</li>
            <li><strong>Download:</strong> You save the images instantly to your disk.</li>
          </ol>
          <div className="bg-blue-50 p-4 rounded-lg text-blue-800 text-sm mt-4">
            <Zap size={16} className="inline mr-1" />
            No servers involved. It's just you and your browser.
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={activeModal === 'ios-install'}
        onClose={() => setActiveModal(null)}
        title="Install on iOS"
      >
        <div className="space-y-4 text-slate-600">
          <p>Open the Share menu, choose Add to Home Screen, then confirm the app name.</p>
          <p className="text-sm text-slate-400">
            iOS uses this manual install flow instead of the browser install prompt.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default App;

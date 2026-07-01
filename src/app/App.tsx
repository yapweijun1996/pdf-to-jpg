import React, { useState } from 'react';
import { FileText, Download, RefreshCw, Zap, ShieldCheck, CheckCircle2, Github } from 'lucide-react';
import { Dropzone } from '@/components/Dropzone';
import { ImageGrid } from '@/components/ImageGrid';
import { Modal } from '@/components/Modal';
import { PwaInstallButton } from '@/components/PwaInstallButton';
import { PwaUpdateToast } from '@/components/PwaUpdateToast';
import { usePdfConverter } from '@/hooks/usePdfConverter';
import { useServiceWorkerUpdate } from '@/hooks/useServiceWorkerUpdate';
import { useZipDownload } from '@/hooks/useZipDownload';
import { ConversionStatus } from '@/types/conversion';
import { APP_CONFIG } from '@/config/app';

const App: React.FC = () => {
  const { state, processFile, reset } = usePdfConverter();
  const { isZipping, downloadAllAsZip } = useZipDownload();
  const { updateAvailable, updateApp } = useServiceWorkerUpdate();
  
  const [activeModal, setActiveModal] = useState<'how-it-works' | 'privacy' | 'ios-install' | null>(null);

  const handleDownloadZip = () => downloadAllAsZip(state.images, state.fileName);

  const isProcessing = state.status === ConversionStatus.READING || state.status === ConversionStatus.CONVERTING;
  const isDone = state.status === ConversionStatus.COMPLETED || (state.status === ConversionStatus.CONVERTING && state.images.length > 0);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-brand-600 text-white p-1.5 rounded-lg shadow-sm">
              <FileText size={20} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
              {APP_CONFIG.NAME.split(' ')[0]} <span className="text-brand-600 font-extrabold">{APP_CONFIG.NAME.split(' ')[1]}</span>
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sm font-medium text-slate-500">
             <button onClick={() => setActiveModal('how-it-works')} className="hover:text-brand-600 transition-colors hidden sm:block">How it works</button>
             <button onClick={() => setActiveModal('privacy')} className="hover:text-brand-600 transition-colors hidden sm:block">Privacy</button>
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
            <span className="text-brand-600">Instantly & Securely</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Extract pages from your PDF documents as high-quality JPG images. 
            All processing happens in your browser—your files never leave your device.
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-slate-500 pt-2">
            <div className="flex items-center"><Zap size={16} className="mr-1.5 text-yellow-500" /> Blazing Fast</div>
            <div className="flex items-center"><ShieldCheck size={16} className="mr-1.5 text-green-500" /> 100% Private</div>
            <div className="flex items-center"><CheckCircle2 size={16} className="mr-1.5 text-brand-500" /> High Quality</div>
          </div>
        </div>

        {/* Converter Area */}
        <div className="space-y-6 sm:space-y-8">
          {state.status === ConversionStatus.IDLE && (
            <Dropzone onFileAccepted={processFile} isLoading={false} />
          )}

          {isProcessing && (
            <div className="max-w-2xl mx-auto bg-white rounded-2xl p-8 shadow-sm border border-slate-200 text-center space-y-6">
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
                <h3 className="text-lg font-semibold text-slate-900 animate-pulse">Converting your document...</h3>
                <p className="text-slate-500 mt-1">Processed {state.currentPage} of {state.totalPageCount} pages</p>
              </div>
            </div>
          )}

          {isDone && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Conversion Complete</h3>
                    <p className="text-sm text-slate-500">{state.images.length} images ready to download</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button 
                    onClick={reset}
                    className="flex-1 sm:flex-none items-center justify-center px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors flex"
                  >
                    <RefreshCw size={18} className="mr-2" />
                    New File
                  </button>
              <button 
                onClick={handleDownloadZip}
                disabled={isZipping}
                className="flex-1 sm:flex-none items-center justify-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-medium shadow-md transition-all flex disabled:opacity-70 disabled:cursor-not-allowed"
              >
                    {isZipping ? (
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    ) : (
                      <Download size={18} className="mr-2" />
                    )}
                    {isZipping ? 'Zipping...' : 'Download All (ZIP)'}
                  </button>
                </div>
              </div>
              
              <ImageGrid images={state.images} fileName={state.fileName} />
            </div>
          )}
        </div>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} {APP_CONFIG.NAME}. Built with React & Tailwind.</p>
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
            <li><strong>Select your PDF:</strong> Drag and drop or click to select a file.</li>
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
        isOpen={activeModal === 'privacy'} 
        onClose={() => setActiveModal(null)} 
        title="Privacy Policy"
      >
        <div className="space-y-4 text-slate-600">
          <p className="font-medium text-slate-900">Your Data Stays With You.</p>
          <p>
            Unlike many online converters, we do <strong>not</strong> upload your files to the cloud.
          </p>
          <ul className="space-y-3">
            <li className="flex items-start">
              <ShieldCheck className="text-green-500 mr-2 flex-shrink-0 mt-0.5" size={18} />
              <span>Files are processed entirely within your browser's sandbox.</span>
            </li>
            <li className="flex items-start">
              <ShieldCheck className="text-green-500 mr-2 flex-shrink-0 mt-0.5" size={18} />
              <span>We do not store, track, or view your documents.</span>
            </li>
            <li className="flex items-start">
              <ShieldCheck className="text-green-500 mr-2 flex-shrink-0 mt-0.5" size={18} />
              <span>Once you refresh the page, all memory of the file is wiped.</span>
            </li>
          </ul>
          <p className="text-sm text-slate-400 mt-4 pt-4 border-t border-slate-100">
            This project is open source. You can audit the code on GitHub to verify these claims.
          </p>
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

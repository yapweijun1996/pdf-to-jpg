import React, { useState } from 'react';
import JSZip from 'jszip';
import saveAs from 'file-saver';
import { FileText, Download, RefreshCw, Zap, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Dropzone } from './components/Dropzone';
import { ImageGrid } from './components/ImageGrid';
import { usePdfConverter } from './hooks/usePdfConverter';
import { ConversionStatus } from './types';

const App: React.FC = () => {
  const { state, processFile, reset } = usePdfConverter();
  const [isZipping, setIsZipping] = useState(false);

  const downloadAllAsZip = async () => {
    if (state.images.length === 0) return;
    setIsZipping(true);
    
    try {
      const zip = new JSZip();
      const folder = zip.folder("converted_images");
      const baseName = state.fileName?.replace('.pdf', '') || 'document';

      state.images.forEach((img) => {
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
  };

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
              PDF2JPG <span className="text-brand-600 font-extrabold">Pro</span>
            </span>
          </div>
          <div className="flex items-center space-x-4 text-sm font-medium text-slate-500">
             <a href="#" className="hover:text-brand-600 transition-colors hidden sm:block">How it works</a>
             <a href="#" className="hover:text-brand-600 transition-colors hidden sm:block">Privacy</a>
             <button className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors text-xs sm:text-sm">
               GitHub
             </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
        
        {/* Header Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            Convert PDF to JPG <br/>
            <span className="text-brand-600">Instantly & Securely</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed">
            Extract pages from your PDF documents as high-quality JPG images. 
            All processing happens in your browser—your files never leave your device.
          </p>
          
          <div className="flex items-center justify-center gap-6 text-sm text-slate-500 pt-2">
            <div className="flex items-center"><Zap size={16} className="mr-1.5 text-yellow-500" /> Blazing Fast</div>
            <div className="flex items-center"><ShieldCheck size={16} className="mr-1.5 text-green-500" /> 100% Private</div>
            <div className="flex items-center"><CheckCircle2 size={16} className="mr-1.5 text-brand-500" /> High Quality</div>
          </div>
        </div>

        {/* Converter Area */}
        <div className="space-y-8">
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
                    onClick={downloadAllAsZip}
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
          <p>© {new Date().getFullYear()} PDF2JPG Pro. Built with React & Tailwind.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
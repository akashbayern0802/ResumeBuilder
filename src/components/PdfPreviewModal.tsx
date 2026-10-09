import React, { useState, useEffect } from 'react';
import { X, Download, Printer, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, FileCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { renderElementPdfPages, PdfRenderResult } from '../services/pdfExporter';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  printableElementId: string;
  documentTitle: string;
}

export const PdfPreviewModal: React.FC<Props> = ({
  isOpen,
  onClose,
  printableElementId,
  documentTitle
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [pdfResult, setPdfResult] = useState<PdfRenderResult | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100); // 75, 100, 125
  const [error, setError] = useState<string | null>(null);

  const loadPreview = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Small timeout to allow any re-renders of printable area to complete
      await new Promise(r => setTimeout(r, 100));
      const res = await renderElementPdfPages(printableElementId);
      setPdfResult(res);
      setCurrentPage(1);
    } catch (err: any) {
      console.error('Failed to generate PDF preview:', err);
      setError(err.message || 'Failed to render PDF preview.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadPreview();
    } else {
      setPdfResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!pdfResult) return;
    const safeFilename = `${documentTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_Resume.pdf`;
    pdfResult.pdf.save(safeFilename);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-6 overflow-hidden animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col w-full max-w-6xl h-[94vh] overflow-hidden text-slate-100">
        
        {/* Top Header & Toolbar */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-slate-900 border-b border-slate-800 gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">Exact Multi-Page PDF Preview</h2>
                {pdfResult && (
                  <span className="text-xs bg-indigo-500/20 text-indigo-300 font-semibold px-2 py-0.5 rounded-full border border-indigo-500/30">
                    {pdfResult.totalPages} {pdfResult.totalPages === 1 ? 'Page' : 'Pages'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">Preview exact page breaks and layout before saving to disk</p>
            </div>
          </div>

          {/* Center Toolbar: Page Navigation & Zoom */}
          {pdfResult && !isLoading && (
            <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700 rounded-xl px-2.5 py-1">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1 text-slate-300 hover:text-white disabled:opacity-40 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-slate-200 min-w-[70px] text-center">
                Page {currentPage} of {pdfResult.totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= pdfResult.totalPages}
                onClick={() => setCurrentPage(p => Math.min(pdfResult.totalPages, p + 1))}
                className="p-1 text-slate-300 hover:text-white disabled:opacity-40 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="h-4 w-px bg-slate-700 mx-1" />

              <button
                type="button"
                onClick={() => setZoomLevel(z => Math.max(60, z - 15))}
                className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                title="Zoom out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-mono text-slate-300 w-9 text-center">{zoomLevel}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel(z => Math.min(140, z + 15))}
                className="p-1 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                title="Zoom in"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadPreview}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              title="Refresh PDF rendering"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all cursor-pointer"
              title="Open System Print Dialog"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              disabled={!pdfResult || isLoading}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors ml-1 cursor-pointer"
              title="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content / Preview Canvas */}
        <div className="flex-1 overflow-auto bg-slate-950 p-4 sm:p-8 flex justify-center items-start min-h-0">
          {isLoading && (
            <div className="flex flex-col items-center justify-center m-auto space-y-4 py-20">
              <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <div className="text-center">
                <p className="text-sm font-semibold text-white">Generating high-fidelity PDF pages...</p>
                <p className="text-xs text-slate-400 mt-1">Calculating intelligent page breaks & whitespace alignment</p>
              </div>
            </div>
          )}

          {error && !isLoading && (
            <div className="flex flex-col items-center justify-center m-auto max-w-md text-center p-6 bg-red-950/40 border border-red-800/60 rounded-2xl">
              <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
              <h3 className="text-sm font-bold text-red-200">Could not generate PDF preview</h3>
              <p className="text-xs text-red-300/80 mt-1">{error}</p>
              <button
                type="button"
                onClick={loadPreview}
                className="mt-4 px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-500 rounded-lg transition-colors cursor-pointer"
              >
                Try Again
              </button>
            </div>
          )}

          {pdfResult && !isLoading && (
            <div className="flex flex-col items-center gap-8 pb-10 w-full">
              {/* Render current page or all pages stacked */}
              <div className="flex flex-col items-center gap-6">
                {pdfResult.pages.map((imgSrc, idx) => {
                  const pageNum = idx + 1;
                  return (
                    <div
                      key={idx}
                      id={`preview-page-${pageNum}`}
                      className={`relative flex flex-col items-center transition-all duration-150 ${
                        currentPage === pageNum ? 'ring-2 ring-indigo-500 rounded-lg' : ''
                      }`}
                      style={{
                        transform: `scale(${zoomLevel / 100})`,
                        transformOrigin: 'top center',
                        marginBottom: zoomLevel > 100 ? `${(zoomLevel - 100) * 8}px` : '0px'
                      }}
                    >
                      {/* Page badge header */}
                      <div className="w-full flex items-center justify-between text-xs text-slate-400 font-semibold mb-2 px-1">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-indigo-500" />
                          Page {pageNum} of {pdfResult.totalPages}
                        </span>
                        <span className="text-[11px] text-slate-500">Standard A4 (210 × 297mm)</span>
                      </div>

                      {/* Actual A4 Page Image */}
                      <div className="bg-white rounded-md shadow-2xl shadow-black/80 overflow-hidden border border-slate-700/50 max-w-[800px] w-full">
                        <img
                          src={imgSrc}
                          alt={`Resume Page ${pageNum}`}
                          className="w-full h-auto block select-none pointer-events-none"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Page Bar */}
        {pdfResult && !isLoading && pdfResult.totalPages > 1 && (
          <div className="px-5 py-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
            <span>
              Showing {pdfResult.totalPages} pages • Ready for ATS upload & recruiter submission
            </span>
            <div className="flex items-center gap-2">
              {pdfResult.pages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCurrentPage(idx + 1);
                    document.getElementById(`preview-page-${idx + 1}`)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                    currentPage === idx + 1
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Page {idx + 1}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

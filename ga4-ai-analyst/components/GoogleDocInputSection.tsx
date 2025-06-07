
import React, { useState, useCallback } from 'react';
import { DocData } from '../types';

interface GoogleDocInputSectionProps {
  onDocDataLoad: (data: DocData, fileName?: string) => void;
  onDocError: (errorMsg: string) => void;
  isDocDataLoaded: boolean;
  disabled: boolean;
  onClearData: () => void;
}

const GoogleDocInputSection: React.FC<GoogleDocInputSectionProps> = ({ 
  onDocDataLoad, 
  onDocError,
  isDocDataLoaded, 
  disabled, 
  onClearData 
}) => {
  const [docUrl, setDocUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleUrlChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setDocUrl(event.target.value);
    if (error) setError(null);
  }, [error]);

  const handleLoadDocData = useCallback(async () => {
    if (disabled || !docUrl.trim()) {
      setError('Google Document URL cannot be empty.');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      if (!docUrl.startsWith('https://docs.google.com/document/d/')) {
        throw new Error('Invalid Google Document URL format.');
      }
      
      // Transform public doc URL to plain text export URL
      // Example: https://docs.google.com/document/d/DOC_ID/edit
      // Becomes: https://docs.google.com/document/d/DOC_ID/export?format=txt
      const txtUrl = docUrl.replace(/\/edit.*$/, '/export?format=txt');
      
      const response = await fetch(txtUrl);
      if (!response.ok) {
        if (response.status === 400 || response.status === 401 || response.status === 403 || response.status === 404) {
             throw new Error(`Failed to fetch document. Status: ${response.status}. Ensure the document is public ("Anyone with the link can view").`);
        }
        throw new Error(`Failed to fetch document content. Status: ${response.status}`);
      }
      const textContent = await response.text();
      
      if (!textContent || textContent.trim() === '') {
        throw new Error('Fetched document content is empty. The document might be empty or inaccessible.');
      }
      
      let fileName; 
      try {
        const tempTitle = document.createElement('a');
        tempTitle.href = docUrl;
        const pathSegments = tempTitle.pathname.split('/');
        const docIdIndex = pathSegments.indexOf('d') + 1;
        if (pathSegments[docIdIndex]) {
            // Simplified name, actual title fetching is complex client-side
            fileName = `Doc: ${pathSegments[docIdIndex].substring(0,15)}...`; 
        }
      } catch(e) { /* ignore filename */ }


      onDocDataLoad(textContent, fileName);

    } catch (e: any) {
      console.error("Document Loading Error:", e);
      const errorMessage = e.message || 'An unknown error occurred while loading the document.';
      setError(errorMessage);
      onDocError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [docUrl, disabled, onDocDataLoad, onDocError]);

  const handleClearDoc = useCallback(() => {
    setDocUrl('');
    setError(null);
    onClearData();
  }, [onClearData]);

  return (
    <div className="p-5 bg-slate-800 shadow-xl rounded-xl my-4 mx-auto max-w-3xl">
      <h2 className="text-xl font-semibold mb-4 text-sky-300">Method 3: Google Document URL</h2>
      <p className="text-slate-400 mb-3 text-xs">
        Paste a link to a <strong className="text-slate-300">publicly accessible</strong> Google Document (File &gt; Share &gt; Share with others &gt; General access: Anyone with the link &gt; Viewer). 
        Only text content will be analyzed.
      </p>
      
      <div className="flex items-start space-x-2">
        <input
          type="url"
          className={`flex-grow p-2.5 bg-slate-700 border ${error ? 'border-red-500' : 'border-slate-600'} rounded-lg text-slate-200 text-sm focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:border-purple-500 transition-colors placeholder-slate-500 disabled:opacity-70 disabled:cursor-not-allowed`}
          placeholder="https://docs.google.com/document/d/..."
          value={docUrl}
          onChange={handleUrlChange}
          disabled={disabled || isLoading || isDocDataLoaded}
          aria-label="Google Document URL Input"
          aria-invalid={!!error}
          aria-describedby={error ? "doc-error-message" : undefined}
        />
        <button
          onClick={handleLoadDocData}
          disabled={disabled || isLoading || isDocDataLoaded || !docUrl.trim()}
          className="px-5 py-2 bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-white flex items-center justify-center space-x-1.5 btn-action"
          style={{ height: '2.75rem' }} 
        >
          {isLoading ? (
            <svg className="loading-spinner-svg" aria-hidden="true" focusable="false" role="status">
               <use href="#loading-spinner"></use>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
               <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125V5.25A2.25 2.25 0 0 0 11.25 3H6.75A2.25 2.25 0 0 0 4.5 5.25v13.5A2.25 2.25 0 0 0 6.75 21h10.5A2.25 2.25 0 0 0 19.5 18.75v-1.5M16.5 8.25H9m7.5 3H9m7.5 3H9" />
            </svg>
          )}
          <span>{isLoading ? 'Loading...' : 'Load Doc'}</span>
        </button>
      </div>
      {error && <p id="doc-error-message" className="text-red-400 mt-1.5 text-xs">{error}</p>}
      
      {(isDocDataLoaded || (docUrl.trim() && !isLoading)) && (
         <button
          onClick={handleClearDoc}
          disabled={disabled || isLoading}
          className="mt-2.5 px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium rounded-lg shadow-sm hover:shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5 btn-action"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c1.153 0 2.243.096 3.222.261m3.222.261L12 5.825M12 5.825a2.25 2.25 0 0 1-2.25-2.25h4.5A2.25 2.25 0 0 1 12 5.825Z" />
          </svg>
          <span>Clear Document URL</span>
        </button>
      )}
      {isDocDataLoaded && <p className="text-green-400 mt-1.5 text-xs font-medium">✓ Google Document content loaded. Ask questions below.</p>}
    </div>
  );
};

export default GoogleDocInputSection;
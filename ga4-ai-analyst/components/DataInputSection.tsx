
import React, { useState, useCallback } from 'react';

interface DataInputSectionProps {
  onDataLoad: (data: any) => void;
  isDataLoaded: boolean;
  setIsDataLoaded: (isLoaded: boolean) => void;
  disabled: boolean;
  onClearData: () => void;
}

const DataInputSection: React.FC<DataInputSectionProps> = ({ onDataLoad, isDataLoaded, setIsDataLoaded, disabled, onClearData }) => {
  const [jsonData, setJsonData] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonData(event.target.value);
    if (error) setError(null);
    if (isDataLoaded) {
        setIsDataLoaded(false); 
    }
  }, [error, isDataLoaded, setIsDataLoaded]);

  const handleLoadData = useCallback(() => {
    if (disabled || !jsonData.trim()) {
      setError('Data input cannot be empty.');
      setIsDataLoaded(false); 
      return;
    }
    try {
      const parsedData = JSON.parse(jsonData);
      onDataLoad(parsedData);
      setError(null);
      setIsDataLoaded(true);
    } catch (e) {
      setError('Invalid JSON format. Please check your data.');
      setIsDataLoaded(false);
      console.error("JSON Parsing Error:", e);
    }
  }, [jsonData, onDataLoad, setIsDataLoaded, disabled]);
  
  const handleClearData = useCallback(() => {
    setJsonData('');
    setError(null);
    setIsDataLoaded(false);
    onClearData();
  }, [onClearData, setIsDataLoaded]);

  return (
    <div className="p-5 bg-slate-800 shadow-xl rounded-xl my-4 mx-auto max-w-3xl">
      <h2 className="text-xl font-semibold mb-4 text-sky-300">Method 1: JSON Data</h2>
      <p className="text-slate-400 mb-3 text-xs">
        Export Google Analytics 4 data as JSON and paste below.
      </p>
      
      <textarea
        className={`w-full h-40 p-2.5 bg-slate-700 border ${error ? 'border-red-500' : 'border-slate-600'} rounded-lg text-slate-200 text-sm focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:border-sky-500 transition-colors placeholder-slate-500 disabled:opacity-70 disabled:cursor-not-allowed`}
        placeholder="Paste GA4 JSON data here..."
        value={jsonData}
        onChange={handleInputChange}
        disabled={disabled || isDataLoaded}
        aria-label="GA4 JSON Data Input"
        aria-invalid={!!error}
        aria-describedby={error ? "json-error-message" : undefined}
      />
      {error && <p id="json-error-message" className="text-red-400 mt-1.5 text-xs">{error}</p>}
      <div className="mt-3.5 flex space-x-2.5">
        <button
          onClick={handleLoadData}
          disabled={disabled || isDataLoaded || !jsonData.trim()}
          className="px-5 py-2 bg-gradient-to-br from-sky-500 to-sky-700 hover:from-sky-600 hover:to-sky-800 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5 btn-action"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H15M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859M12 3v8.25m0 0-3-3m3 3 3-3" />
          </svg>
          <span>Load Data</span>
        </button>
        {(isDataLoaded || jsonData.trim()) && (
           <button
            onClick={handleClearData}
            disabled={disabled}
            className="px-5 py-2 bg-gradient-to-br from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5 btn-action"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c1.153 0 2.243.096 3.222.261m3.222.261L12 5.825M12 5.825a2.25 2.25 0 0 1-2.25-2.25h4.5A2.25 2.25 0 0 1 12 5.825Z" />
            </svg>
            <span>Clear Data</span>
          </button>
        )}
      </div>
       {isDataLoaded && <p className="text-green-400 mt-2 text-xs font-medium">✓ GA4 JSON Data loaded. Ask questions below.</p>}
    </div>
  );
};

export default DataInputSection;
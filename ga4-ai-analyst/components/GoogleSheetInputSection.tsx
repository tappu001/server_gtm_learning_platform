
import React, { useState, useCallback } from 'react';
import { SheetData } from '../types';

interface GoogleSheetInputSectionProps {
  onSheetDataLoad: (data: SheetData, fileName?: string) => void;
  onSheetError: (errorMsg: string) => void;
  isSheetDataLoaded: boolean;
  disabled: boolean;
  onClearData: () => void;
}

// Basic CSV parser
const parseCSV = (csvText: string): SheetData => {
  const lines = csvText.split(/\r\n|\n/).filter(line => line.trim() !== '');
  if (lines.length < 1) return [];

  const headerLine = lines[0];
  const headers: string[] = [];
  let currentHeader = '';
  let inQuotes = false;
  for (let i = 0; i < headerLine.length; i++) {
    const char = headerLine[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      headers.push(currentHeader.trim());
      currentHeader = '';
    } else {
      currentHeader += char;
    }
  }
  headers.push(currentHeader.trim());


  const dataRows = lines.slice(1);
  const result: SheetData = [];

  dataRows.forEach(line => {
    const row: Record<string, string | number> = {};
    const values: string[] = [];
    let currentValue = '';
    let inQ = false; // Renamed to avoid conflict with outer scope 'inQuotes'

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQ = !inQ;
             if (i + 1 < line.length && line[i+1] === '"') { 
                currentValue += '"';
                i++; 
            }
        } else if (char === ',' && !inQ) {
            values.push(currentValue.trim());
            currentValue = '';
        } else {
            currentValue += char;
        }
    }
    values.push(currentValue.trim()); 

    headers.forEach((header, index) => {
      const value = values[index] || ''; 
      const numValue = Number(value);
      row[header] = isNaN(numValue) || value.trim() === '' ? value : numValue;
    });
    result.push(row);
  });

  return result;
};


const GoogleSheetInputSection: React.FC<GoogleSheetInputSectionProps> = ({ 
  onSheetDataLoad, 
  onSheetError,
  isSheetDataLoaded, 
  disabled, 
  onClearData 
}) => {
  const [sheetUrl, setSheetUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleUrlChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSheetUrl(event.target.value);
    if (error) setError(null);
  }, [error]);

  const handleLoadSheetData = useCallback(async () => {
    if (disabled || !sheetUrl.trim()) {
      setError('Google Sheet URL cannot be empty.');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      if (!sheetUrl.startsWith('https://docs.google.com/spreadsheets/d/')) {
        throw new Error('Invalid Google Sheet URL format.');
      }
      
      let csvUrl = sheetUrl.replace(/\/edit.*$/, '/export?format=csv');
      const gidMatch = sheetUrl.match(/gid=(\d+)/);
      if (gidMatch && gidMatch[1]) {
        if (!csvUrl.includes('?')) {
            csvUrl += `?gid=${gidMatch[1]}`;
        } else {
            csvUrl += `&gid=${gidMatch[1]}`;
        }
      }
      
      const response = await fetch(csvUrl);
      if (!response.ok) {
        if (response.status === 400 || response.status === 401 || response.status === 403 || response.status === 404) {
             throw new Error(`Failed to fetch sheet. Status: ${response.status}. Ensure the sheet is public ("Anyone with the link can view").`);
        }
        throw new Error(`Failed to fetch sheet data. Status: ${response.status}`);
      }
      const csvText = await response.text();
      
      if (!csvText || csvText.trim() === '') {
        throw new Error('Fetched CSV data is empty. The sheet might be empty or inaccessible.');
      }

      const parsedData = parseCSV(csvText);

      if (parsedData.length === 0 && csvText.length > 0) {
        throw new Error('Could not parse CSV data. Check sheet format or content. Ensure first row contains headers.');
      }
      if (parsedData.length === 0) {
        throw new Error('No data rows found in the sheet after parsing headers.');
      }
      
      let fileName;
      try {
        const urlObj = new URL(sheetUrl);
        const pathSegments = urlObj.pathname.split('/');
        const sheetIdIndex = pathSegments.indexOf('d') + 1;
        if (pathSegments[sheetIdIndex]) {
           fileName = `Sheet: ${pathSegments[sheetIdIndex].substring(0,15)}...`; 
        }
      } catch (e) { /* ignore filename extraction error */ }

      const limitedData = parsedData.slice(0, 1000); // Increased limit

      onSheetDataLoad(limitedData, fileName);

    } catch (e: any) {
      console.error("Sheet Loading Error:", e);
      const errorMessage = e.message || 'An unknown error occurred while loading the sheet.';
      setError(errorMessage);
      onSheetError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [sheetUrl, disabled, onSheetDataLoad, onSheetError]);

  const handleClearSheet = useCallback(() => {
    setSheetUrl('');
    setError(null);
    onClearData();
  }, [onClearData]);

  return (
    <div className="p-5 bg-slate-800 shadow-xl rounded-xl my-4 mx-auto max-w-3xl">
      <h2 className="text-xl font-semibold mb-4 text-sky-300">Method 2: Google Sheet URL</h2>
      <p className="text-slate-400 mb-3 text-xs">
        Paste a link to a <strong className="text-slate-300">publicly accessible</strong> Google Sheet (File &gt; Share &gt; Share with others &gt; General access: Anyone with the link &gt; Viewer).
      </p>
      
      <div className="flex items-start space-x-2">
        <input
          type="url"
          className={`flex-grow p-2.5 bg-slate-700 border ${error ? 'border-red-500' : 'border-slate-600'} rounded-lg text-slate-200 text-sm focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:border-green-500 transition-colors placeholder-slate-500 disabled:opacity-70 disabled:cursor-not-allowed`}
          placeholder="https://docs.google.com/spreadsheets/d/..."
          value={sheetUrl}
          onChange={handleUrlChange}
          disabled={disabled || isLoading || isSheetDataLoaded}
          aria-label="Google Sheet URL Input"
          aria-invalid={!!error}
          aria-describedby={error ? "sheet-error-message" : undefined}
        />
        <button
          onClick={handleLoadSheetData}
          disabled={disabled || isLoading || isSheetDataLoaded || !sheetUrl.trim()}
          className="px-5 py-2 bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-white flex items-center justify-center space-x-1.5 btn-action"
          style={{ height: '2.75rem' }} 
        >
          {isLoading ? (
            <svg className="loading-spinner-svg" aria-hidden="true" focusable="false" role="status">
               <use href="#loading-spinner"></use>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          )}
          <span>{isLoading ? 'Loading...' : 'Load Sheet'}</span>
        </button>
      </div>
      {error && <p id="sheet-error-message" className="text-red-400 mt-1.5 text-xs">{error}</p>}
      
      {(isSheetDataLoaded || (sheetUrl.trim() && !isLoading)) && (
         <button
          onClick={handleClearSheet}
          disabled={disabled || isLoading}
          className="mt-2.5 px-3 py-1 bg-gradient-to-br from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white text-xs font-medium rounded-lg shadow-sm hover:shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5 btn-action"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c1.153 0 2.243.096 3.222.261m3.222.261L12 5.825M12 5.825a2.25 2.25 0 0 1-2.25-2.25h4.5A2.25 2.25 0 0 1 12 5.825Z" />
          </svg>
          <span>Clear Sheet URL</span>
        </button>
      )}
      {isSheetDataLoaded && <p className="text-green-400 mt-1.5 text-xs font-medium">✓ Google Sheet data loaded. Ask questions below.</p>}
    </div>
  );
};

export default GoogleSheetInputSection;
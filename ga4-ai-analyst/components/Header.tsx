
import React from 'react';

interface HeaderProps {
  onClearSession: () => void;
  // Add theme toggle props if managed here
  // onToggleTheme: () => void;
  // currentTheme: 'light' | 'dark';
}

const Header: React.FC<HeaderProps> = ({ onClearSession }) => {
  
  const handleClearSessionClick = () => {
    if (window.confirm("Are you sure you want to clear your current session? This will remove all loaded data and chat history from this browser.")) {
      onClearSession();
    }
  };

  return (
    <header className="bg-slate-800 p-3 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-sky-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.056 3 12s4.03 8.25 9 8.25Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 12.75c-1.336 0-2.5-.54-2.5-1.5s1.164-1.5 2.5-1.5c1.336 0 2.5.54 2.5 1.5s-1.164 1.5-2.5 1.5Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8.25c-1.336 0-2.5-.54-2.5-1.5S10.664 5.25 12 5.25c1.336 0 2.5.54 2.5 1.5S13.336 8.25 12 8.25Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.875 14.25c-1.336 0-2.5-.54-2.5-1.5s1.164-1.5 2.5-1.5c1.336 0 2.5.54 2.5 1.5S9.211 14.25 7.875 14.25Z" />
             <path strokeLinecap="round" strokeLinejoin="round" d="M16.125 14.25c-1.336 0-2.5-.54-2.5-1.5s1.164-1.5 2.5-1.5c1.336 0 2.5.54 2.5 1.5S17.461 14.25 16.125 14.25Z" />
          </svg>
          <h1 className="text-xl font-semibold text-sky-400">GA4 AI Analyst</h1>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleClearSessionClick}
            title="Clear current session and data"
            className="text-xs text-amber-400 hover:text-amber-300 transition-colors p-1 rounded hover:bg-slate-700 flex items-center space-x-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12.56 0c1.153 0 2.243.096 3.222.261m3.222.261L12 5.825M12 5.825a2.25 2.25 0 0 1-2.25-2.25h4.5A2.25 2.25 0 0 1 12 5.825Z" />
            </svg>
            <span>Clear Session</span>
          </button>
          <a 
            href="https://ai.google.dev/gemini-api" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-slate-400 hover:text-sky-300 transition-colors"
          >
            Powered by Gemini
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;

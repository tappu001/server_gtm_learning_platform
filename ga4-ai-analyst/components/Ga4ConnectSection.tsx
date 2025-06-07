
import React from 'react';

interface Ga4ConnectSectionProps {
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  isLoading: boolean;
  disabled: boolean;
  googleClientIdIsSet: boolean;
}

const Ga4ConnectSection: React.FC<Ga4ConnectSectionProps> = ({ isConnected, onConnect, onDisconnect, isLoading, disabled, googleClientIdIsSet }) => {
  return (
    <div className="p-5 bg-slate-800 shadow-xl rounded-xl my-4 mx-auto max-w-3xl">
      <h2 className="text-xl font-semibold mb-4 text-sky-300">Method 4: GA4 Connection (Simulated)</h2>
      
      {!googleClientIdIsSet && (
        <p className="text-yellow-300 bg-yellow-900/30 p-2.5 rounded-lg mb-3.5 text-xs border border-yellow-700">
          <strong>Notice:</strong> <code>GOOGLE_CLIENT_ID</code> not set. 
          Real GA4 connection needs this for OAuth 2.0. This is simulated.
        </p>
      )}

      {isConnected ? (
        <div className="text-center">
          <p className="text-green-400 text-md mb-3.5 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mr-1.5">
              <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.06 0l4-5.5Z" clipRule="evenodd" />
            </svg>
            'Connected' to Google Analytics (Simulated).
          </p>
          <button
            onClick={onDisconnect}
            disabled={disabled || isLoading}
            className="px-5 py-2 bg-gradient-to-br from-amber-500 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto space-x-1.5 btn-action"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
            </svg>
            <span>Disconnect</span>
          </button>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-slate-400 mb-3.5 text-xs">
            Simulate connecting to Google Analytics. In a real app, this uses Google OAuth 2.0.
          </p>
          <button
            onClick={onConnect}
            disabled={disabled || isLoading}
            className="px-5 py-2.5 bg-gradient-to-br from-teal-500 to-teal-700 hover:from-teal-600 hover:to-teal-800 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mx-auto space-x-1.5 btn-action"
          >
            {isLoading ? (
              <svg className="loading-spinner-svg mr-1.5" aria-hidden="true" focusable="false" role="status">
                <use href="#loading-spinner"></use>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1.5">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
              </svg>
            )}
            <span>{isLoading ? 'Connecting...' : 'Connect GA4 (Simulated)'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default Ga4ConnectSection;
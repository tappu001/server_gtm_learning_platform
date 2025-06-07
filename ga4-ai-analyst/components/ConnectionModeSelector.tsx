
import React from 'react';
import { ConnectionMode } from '../types';

interface ConnectionModeSelectorProps {
  onSelectMode: (mode: ConnectionMode) => void;
  googleClientIdIsSet: boolean; 
}

const ConnectionModeButton: React.FC<{
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  gradientFrom: string;
  gradientTo: string;
  disabled?: boolean;
  tooltip?: string;
}> = ({ onClick, icon, label, gradientFrom, gradientTo, disabled, tooltip }) => (
  <div className={`relative group ${disabled ? 'cursor-not-allowed' : ''}`}>
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full md:w-auto px-5 py-2.5 text-sm font-medium text-white rounded-lg shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-white flex items-center justify-center space-x-2.5 bg-gradient-to-br ${gradientFrom} ${gradientTo} disabled:opacity-60 disabled:cursor-not-allowed btn-action`}
      aria-describedby={disabled && tooltip ? `tooltip-${label.replace(/\s+/g, '-')}` : undefined}
    >
      {icon}
      <span>{label}</span>
    </button>
    {disabled && tooltip && (
      <div id={`tooltip-${label.replace(/\s+/g, '-')}`} role="tooltip" className="absolute z-10 bottom-full mb-1.5 w-max max-w-xs px-2.5 py-1 text-xs font-normal text-white bg-slate-700 rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 invisible group-hover:visible left-1/2 -translate-x-1/2">
        {tooltip}
        <div className="tooltip-arrow" data-popper-arrow></div>
      </div>
    )}
  </div>
);


const ConnectionModeSelector: React.FC<ConnectionModeSelectorProps> = ({ onSelectMode, googleClientIdIsSet }) => {
  return (
    <div className="p-5 bg-slate-800 shadow-xl rounded-xl my-4 mx-auto max-w-xl text-center">
      <h2 className="text-xl font-semibold mb-6 text-sky-300">Choose Data Source Method</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <ConnectionModeButton
          onClick={() => onSelectMode('json')}
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>}
          label="Pasted JSON Data"
          gradientFrom="from-sky-500"
          gradientTo="to-sky-700"
        />
        <ConnectionModeButton
          onClick={() => onSelectMode('googleSheet')}
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z" /></svg>}
          label="Google Sheet URL"
          gradientFrom="from-green-500"
          gradientTo="to-green-700"
        />
        <ConnectionModeButton
          onClick={() => onSelectMode('googleDoc')}
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125V5.25A2.25 2.25 0 0 0 11.25 3H6.75A2.25 2.25 0 0 0 4.5 5.25v13.5A2.25 2.25 0 0 0 6.75 21h10.5A2.25 2.25 0 0 0 19.5 18.75v-1.5M16.5 8.25H9m7.5 3H9m7.5 3H9" /></svg>}
          label="Google Document URL"
          gradientFrom="from-purple-500"
          gradientTo="to-purple-700"
        />
        <ConnectionModeButton
          onClick={() => onSelectMode('ga4')}
          icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /></svg>}
          label="GA4 (Simulated)"
          gradientFrom="from-teal-500"
          gradientTo="to-teal-700"
          disabled={!googleClientIdIsSet} // Still keep the GOOGLE_CLIENT_ID check for simulated GA4
          tooltip={!googleClientIdIsSet ? "GOOGLE_CLIENT_ID not set. This is not strictly required for the current *simulated* GA4 mode, but would be for a real connection." : undefined}
        />
      </div>
    </div>
  );
};

export default ConnectionModeSelector;
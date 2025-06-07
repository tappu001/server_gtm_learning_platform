import React from 'react';
import { ConnectionMode } from '../types';

interface ApiConfigStatusProps {
  geminiApiKeyIsSet: boolean;
  googleClientIdIsSet: boolean;
  connectionMode: ConnectionMode;
}

const ApiConfigStatus: React.FC<ApiConfigStatusProps> = ({ geminiApiKeyIsSet, googleClientIdIsSet, connectionMode }) => {
  const messages = [];

  if (geminiApiKeyIsSet) {
    messages.push(
      <p key="gemini-ok" className="text-green-300">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 inline mr-0.5">
          <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm3.854-9.854a.5.5 0 0 0-.708-.708L7.5 8.293 6.354 7.146a.5.5 0 1 0-.708.708l1.5 1.5a.5.5 0 0 0 .708 0l3-3Z" clipRule="evenodd" />
        </svg>
        Gemini API Key OK.
      </p>
    );
  } else {
    messages.push(
      <p key="gemini-error" className="text-red-300 font-medium">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 inline mr-0.5">
          <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM6.78 5.72a.5.5 0 0 0-.707.707L7.293 8l-1.22 1.22a.5.5 0 1 0 .707.707L8 8.707l1.22 1.22a.5.5 0 1 0 .707-.707L8.707 8l1.22-1.22a.5.5 0 0 0-.707-.707L8 7.293 6.78 5.72Z" clipRule="evenodd" />
        </svg>
        Error: Gemini API Key (API_KEY) missing.
      </p>
    );
  }

  if (connectionMode === 'ga4') { // Only show GOOGLE_CLIENT_ID status if in GA4 mode
    if (googleClientIdIsSet) {
      messages.push(
        <p key="gcloud-ok" className="text-green-300">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 inline mr-0.5">
             <path fillRule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm3.854-9.854a.5.5 0 0 0-.708-.708L7.5 8.293 6.354 7.146a.5.5 0 1 0-.708.708l1.5 1.5a.5.5 0 0 0 .708 0l3-3Z" clipRule="evenodd" />
          </svg>
          GOOGLE_CLIENT_ID OK (for real GA4).
        </p>
      );
    } else {
      messages.push(
        <p key="gcloud-warn" className="text-yellow-300">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 inline mr-0.5">
            <path fillRule="evenodd" d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0ZM7.5 1.752a6.502 6.502 0 0 1 .494.032l.01.002.01.002A6.5 6.5 0 0 0 4.028 1.93l-.004-.002-.005-.001a.25.25 0 0 1-.257-.442l.03-.018A6.5 6.5 0 0 1 7.5 1.252Zm1 0a.25.25 0 0 0-.028.482l.004.002.005.001A6.5 6.5 0 0 1 11.972 1.93l.004-.002.005-.001a.25.25 0 1 0 .257-.442l-.03-.018A6.5 6.5 0 0 0 8.5 1.252ZM8 11.5a.5.5 0 0 1-.5-.5V6a.5.5 0 0 1 1 0v5a.5.5 0 0 1-.5.5Zm0-7a.5.5 0 1 1 0-1 .5.5 0 0 1 0 1Z" clipRule="evenodd" />
          </svg>
          Warning: GOOGLE_CLIENT_ID missing (for real GA4).
        </p>
      );
    }
  }

  if (messages.length === 0) return null;

  return (
    <div className={`text-xs p-1.5 text-center shadow ${!geminiApiKeyIsSet ? 'bg-red-700/80 text-white' : 'bg-slate-700/80 text-slate-300'} `}>
      {messages.map((msg, index) => <span key={index} className="inline-block mx-1.5">{msg}</span>)}
    </div>
  );
};

export default ApiConfigStatus;
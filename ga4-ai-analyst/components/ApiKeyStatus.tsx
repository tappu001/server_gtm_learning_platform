
import React from 'react';

interface ApiConfigStatusProps {
  geminiApiKeyIsSet: boolean;
  googleClientIdIsSet: boolean;
  connectionMode: 'json' | 'ga4' | null;
}

const ApiConfigStatus: React.FC<ApiConfigStatusProps> = ({ geminiApiKeyIsSet, googleClientIdIsSet, connectionMode }) => {
  const messages = [];

  if (geminiApiKeyIsSet) {
    messages.push(
      <p key="gemini-ok" className="text-green-300">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 inline mr-1">
          <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.06 0l4-5.5Z" clipRule="evenodd" />
        </svg>
        Gemini API Key (API_KEY) is configured.
      </p>
    );
  } else {
    messages.push(
      <p key="gemini-error" className="text-red-300 font-semibold">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 inline mr-1">
          <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z" clipRule="evenodd" />
        </svg>
        Error: Gemini API Key (API_KEY) is not set. The application requires this key.
      </p>
    );
  }

  if (connectionMode === 'ga4') {
    if (googleClientIdIsSet) {
      messages.push(
        <p key="gcloud-ok" className="text-green-300">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 inline mr-1">
            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.06 0l4-5.5Z" clipRule="evenodd" />
          </svg>
          Google Client ID (GOOGLE_CLIENT_ID) is configured (required for real GA4 connection).
        </p>
      );
    } else {
      messages.push(
        <p key="gcloud-warn" className="text-yellow-300">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 inline mr-1">
            <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM8.982 1.076a.5.5 0 0 1 .056.936L9 2.018l.018-.006a8.002 8.002 0 0 0-4.96-.142L4 1.864l-.009.006a.5.5 0 0 1-.523-.872l.06-.035A8.001 8.001 0 0 1 8.982 1.076ZM11.018 1.076a.5.5 0 0 0-.056.936L11 2.018l-.018-.006a8.002 8.002 0 0 1 4.96-.142L16 1.864l.009.006a.5.5 0 1 0 .523-.872l-.06-.035a8.001 8.001 0 0 0-5.454-1.9ZM10 14.5a1 1 0 0 1-1-1V9a1 1 0 1 1 2 0v4.5a1 1 0 0 1-1 1Zm0-8.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" clipRule="evenodd" />
          </svg>
          Warning: Google Client ID (GOOGLE_CLIENT_ID) is not set. This will be required for a live GA4 connection. (Simulated connection will still work).
        </p>
      );
    }
  }


  if (messages.length === 0) return null;

  return (
    <div className={`text-xs p-2 text-center shadow-md ${!geminiApiKeyIsSet ? 'bg-red-700 text-white' : 'bg-slate-700 text-slate-200'} `}>
      {messages.map((msg, index) => <span key={index} className="block">{msg}</span>)}
    </div>
  );
};

export default ApiConfigStatus;

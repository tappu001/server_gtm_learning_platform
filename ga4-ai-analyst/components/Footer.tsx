import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-800 text-center p-3 mt-6 text-slate-500 text-xs border-t border-slate-700/50">
      <p>&copy; {new Date().getFullYear()} GA4 AI Analyst. For demonstration purposes.</p>
      <p className="mt-0.5">
        Always verify critical insights with original data sources.
      </p>
    </footer>
  );
};

export default Footer;
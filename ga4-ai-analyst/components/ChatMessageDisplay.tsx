
import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { ChatMessage, MessageSender, ChartJsData, TableData } from '../types';

declare var Chart: any; // Ensure Chart is available globally via CDN 

interface ChatMessageDisplayProps {
  message: ChatMessage;
}

const BotAvatar: React.FC = () => (
  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-500 to-sky-600 flex items-center justify-center mr-2 flex-shrink-0 shadow-md">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-white">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-7.5h12c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125h-12c-.621 0-1.125.504-1.125 1.125v3.375c0 .621.504 1.125 1.125 1.125Z" />
    </svg>
  </div>
);

const UserAvatar: React.FC = () => (
  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center ml-2 flex-shrink-0 shadow-md">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-white">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
    </svg>
  </div>
);


const ChatMessageDisplay: React.FC<ChatMessageDisplayProps> = ({ message }) => {
  const isUser = message.sender === MessageSender.USER;
  const isBot = message.sender === MessageSender.BOT;
  const isSystem = message.sender === MessageSender.SYSTEM;

  const baseBubbleClasses = "p-2.5 rounded-lg break-words shadow-md text-sm";
  // Apply gradient classes from index.html
  const userBubbleClasses = "user-bubble-gradient text-white self-end"; 
  const botBubbleClasses = "bot-bubble-gradient text-slate-50 self-start";
  const systemBubbleClasses = "bg-slate-700 text-slate-300 self-center text-xs italic text-center w-full max-w-full my-1 py-1.5 px-3";

  const bubbleClasses = isUser ? userBubbleClasses : (isBot ? botBubbleClasses : systemBubbleClasses);

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<any>(null);

  const defaultChartOptions = useMemo((): ChartJsData['options'] => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
          legend: { display: true, position: 'top', labels: { color: '#e2e8f0', font: { size: 11 }, boxWidth: 12, padding: 10 }}, // Light color for dark bubble
          title: { display: true, text: 'Chart', color: '#f1f5f9', font: { size: 14, weight: '500' }, padding: { top: 8, bottom: 12 }}, // Lighter color
          tooltip: {
              enabled: true, mode: 'index', intersect: false,
              backgroundColor: 'rgba(15, 23, 42, 0.9)', titleColor: '#94a3b8', titleFont: { weight: 'bold', size: 12 }, // Darker tooltip
              bodyColor: '#e2e8f0', bodyFont: { size: 11 }, borderColor: 'rgba(51, 65, 85, 0.8)',
              borderWidth: 1, padding: 8, caretPadding: 8, cornerRadius: 4, boxPadding: 3,
          }
      },
      scales: {
          x: { display: true, border: { display: false, color: 'rgba(100, 116, 139, 0.6)' }, grid: { display: true, color: 'rgba(71, 85, 105, 0.5)', drawBorder: false }, ticks: { color: '#cbd5e1', font: { size: 10 }, maxRotation: 45, minRotation: 0 }, title: { display: false, text: 'X-Axis', color: '#cbd5e1', font: {size: 11, weight: '500'}} },
          y: { display: true, border: { display: false, color: 'rgba(100, 116, 139, 0.6)' }, grid: { display: true, color: 'rgba(71, 85, 105, 0.5)', drawBorder: false }, ticks: { color: '#cbd5e1', font: { size: 10 } }, beginAtZero: true, title: { display: false, text: 'Y-Axis', color: '#cbd5e1', font: {size: 11, weight: '500'}} }
      },
      animation: { duration: 300, easing: 'easeOutQuart' },
      layout: { padding: { top: 0, right: 5, bottom: 0, left: 0 } }
  }), []);


  const getMergedChartOptions = useCallback((incomingOptions?: ChartJsData['options']): ChartJsData['options'] => {
    if (!defaultChartOptions) return incomingOptions || {};
    if (!incomingOptions) return defaultChartOptions;
    const merged: ChartJsData['options'] = { ...defaultChartOptions, ...incomingOptions };
    merged.plugins = { ...(defaultChartOptions.plugins || {}), ...(incomingOptions.plugins || {}) };
    if (merged.plugins.title || defaultChartOptions.plugins?.title || incomingOptions.plugins?.title) {
        merged.plugins.title = { ...(defaultChartOptions.plugins?.title || {}), ...(incomingOptions.plugins?.title || {}), font: { ...(defaultChartOptions.plugins?.title?.font || {}), ...(incomingOptions.plugins?.title?.font || {}) }, padding: { ...(defaultChartOptions.plugins?.title?.padding || {}), ...(incomingOptions.plugins?.title?.padding || {}) } };
    }
    if (merged.plugins.legend || defaultChartOptions.plugins?.legend || incomingOptions.plugins?.legend) {
        merged.plugins.legend = { ...(defaultChartOptions.plugins?.legend || {}), ...(incomingOptions.plugins?.legend || {}), labels: { ...(defaultChartOptions.plugins?.legend?.labels || {}), ...(incomingOptions.plugins?.legend?.labels || {}), font: { ...(defaultChartOptions.plugins?.legend?.labels?.font || {}), ...(incomingOptions.plugins?.legend?.labels?.font || {}) } } };
    }
    if (merged.plugins.tooltip || defaultChartOptions.plugins?.tooltip || incomingOptions.plugins?.tooltip) {
        merged.plugins.tooltip = { ...(defaultChartOptions.plugins?.tooltip || {}), ...(incomingOptions.plugins?.tooltip || {}), titleFont: { ...(defaultChartOptions.plugins?.tooltip?.titleFont || {}), ...(incomingOptions.plugins?.tooltip?.titleFont || {}) }, bodyFont: { ...(defaultChartOptions.plugins?.tooltip?.bodyFont || {}), ...(incomingOptions.plugins?.tooltip?.bodyFont || {}) } };
    }
    merged.scales = { ...(defaultChartOptions.scales || {}), ...(incomingOptions.scales || {}) };
    const mergeScaleOptions = (defaultScale?: any, incomingScale?: any) => {
        if (incomingScale === null) return undefined; 
        if (!defaultScale && !incomingScale) return undefined;
        return { ...(defaultScale || {}), ...(incomingScale || {}), border: { ...(defaultScale?.border || {}), ...(incomingScale?.border || {}) }, grid: { ...(defaultScale?.grid || {}), ...(incomingScale?.grid || {}) }, ticks: { ...(defaultScale?.ticks || {}), ...(incomingScale?.ticks || {}), font: { ...(defaultScale?.ticks?.font || {}), ...(incomingScale?.ticks?.font || {}) } }, title: { ...(defaultScale?.title || {}), ...(incomingScale?.title || {}), font: { ...(defaultScale?.title?.font || {}), ...(incomingScale?.title?.font || {}) } } };
    };
    merged.scales.x = mergeScaleOptions(defaultChartOptions.scales?.x, incomingOptions.scales?.x);
    merged.scales.y = mergeScaleOptions(defaultChartOptions.scales?.y, incomingOptions.scales?.y);
    merged.animation = { ...(defaultChartOptions.animation || {}), ...(incomingOptions.animation || {}) };
    merged.layout = { ...(defaultChartOptions.layout || {}), ...(incomingOptions.layout || {}) };
    if (incomingOptions.scales?.x?.display === false && merged.scales?.x) merged.scales.x.display = false;
    else if (merged.scales?.x && defaultChartOptions.scales?.x?.display !== undefined && incomingOptions.scales?.x?.display === undefined) merged.scales.x.display = defaultChartOptions.scales.x.display;
    if (incomingOptions.scales?.y?.display === false && merged.scales?.y) merged.scales.y.display = false;
    else if (merged.scales?.y && defaultChartOptions.scales?.y?.display !== undefined && incomingOptions.scales?.y?.display === undefined) merged.scales.y.display = defaultChartOptions.scales.y.display;
    if ((message.chartData?.type === 'pie' || message.chartData?.type === 'doughnut')) {
        if (merged.scales?.x && incomingOptions.scales?.x?.display === undefined) merged.scales.x.display = false;
        if (merged.scales?.y && incomingOptions.scales?.y?.display === undefined) merged.scales.y.display = false;
        if (merged.plugins?.legend && incomingOptions.plugins?.legend?.display === undefined) merged.plugins.legend.display = true;
    }
    return merged;
  }, [defaultChartOptions, message.chartData?.type]);

  useEffect(() => {
    if (message.chartData && chartRef.current) {
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        try {
            const finalOptions = getMergedChartOptions(message.chartData.options);
            chartInstanceRef.current = new Chart(ctx, {
                type: message.chartData.type,
                data: message.chartData.data,
                options: finalOptions
            });
        } catch(e) {
            console.error("Chart.js error:", e, "\nData for chart:", JSON.stringify(message.chartData, null, 2));
        }
      }
    }
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [message.chartData, getMergedChartOptions]);

  const renderTextWithCodeHighlighting = (text: any) => {
    if (typeof text !== 'string') {
      return text; 
    }
    if (!text) return null;

    const normalizedText = text.replace(/\\n/g, '\n');
    const parts = normalizedText.split(/(```[\s\S]*?```|`[^`]+`)/g);

    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const codeContent = part.substring(3, part.length - 3).trim();
        const language = codeContent.startsWith('{') || codeContent.startsWith('[') ? 'json' : '';
        return (
          <pre key={index} className={`bg-slate-800/70 p-2 my-1.5 rounded-md text-xs overflow-x-auto whitespace-pre-wrap border border-slate-600 ${language ? `language-${language}` : ''}`}>
            <code>{codeContent}</code>
          </pre>
        );
      } else if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={index} className="bg-slate-600/50 px-1 py-0.5 rounded text-rose-300 text-xs">{part.substring(1, part.length - 1)}</code>;
      } else {
        return part.split('\n').map((line, lineIndex, arr) => (
          <React.Fragment key={`${index}-${lineIndex}`}>
            {line}
            {lineIndex < arr.length - 1 && <br />}
          </React.Fragment>
        ));
      }
    });
  };
  
  const renderTable = (tableData: TableData) => {
    if (!tableData || !tableData.headers || !tableData.rows) return null;
    return (
      <div className="mt-2 overflow-x-auto scrollbar-thin bg-slate-700/50 p-2 rounded-md shadow-inner">
        <table className="min-w-full text-xs border-collapse border border-slate-500">
          <thead className="bg-slate-600/70">
            <tr>
              {tableData.headers.map((header, index) => (
                <th key={index} className="p-1.5 border border-slate-500 text-left font-medium text-slate-100">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="even:bg-slate-700/30 hover:bg-sky-700/30">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="p-1.5 border border-slate-500 text-slate-100 align-top">
                    {typeof cell === 'number' ? cell.toLocaleString() : cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  const messageContainerBaseClass = "flex mb-3 items-end animate-fadeInSoft";
  const bubbleWidthClass = (message.chartData || message.tableData) 
    ? 'w-full md:w-5/6 lg:w-4/5 xl:w-3/4' 
    : 'max-w-lg';


  return (
    <div className={`${messageContainerBaseClass} ${isUser ? 'justify-end' : (isBot ? 'justify-start' : 'justify-center w-full')}`}
    >
      {isBot && <BotAvatar />}
      <div className={`${baseBubbleClasses} ${bubbleClasses} ${isBot ? bubbleWidthClass : ''} ${isSystem ? 'rounded-full' : 'rounded-xl'}`}>
        {message.icon && typeof message.text !== 'string' && <span className="mr-2 align-middle inline-block">{message.icon}</span>}
        {message.icon && typeof message.text === 'string' && !message.text.includes(BOT_PROCESSING_TEXT) && <span className="mr-2 align-middle inline-block">{message.icon}</span>}

        {renderTextWithCodeHighlighting(message.text)}
        
        {message.tableData && renderTable(message.tableData)}

        {message.chartData && (
          <div className="mt-2 bg-slate-700/50 p-2 rounded-md shadow-inner">
            <div style={{ 
                position: 'relative', 
                height: message.chartData.type === 'pie' || message.chartData.type === 'doughnut' ? '300px' : '280px', 
                width: '100%'
            }}>
                 <canvas ref={chartRef} aria-label={message.chartData.options?.plugins?.title?.text || 'Chart'} role="img"></canvas>
            </div>
          </div>
        )}

        {!isSystem && (
            <p className={`text-xs mt-1.5 ${isUser ? 'text-indigo-200' : 'text-sky-200/80'} ${isUser ? 'text-right' : 'text-left'}`}>
              {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
        )}
      </div>
      {isUser && <UserAvatar />}
    </div>
  );
};

// Keyframes are now in index.html
const BOT_PROCESSING_TEXT = "Processing...";
export default ChatMessageDisplay;
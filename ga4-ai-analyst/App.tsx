
import React, { useState, useEffect, useCallback, ReactNode } from 'react';
import { ChatMessage, MessageSender, Ga4Data, ConnectionMode, ChartJsData, SheetData, DocData, TableData, AppStateToStore } from './types';
import { analyzeGa4Data, getSuggestedQuestions, AnalyzeParams } from './services/geminiService';
import Header from './components/Header';
import Footer from './components/Footer';
import DataInputSection from './components/DataInputSection';
import ChatInterface from './components/ChatInterface';
import ApiConfigStatus from './components/ApiConfigStatus';
import ConnectionModeSelector from './components/ConnectionModeSelector';
import Ga4ConnectSection from './components/Ga4ConnectSection';
import GoogleSheetInputSection from './components/GoogleSheetInputSection';
import GoogleDocInputSection from './components/GoogleDocInputSection'; // New

// Local Storage Keys
const LOCAL_STORAGE_KEY = 'ga4AiAnalystSession_v2'; // Increment version if state structure changes significantly

// Helper for system message icons
const SystemMessageIcon: React.FC<{ type: 'info' | 'warning' | 'error' | 'success' | 'config' | 'chat' | 'load' | 'doc'}> = ({ type }) => {
  const baseClass = "w-3.5 h-3.5 inline-block mr-1.5 align-middle";
  switch (type) {
    case 'info': return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${baseClass} text-sky-400`}><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" /></svg>;
    case 'warning': return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${baseClass} text-yellow-400`}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>;
    case 'error': return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${baseClass} text-red-400`}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>;
    case 'success': return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${baseClass} text-green-400`}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
    case 'config': return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${baseClass} text-slate-400`}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m18 0h-1.5m-15.036-7.12L4.604 3.386m14.792 1.472L19.396 3.386M12 19.5V21m0-18v1.5m-6.036 0L4.604 6.386m14.792 0L19.396 6.386" /></svg>;
    case 'chat': return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${baseClass} text-sky-400`}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3.697-3.697c-.021-.021-.036-.044-.054-.067C13.67 15.753 12.25 14.85 12 13.5c-.25-.39-.428-.79-.571-1.191M11.75 11.25c0 .341-.024.675-.071.997m0 0A10.5 10.5 0 0 1 12 11.25m0 0c.264 0 .522.015.776.042M6.75 11.25m0 0A4.5 4.5 0 0 1 12 6.75m0 0A4.5 4.5 0 0 1 17.25 11.25M6.75 11.25S4.5 14.25 4.5 15.75v.231c0 .404.324.731.729.731h5.044c.405 0 .73-.327.73-.731V15.75C11.25 14.25 9 11.25 9 11.25s-1.125 0-2.25 0Z" /></svg>;
    case 'load': return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${baseClass} text-teal-400`}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 12 3 3m0 0 3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" /></svg>;
    case 'doc': return <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`${baseClass} text-purple-400`}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h4.5m-4.5 0H5.625c-.621 0-1.125-.504-1.125-1.125V11.25m0-4.5v-1.5c0-.621.504-1.125 1.125-1.125H10.5m5.508-1.898A8.967 8.967 0 0 1 12 2.25C11.172 2.25 10.388 2.422 9.68 2.738m5.828 11.722A3.375 3.375 0 0 1 17.25 10.5h1.5a.75.75 0 0 0 .75-.75V6.375a.75.75 0 0 0-.75-.75h-1.5A3.375 3.375 0 0 1 13.5 3H8.25M9 19.5V12m0 0H6.75M9 12l-2.25-2.25" /></svg>;
    default: return null;
  }
};

const BOT_PROCESSING_TEXT = "Processing...";

const App: React.FC = () => {
  const [geminiApiKeyIsSet, setGeminiApiKeyIsSet] = useState<boolean>(false);
  const [googleClientIdIsSet, setGoogleClientIdIsSet] = useState<boolean>(false);
  
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>(null);
  
  const [ga4Data, setGa4Data] = useState<Ga4Data | null>(null); // Full data for JSON mode
  const [isJsonDataLoaded, setIsJsonDataLoaded] = useState<boolean>(false);
  
  const [isGa4Connected, setIsGa4Connected] = useState<boolean>(false); // Simulated GA4
  const [ga4User, setGa4User] = useState<string | null>(null);
  
  const [sheetData, setSheetData] = useState<SheetData | null>(null); // Full data for Sheet mode
  const [isSheetDataLoaded, setIsSheetDataLoaded] = useState<boolean>(false);
  const [sheetFileName, setSheetFileName] = useState<string | undefined>(undefined);

  const [docData, setDocData] = useState<DocData | null>(null); // Full data for Doc mode
  const [isDocDataLoaded, setIsDocDataLoaded] = useState<boolean>(false);
  const [docFileName, setDocFileName] = useState<string | undefined>(undefined);
  
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [appError, setAppError] = useState<string | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  
  useEffect(() => {
    try {
      const savedStateString = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedStateString) {
        const savedState: AppStateToStore & { ga4Data?: Ga4Data, sheetData?: SheetData, docData?: DocData } = JSON.parse(savedStateString);
        
        if (Array.isArray(savedState.chatHistory)) {
          const deserializedChatHistory = savedState.chatHistory.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp) 
          }));
          setChatHistory(deserializedChatHistory);
        }

        setConnectionMode(savedState.connectionMode);
        
        setIsJsonDataLoaded(savedState.isJsonDataLoaded);
        if (savedState.isJsonDataLoaded && savedState.ga4Data) setGa4Data(savedState.ga4Data); 
        
        setIsSheetDataLoaded(savedState.isSheetDataLoaded);
        if (savedState.isSheetDataLoaded && savedState.sheetData) setSheetData(savedState.sheetData);
        if (savedState.sheetDataSummary?.fileName) setSheetFileName(savedState.sheetDataSummary.fileName);

        setIsDocDataLoaded(savedState.isDocDataLoaded || false);
        if (savedState.isDocDataLoaded && savedState.docData) setDocData(savedState.docData);
        if (savedState.docDataSummary?.fileName) setDocFileName(savedState.docDataSummary.fileName);
        
        setIsGa4Connected(savedState.isGa4Connected);
        setGa4User(savedState.ga4User);
        
        if (savedState.connectionMode) {
           addSystemMessage("Session restored. Continue where you left off or change data source.", "session-restored", 'info');
           // Re-fetch suggested questions if data was loaded
           if (savedState.isJsonDataLoaded && savedState.ga4Data) fetchSuggestedQuestions(savedState.ga4Data, 'json');
           else if (savedState.isSheetDataLoaded && savedState.sheetData) fetchSuggestedQuestions(savedState.sheetData, 'googleSheet');
           else if (savedState.isDocDataLoaded && savedState.docData) fetchSuggestedQuestions(savedState.docData, 'googleDoc');
        }
      }
    } catch (error) {
      console.error("Error loading state from local storage:", error);
      localStorage.removeItem(LOCAL_STORAGE_KEY); 
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on initial mount

  // Save state to local storage whenever critical parts change
  useEffect(() => {
    const stateToSave: AppStateToStore & { ga4Data?: Ga4Data, sheetData?: SheetData, docData?: DocData } = {
      chatHistory,
      connectionMode,
      isJsonDataLoaded,
      ga4Data: isJsonDataLoaded ? ga4Data : undefined, 
      ga4DataSummary: isJsonDataLoaded && ga4Data ? { rowCount: Array.isArray(ga4Data) ? ga4Data.length : undefined, headers: Array.isArray(ga4Data) && ga4Data.length > 0 ? Object.keys(ga4Data[0]) : Object.keys(ga4Data || {}) } : undefined,
      isSheetDataLoaded,
      sheetData: isSheetDataLoaded ? sheetData : undefined,
      sheetDataSummary: isSheetDataLoaded && sheetData && sheetData.length > 0 ? { fileName: sheetFileName, rowCount: sheetData.length, headers: Object.keys(sheetData[0] || {}) } : undefined,
      isDocDataLoaded,
      docData: isDocDataLoaded ? docData : undefined,
      docDataSummary: isDocDataLoaded && docData ? { fileName: docFileName, charCount: docData.length } : undefined,
      isGa4Connected,
      ga4User,
    };
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Error saving state to local storage:", error);
      // Potentially notify user if storage is full
    }
  }, [chatHistory, connectionMode, isJsonDataLoaded, ga4Data, isSheetDataLoaded, sheetData, sheetFileName, isDocDataLoaded, docData, docFileName, isGa4Connected, ga4User]);

  const clearSession = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setConnectionMode(null);
    setGa4Data(null);
    setIsJsonDataLoaded(false);
    setSheetData(null);
    setIsSheetDataLoaded(false);
    setSheetFileName(undefined);
    setDocData(null);
    setIsDocDataLoaded(false);
    setDocFileName(undefined);
    setIsGa4Connected(false);
    setGa4User(null);
    setChatHistory([]); 
    setAppError(null);
    setSuggestedQuestions([]);
    addSystemMessage("Session cleared. Please choose a data source method to begin.", "session-cleared", "config");
  }, []);


  const addMessageToHistory = useCallback((text: string, sender: MessageSender, chartData?: ChartJsData, tableData?: TableData, icon?: ReactNode, avatarUrl?: string) => {
    setChatHistory(prev => [
      ...prev,
      { id: `${sender}-${Date.now()}-${Math.random()}`, text, sender, timestamp: new Date(), chartData, tableData, icon, avatarUrl }
    ]);
  }, []);
  
  const addSystemMessage = useCallback((text: string, idSuffix: string, type: 'info' | 'warning' | 'error' | 'success' | 'config' | 'chat' | 'load' | 'doc' = 'info') => {
    setChatHistory(prev => {
      const id = `system-${idSuffix}-${Date.now()}`;
      // Avoid duplicate consecutive system messages of the same type/text (except errors or thinking)
      const lastMessage = prev[prev.length -1];
      if (lastMessage && lastMessage.sender === MessageSender.SYSTEM && lastMessage.text === text && !idSuffix.startsWith('thinking') && type !== 'error') {
         return prev;
      }
      return [...prev, { id, text, sender: MessageSender.SYSTEM, timestamp: new Date(), icon: <SystemMessageIcon type={type}/> }];
    });
  }, []);

  useEffect(() => {
    const geminiKey = process.env.API_KEY;
    const googleClient = process.env.GOOGLE_CLIENT_ID;

    if (geminiKey && geminiKey.trim() !== "") setGeminiApiKeyIsSet(true);
    else {
      setGeminiApiKeyIsSet(false);
      addSystemMessage('Critical: Gemini API Key (API_KEY) is not configured. The app cannot function.', 'gemini-key-error', 'error');
    }
    setGoogleClientIdIsSet(!!(googleClient && googleClient.trim() !== ""));
  }, [addSystemMessage]);
  
  useEffect(() => {
    if (!geminiApiKeyIsSet) return;
    const nonSystemMessagesExist = chatHistory.some(msg => msg.sender !== MessageSender.SYSTEM);
    const welcomeMessagesMissing = !chatHistory.some(m => m.id.startsWith('system-welcome-select-mode') && m.id.includes(LOCAL_STORAGE_KEY)); // Check specific welcome msg

    // Only add general info if no session was restored or it's a truly fresh start
    if (chatHistory.length === 0 || (welcomeMessagesMissing && !nonSystemMessagesExist)) {
        addSystemMessage("Chart Feature: Try 'show me a bar chart of X by Y'. Chart generation is experimental.", `welcome-info-chart-${LOCAL_STORAGE_KEY}`, 'info');
        addSystemMessage("Table Feature: The AI may present data in tables for clarity.", `welcome-info-table-${LOCAL_STORAGE_KEY}`, 'info');
        addSystemMessage("Suggestions Feature: After loading data, AI may suggest questions.", `welcome-info-suggestions-${LOCAL_STORAGE_KEY}`, 'info');
    }


    if (connectionMode === null && (welcomeMessagesMissing || chatHistory.length === 0) && !nonSystemMessagesExist) {
      addSystemMessage("Welcome! Please choose a data source method to begin.", `welcome-select-mode-${LOCAL_STORAGE_KEY}`, 'chat');
    } else if (connectionMode === 'json' && !isJsonDataLoaded) {
      addSystemMessage("Paste GA4 JSON data above and click 'Load Data'.", "json-prompt", 'load');
    } else if (connectionMode === 'ga4' && !isGa4Connected) {
      if (!googleClientIdIsSet) addSystemMessage("GOOGLE_CLIENT_ID not set. GA4 connection is simulated.", "ga4-clientid-missing-warn", 'warning');
      addSystemMessage("Click 'Connect to Google Analytics (Simulated)' to proceed.", "ga4-prompt", 'config');
    } else if (connectionMode === 'googleSheet' && !isSheetDataLoaded) {
      addSystemMessage("Enter a public Google Sheet URL and click 'Load Sheet Data'.", "google-sheet-prompt", 'load');
      addSystemMessage("Note: For AI analysis of Google Sheets, modification requests will be understood, but the AI will only describe the changes it *would* make as direct editing is not currently supported.", "sheet-edit-info", "info");
    } else if (connectionMode === 'googleDoc' && !isDocDataLoaded) {
      addSystemMessage("Enter a public Google Document URL and click 'Load Document'.", "google-doc-prompt", 'doc');
    }
  }, [geminiApiKeyIsSet, connectionMode, isJsonDataLoaded, isGa4Connected, isSheetDataLoaded, isDocDataLoaded, addSystemMessage, googleClientIdIsSet, chatHistory]);

  const fetchSuggestedQuestions = async (data: Ga4Data | SheetData | DocData | null, mode: 'json' | 'googleSheet' | 'googleDoc') => {
      if (!data || !geminiApiKeyIsSet) return;
      setSuggestedQuestions([]); 
      const loadingMsgId = `suggest-loading-${Date.now()}`;
      addSystemMessage("Generating question suggestions...", loadingMsgId, 'chat');
      try {
        const questions = await getSuggestedQuestions(data, mode);
        setChatHistory(prev => prev.filter(m => !m.id.startsWith(loadingMsgId) && !m.id.startsWith('system-suggest-loading'))); 
        if (questions.length > 0) {
          setSuggestedQuestions(questions);
          addSystemMessage("AI has suggested some questions below the chat input.", `suggest-ready-${Date.now()}`, 'success');
        } else {
          addSystemMessage("Could not generate question suggestions at this time.", `suggest-empty-${Date.now()}`, 'info');
        }
      } catch (error) {
        console.error("Error fetching suggested questions:", error);
        setChatHistory(prev => prev.filter(m => !m.id.startsWith(loadingMsgId) && !m.id.startsWith('system-suggest-loading')));
        addSystemMessage("Error generating question suggestions.", `suggest-error-${Date.now()}`, 'warning');
      }
  };

  const handleJsonDataLoad = useCallback((data: Ga4Data) => {
    setGa4Data(data);
    setIsJsonDataLoaded(true);
    addMessageToHistory('GA4 JSON data loaded successfully.', MessageSender.BOT);
    setAppError(null);
    setSuggestedQuestions([]); 
    fetchSuggestedQuestions(data, 'json');
  }, [addMessageToHistory]);

  const handleSheetDataLoad = useCallback((data: SheetData, fileName?: string) => {
    setSheetData(data);
    setIsSheetDataLoaded(true);
    setSheetFileName(fileName);
    const nameText = fileName ? `from "${fileName}" ` : '';
    addMessageToHistory(`Google Sheet data ${nameText}loaded successfully (${data.length} rows).`, MessageSender.BOT);
    setAppError(null);
    setSuggestedQuestions([]); 
    fetchSuggestedQuestions(data, 'googleSheet');
  }, [addMessageToHistory]);

  const handleDocDataLoad = useCallback((data: DocData, fileName?: string) => {
    setDocData(data);
    setIsDocDataLoaded(true);
    setDocFileName(fileName);
    const nameText = fileName ? `from "${fileName}" ` : '';
    addMessageToHistory(`Google Document content ${nameText}loaded successfully (${data.length} characters).`, MessageSender.BOT);
    setAppError(null);
    setSuggestedQuestions([]);
    fetchSuggestedQuestions(data, 'googleDoc');
  }, [addMessageToHistory]);

  const handleSheetError = useCallback((errorMsg: string) => {
    addSystemMessage(errorMsg, `sheet-error-${Date.now()}`, 'error');
    setSheetData(null);
    setIsSheetDataLoaded(false);
    setSuggestedQuestions([]);
  }, [addSystemMessage]);
  
  const handleDocError = useCallback((errorMsg: string) => {
    addSystemMessage(errorMsg, `doc-error-${Date.now()}`, 'error');
    setDocData(null);
    setIsDocDataLoaded(false);
    setSuggestedQuestions([]);
  }, [addSystemMessage]);

  const handleGa4Connect = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => {
      setIsGa4Connected(true);
      setGa4User("simulated.user@example.com");
      addMessageToHistory("Successfully 'connected' to Google Analytics (Simulated).", MessageSender.BOT);
      setIsLoading(false);
      setAppError(null);
      setSuggestedQuestions([]);
    }, 700);
  }, [addMessageToHistory]);

  const handleGa4Disconnect = useCallback(() => {
    setIsGa4Connected(false);
    setGa4User(null);
    addSystemMessage("Disconnected from Google Analytics (Simulated).", "ga4-disconnected", 'config');
    setSuggestedQuestions([]);
  }, [addSystemMessage]);

  const parseBotResponse = (responseText: string): { text: string, chartData?: ChartJsData, tableData?: TableData } => {
    let finalResponseText = responseText;
    let chartData: ChartJsData | undefined;
    let tableData: TableData | undefined;

    const chartStartMarker = '// GEMINI_CHART_DATA_START';
    const chartEndMarker = '// GEMINI_CHART_DATA_END';
    const chartStartIndex = finalResponseText.indexOf(chartStartMarker);
    const chartEndIndex = finalResponseText.indexOf(chartEndMarker, chartStartIndex + chartStartMarker.length);

    if (chartStartIndex !== -1 && chartEndIndex !== -1) {
      const jsonString = finalResponseText.substring(chartStartIndex + chartStartMarker.length, chartEndIndex).trim();
      try {
        const parsed = JSON.parse(jsonString) as ChartJsData;
        if (parsed.type && parsed.data && Array.isArray(parsed.data.labels) && Array.isArray(parsed.data.datasets)) {
          chartData = parsed;
          let textBefore = finalResponseText.substring(0, chartStartIndex).trim();
          let textAfter = finalResponseText.substring(chartEndIndex + chartEndMarker.length).trim();
          finalResponseText = (textBefore && textAfter) ? `${textBefore}\n${textAfter}` : (textBefore || textAfter || (tableData ? "" : "See chart below."));
        } else { console.warn("Parsed chart JSON missing required fields:", parsed); }
      } catch (e) { console.error("Failed to parse chart JSON:", e, "\nJSON:", jsonString); }
    }
    
    const tableStartMarker = '// GEMINI_TABLE_DATA_START';
    const tableEndMarker = '// GEMINI_TABLE_DATA_END';
    const tableStartIndex = finalResponseText.indexOf(tableStartMarker);
    const tableEndIndex = finalResponseText.indexOf(tableEndMarker, tableStartIndex + tableStartMarker.length);

    if (tableStartIndex !== -1 && tableEndIndex !== -1) {
        const jsonString = finalResponseText.substring(tableStartIndex + tableStartMarker.length, tableEndIndex).trim();
        try {
            const parsed = JSON.parse(jsonString) as TableData;
            if (Array.isArray(parsed.headers) && Array.isArray(parsed.rows)) {
                tableData = parsed;
                let textBefore = finalResponseText.substring(0, tableStartIndex).trim();
                let textAfter = finalResponseText.substring(tableEndIndex + tableEndMarker.length).trim();
                finalResponseText = (textBefore && textAfter) ? `${textBefore}\n${textAfter}` : (textBefore || textAfter || (chartData ? "" : "See table below."));
            } else { console.warn("Parsed table JSON missing required fields:", parsed); }
        } catch (e) { console.error("Failed to parse table JSON:", e, "\nJSON:", jsonString); }
    }
    
    finalResponseText = finalResponseText.trim();
    if (!finalResponseText && (chartData || tableData)) {
      finalResponseText = "Analysis complete. See details below.";
    }


    return { text: finalResponseText, chartData, tableData };
  };

  const thinkingIndicator = (
    <div className="flex items-center space-x-1.5">
      <svg className="loading-spinner-svg text-sky-400" aria-hidden="true" focusable="false" role="status"><use href="#loading-spinner"></use></svg>
      <span>{BOT_PROCESSING_TEXT}</span>
    </div>
  );

  const handleSendMessage = useCallback(async (userInput: string, isSuggested: boolean = false) => {
    if (!geminiApiKeyIsSet) {
      addSystemMessage("Cannot send: Gemini API Key is not configured.", 'error-gemini-key', 'error'); return;
    }
    let analysisParams: AnalyzeParams | null = null;
    if (connectionMode === 'json') {
      if (!isJsonDataLoaded || !ga4Data) { addSystemMessage("Load GA4 JSON data first.", 'json-data-missing-query', 'warning'); return; }
      analysisParams = { mode: 'json', jsonData: ga4Data, userQuestion: userInput };
    } else if (connectionMode === 'googleSheet') {
      if (!isSheetDataLoaded || !sheetData) { addSystemMessage("Load Google Sheet data first.", 'sheet-data-missing-query', 'warning'); return; }
      analysisParams = { mode: 'googleSheet', sheetData: sheetData, userQuestion: userInput, fileName: sheetFileName };
    } else if (connectionMode === 'googleDoc') {
      if (!isDocDataLoaded || !docData) { addSystemMessage("Load Google Document content first.", 'doc-data-missing-query', 'warning'); return; }
      analysisParams = { mode: 'googleDoc', docData: docData, userQuestion: userInput, fileName: docFileName };
    } else if (connectionMode === 'ga4') {
      if (!isGa4Connected) { addSystemMessage("'Connect' to Google Analytics first.", 'ga4-not-connected-query', 'warning'); return; }
      analysisParams = { mode: 'ga4', userQuestion: userInput, ga4User };
    } else { addSystemMessage("Select a data connection mode first.", 'mode-not-selected-query', 'warning'); return; }

    addMessageToHistory(userInput, MessageSender.USER);
    setIsLoading(true);
    setAppError(null);
    if (!isSuggested) setSuggestedQuestions([]); 
    
    const thinkingMsgId = `bot-thinking-${Date.now()}`;
    addMessageToHistory(BOT_PROCESSING_TEXT, MessageSender.BOT, undefined, undefined, thinkingIndicator); 

    try {
      if (!analysisParams) throw new Error("Analysis parameters not set."); 
      const rawBotResponse = await analyzeGa4Data(analysisParams);
      setChatHistory(prev => prev.filter(m => !(m.sender === MessageSender.BOT && m.text === BOT_PROCESSING_TEXT && m.icon === thinkingIndicator)));
      const { text: botText, chartData: botChartData, tableData: botTableData } = parseBotResponse(rawBotResponse);
      addMessageToHistory(botText || "Received response.", MessageSender.BOT, botChartData, botTableData);
    } catch (error) {
      console.error("Error processing message:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      setAppError(`Failed to get response: ${errorMessage}`);
      setChatHistory(prev => prev.filter(m => !(m.sender === MessageSender.BOT && m.text === BOT_PROCESSING_TEXT && m.icon === thinkingIndicator)));
      addSystemMessage(`Error: ${errorMessage}. Try again or check console.`, `error-send-${Date.now()}`, 'error');
    } finally {
      setIsLoading(false);
    }
  }, [geminiApiKeyIsSet, connectionMode, isJsonDataLoaded, ga4Data, isSheetDataLoaded, sheetData, sheetFileName, isDocDataLoaded, docData, docFileName, isGa4Connected, ga4User, addMessageToHistory, addSystemMessage]);
  
  const resetAppToModeSelection = useCallback(() => {
    setConnectionMode(null);
    setGa4Data(null);
    setIsJsonDataLoaded(false);
    setSheetData(null);
    setIsSheetDataLoaded(false);
    setSheetFileName(undefined);
    setDocData(null);
    setIsDocDataLoaded(false);
    setDocFileName(undefined);
    setIsGa4Connected(false);
    setGa4User(null);
    const systemMessagesToKeep = chatHistory.filter(m => 
        m.id.includes('gemini-key-error') || 
        m.id.includes('welcome-info') || 
        m.id.includes('table-info') || 
        m.id.includes('suggestions-info') ||
        m.id.startsWith('system-session-restored') 
    );
    setChatHistory(systemMessagesToKeep);
    setAppError(null);
    setSuggestedQuestions([]);
    addSystemMessage("Data connection reset. Please choose a new method.", "app-reset", "config");
  }, [addSystemMessage, chatHistory]);

  const chatDisabled = !geminiApiKeyIsSet || 
                       (connectionMode === 'json' && !isJsonDataLoaded) ||
                       (connectionMode === 'googleSheet' && !isSheetDataLoaded) ||
                       (connectionMode === 'googleDoc' && !isDocDataLoaded) ||
                       (connectionMode === 'ga4' && !isGa4Connected) ||
                       connectionMode === null;
  
  const renderActiveInputSection = () => {
    let sectionContent = null;
    if (connectionMode === 'json') {
      sectionContent = (
        <DataInputSection 
            onDataLoad={handleJsonDataLoad} 
            isDataLoaded={isJsonDataLoaded}
            setIsDataLoaded={setIsJsonDataLoaded} 
            disabled={!geminiApiKeyIsSet} 
            onClearData={() => { 
              setGa4Data(null); setIsJsonDataLoaded(false); setSuggestedQuestions([]);
              addSystemMessage('GA4 JSON data cleared.', 'json-data-cleared-manual', 'config');
            }}
        />
      );
    } else if (connectionMode === 'googleSheet') {
      sectionContent = (
        <GoogleSheetInputSection
          onSheetDataLoad={handleSheetDataLoad}
          onSheetError={handleSheetError}
          isSheetDataLoaded={isSheetDataLoaded}
          disabled={!geminiApiKeyIsSet || isLoading}
          onClearData={() => {
            setSheetData(null); setIsSheetDataLoaded(false); setSheetFileName(undefined); setSuggestedQuestions([]);
            addSystemMessage('Google Sheet data cleared.', 'sheet-data-cleared-manual', 'config');
          }}
        />
      );
    } else if (connectionMode === 'googleDoc') {
      sectionContent = (
        <GoogleDocInputSection
          onDocDataLoad={handleDocDataLoad}
          onDocError={handleDocError}
          isDocDataLoaded={isDocDataLoaded}
          disabled={!geminiApiKeyIsSet || isLoading}
          onClearData={() => {
            setDocData(null); setIsDocDataLoaded(false); setDocFileName(undefined); setSuggestedQuestions([]);
            addSystemMessage('Google Document content cleared.', 'doc-data-cleared-manual', 'config');
          }}
        />
      );
    } else if (connectionMode === 'ga4') {
      sectionContent = (
        <Ga4ConnectSection
          isConnected={isGa4Connected}
          onConnect={handleGa4Connect}
          onDisconnect={handleGa4Disconnect}
          isLoading={isLoading && chatHistory.some(m=>m.sender === MessageSender.BOT && m.text.toString().includes("Successfully 'connected'"))} 
          disabled={!geminiApiKeyIsSet} 
          googleClientIdIsSet={googleClientIdIsSet}
        />
      );
    }
    return sectionContent ? <div className="animate-fadeInSoft">{sectionContent}</div> : null;
  };


  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Header onClearSession={clearSession} />
      <ApiConfigStatus 
        geminiApiKeyIsSet={geminiApiKeyIsSet} 
        googleClientIdIsSet={googleClientIdIsSet}
        connectionMode={connectionMode}
      />
      
      <main className="flex-grow container mx-auto px-2 sm:px-4 py-1.5">
        {appError && (
          <div className="bg-red-600/80 text-white p-2.5 rounded-lg my-2 text-center text-xs shadow-lg max-w-3xl mx-auto animate-fadeInSoft">
            <SystemMessageIcon type="error" />
            <strong>Application Error:</strong> {appError}
            <button onClick={() => setAppError(null)} className="ml-3 text-sm underline hover:text-red-200">Dismiss</button>
          </div>
        )}

        {!geminiApiKeyIsSet ? (
          <div className="p-4 bg-slate-800 shadow-lg rounded-lg my-4 mx-auto max-w-3xl text-center animate-fadeInSoft">
            <p className="text-md text-yellow-300"><SystemMessageIcon type="error" />Application is not functional.</p>
            <p className="text-slate-300 mt-1.5 text-xs">Please ensure Gemini API Key (API_KEY) is correctly configured.</p>
          </div>
        ) : (
          <>
            {connectionMode === null && (
              <div className="animate-fadeInSoft">
                <ConnectionModeSelector 
                  onSelectMode={setConnectionMode} 
                  googleClientIdIsSet={googleClientIdIsSet}
                />
              </div>
            )}

            {renderActiveInputSection()}
            
            {(connectionMode) && (
                 <button 
                    onClick={resetAppToModeSelection}
                    className="my-2 text-xs text-sky-400 hover:text-sky-300 underline mx-auto block max-w-3xl text-left pl-1 hover:opacity-80 transition-opacity"
                  >
                    &larr; Change data source
                  </button>
            )}

            <div className={`${!connectionMode ? 'opacity-50 pointer-events-none' : 'animate-fadeInSoft'}`}>
              <ChatInterface
                messages={chatHistory}
                onSendMessage={(msg) => handleSendMessage(msg, false)}
                isLoading={isLoading}
                disabled={chatDisabled || isLoading}
                suggestedQuestions={suggestedQuestions}
                onSendSuggestedQuestion={(question) => {
                  handleSendMessage(question, true); 
                }}
              />
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default App;

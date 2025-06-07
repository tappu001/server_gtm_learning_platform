
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import ChatMessageDisplay from './ChatMessageDisplay';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (messageText: string) => Promise<void>;
  isLoading: boolean;
  disabled: boolean; 
  suggestedQuestions?: string[];
  onSendSuggestedQuestion: (question: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isLoading, 
  disabled,
  suggestedQuestions,
  onSendSuggestedQuestion
}) => {
  const [userInput, setUserInput] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(event.target.value);
  }, []);

  const handleSubmit = useCallback(async (event?: React.FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();
    if (userInput.trim() && !isLoading && !disabled) {
      await onSendMessage(userInput.trim());
      setUserInput('');
    }
  }, [userInput, isLoading, disabled, onSendMessage]);
  
  const handleSuggestedQuestionClick = useCallback((question: string) => {
    if (!isLoading && !disabled) {
      onSendSuggestedQuestion(question);
    }
  }, [isLoading, disabled, onSendSuggestedQuestion]);

  const handleKeyPress = useCallback(async (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !isLoading && !disabled) {
      event.preventDefault();
      await handleSubmit();
    }
  }, [handleSubmit, isLoading, disabled]);

  return (
    <div className="p-4 sm:p-5 bg-slate-800 shadow-xl rounded-xl my-4 mx-auto max-w-3xl flex flex-col h-[calc(100vh-450px)] min-h-[320px] sm:h-[calc(100vh-400px)] sm:min-h-[380px]">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-semibold text-sky-300">Chat with Your Data</h2>
      </div>
      
      {messages.length === 0 && !isLoading && (
         <div className="flex-grow flex items-center justify-center">
          <p className="text-slate-400 text-center p-3 text-xs bg-slate-700/60 rounded-lg">
            {disabled ? "Complete data setup above to start chatting." : "No messages yet. Ask a question or try a suggestion!"}
          </p>
        </div>
      )}

      <div className="flex-grow overflow-y-auto mb-3 pr-1.5 space-y-1 scrollbar-thin">
        {messages.map((msg) => (
          <ChatMessageDisplay key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {suggestedQuestions && suggestedQuestions.length > 0 && !disabled && (
        <div className="mb-2.5 pt-2 border-t border-slate-700">
          <p className="text-xs text-slate-400 mb-1.5">Suggestions:</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSuggestedQuestionClick(q)}
                className="px-2.5 py-1 bg-sky-700 hover:bg-sky-600 text-sky-100 text-xs rounded-lg shadow-sm transition-all hover:shadow-md active:scale-95 btn-action"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-center space-x-2 pt-3 border-t border-slate-700/70">
        <textarea
          value={userInput}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={disabled ? "Complete data setup to chat..." : "Ask a question (e.g., 'show page views by country')..."}
          className="flex-grow p-2.5 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 text-sm focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:border-sky-500 transition-colors resize-none disabled:opacity-60 disabled:cursor-not-allowed placeholder-slate-400"
          rows={1}
          disabled={isLoading || disabled}
          aria-label="Chat input"
        />
        <button
          type="submit"
          disabled={isLoading || disabled || !userInput.trim()}
          className="p-2.5 bg-gradient-to-br from-sky-500 to-sky-700 hover:from-sky-600 hover:to-sky-800 text-white font-medium rounded-lg shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:ring-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center btn-action"
          style={{ minHeight: '2.75rem', minWidth: '2.75rem'}} 
          aria-label="Send message"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
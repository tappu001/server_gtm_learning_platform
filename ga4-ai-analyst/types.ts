
export enum MessageSender {
  USER = 'user',
  BOT = 'bot',
  SYSTEM = 'system'
}

export interface ChartJsDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
  // Allow other Chart.js specific dataset properties
  [key: string]: any; 
}

export interface ChartJsData {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea';
  data: {
    labels: string[];
    datasets: ChartJsDataset[];
  };
  options?: {
    responsive?: boolean;
    maintainAspectRatio?: boolean;
    plugins?: {
      legend?: {
        display?: boolean;
        position?: 'top' | 'bottom' | 'left' | 'right' | 'chartArea';
        labels?: {
          color?: string;
          font?: { size?: number }; // Default 11
          boxWidth?: number;
          padding?: number;
        }
      };
      title?: {
        display?: boolean;
        text?: string;
        color?: string;
        font?: {
            size?: number; // Default 14
            weight?: string | number;
        };
        padding?: { top?: number, bottom?: number };
      };
      tooltip?: {
        enabled?: boolean;
        mode?: 'index' | 'point' | 'nearest' | 'dataset' | 'x' | 'y';
        intersect?: boolean;
        backgroundColor?: string;
        titleColor?: string;
        titleFont?: { weight?: string | number; size?: number}; // Default 12
        bodyColor?: string;
        bodyFont?: { size?: number }; // Default 11
        borderColor?: string;
        borderWidth?: number;
        padding?: number;
        caretPadding?: number;
        cornerRadius?: number;
        boxPadding?: number;
      }
    };
    scales?: {
      x?: {
        display?: boolean;
        border?: { display?: boolean; color?: string; };
        grid?: { display?: boolean; color?: string; drawBorder?: boolean; };
        ticks?: { 
          color?: string; 
          font?: { size?: number }; // Default 10
          maxRotation?: number; 
          minRotation?: number; 
          [key: string]: any; 
        };
        title?: { display?: boolean; text?: string; color?: string; font?: { size?: number; weight?: string}}; // Default 11
      };
      y?: {
        display?: boolean;
        border?: { display?: boolean; color?: string; };
        grid?: { display?: boolean; color?: string; drawBorder?: boolean; };
        ticks?: { 
          color?: string; 
          font?: { size?: number }; // Default 10
          maxRotation?: number; 
          minRotation?: number; 
          [key: string]: any;
        };
        beginAtZero?: boolean;
        title?: { display?: boolean; text?: string; color?: string; font?: { size?: number; weight?: string}}; // Default 11
      };
    };
    animation?: {
        duration?: number;
        easing?: string; 
    };
    layout?: {
        padding?: number | { top?: number; right?: number; bottom?: number; left?: number; };
    }
    [key: string]: any; 
  };
}

export interface TableData {
  headers: string[];
  rows: (string | number)[][];
}

export interface ChatMessage {
  id: string;
  text: string; // Can be simple text or text with markdown for code blocks
  sender: MessageSender;
  timestamp: Date;
  chartData?: ChartJsData;
  tableData?: TableData; // For structured table rendering
  avatarUrl?: string; // For bot avatar
  icon?: React.ReactNode; // For system messages
}

export type Ga4Data = any; // Representing parsed JSON from GA4
export type SheetData = Record<string, string | number>[]; // Array of objects for sheet rows
export type DocData = string; // Text content from a Google Document

export type ConnectionMode = 'json' | 'ga4' | 'googleSheet' | 'googleDoc' | null;

// For Local Storage
export interface AppStateToStore {
  chatHistory: ChatMessage[];
  connectionMode: ConnectionMode;
  isJsonDataLoaded: boolean;
  ga4DataSummary?: { fileName?: string, rowCount?: number, headers?: string[] }; 
  isSheetDataLoaded: boolean;
  sheetDataSummary?: { fileName?: string, rowCount?: number, headers?: string[] };
  isDocDataLoaded?: boolean; // New
  docDataSummary?: { fileName?: string, charCount?: number }; // New
  isGa4Connected: boolean; 
  ga4User: string | null;
}